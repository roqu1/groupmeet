import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Mail, Loader2, AlertCircle, CheckCircle, Timer } from 'lucide-react';
import { useForgotPassword } from '../../hooks/auth/useForgotPassword';
import { ApiError } from '../../hooks/useHttp';

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'E-Mail ist erforderlich' })
    .email({ message: 'Ungültige E-Mail-Adresse' }),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const COOLDOWN_STORAGE_KEY = 'resetCooldownEnd';
const COOLDOWN_DURATION_MS = 2 * 60 * 1000;

const ForgotPasswordForm = () => {
  const {
    sendPasswordResetLink,
    isLoading: isApiLoading,
    error: apiError,
    successMessage,
    clearStatus,
  } = useForgotPassword();

  const [cooldownEndTime, setCooldownEndTime] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [rateLimitError, setRateLimitError] = useState<ApiError | null>(null);
  const [initialRequestDone, setInitialRequestDone] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onTouched',
  });

  const emailValue = watch('email');

  useEffect(() => {
    const storedEndTime = localStorage.getItem(COOLDOWN_STORAGE_KEY);
    if (storedEndTime) {
      const endTime = parseInt(storedEndTime, 10);
      const now = Date.now();
      if (endTime > now) {
        setCooldownEndTime(endTime);
        setRemainingSeconds(Math.ceil((endTime - now) / 1000));
        setInitialRequestDone(true);
      } else {
        localStorage.removeItem(COOLDOWN_STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;
    if (cooldownEndTime && cooldownEndTime > Date.now()) {
      setRemainingSeconds(Math.ceil((cooldownEndTime - Date.now()) / 1000));
      intervalId = setInterval(() => {
        const now = Date.now();
        const remaining = Math.ceil((cooldownEndTime - now) / 1000);
        if (remaining <= 0) {
          setRemainingSeconds(0);
          setCooldownEndTime(null);
          localStorage.removeItem(COOLDOWN_STORAGE_KEY);
          setRateLimitError(null);
          setInitialRequestDone(false);
          clearInterval(intervalId);
        } else {
          setRemainingSeconds(remaining);
        }
      }, 1000);
    } else if (cooldownEndTime && cooldownEndTime <= Date.now()) {
      setRemainingSeconds(0);
      setCooldownEndTime(null);
      localStorage.removeItem(COOLDOWN_STORAGE_KEY);
      setRateLimitError(null);
      setInitialRequestDone(false);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [cooldownEndTime]);

  useEffect(() => {
    if (initialRequestDone && (successMessage || apiError || rateLimitError)) {
      clearStatus();
      setRateLimitError(null);
    }
  }, [emailValue, initialRequestDone, apiError, clearStatus, rateLimitError, successMessage]);

  useEffect(() => {
    return () => {
      clearStatus();
      setRateLimitError(null);
    };
  }, [clearStatus]);

  const onSubmit = async (data: ForgotPasswordFormData) => {
    if (remainingSeconds > 0 || isApiLoading) return;

    setRateLimitError(null);
    setInitialRequestDone(true);

    try {
      await sendPasswordResetLink(data.email);
      const endTime = Date.now() + COOLDOWN_DURATION_MS;
      localStorage.setItem(COOLDOWN_STORAGE_KEY, endTime.toString());
      setCooldownEndTime(endTime);
      setRemainingSeconds(Math.ceil(COOLDOWN_DURATION_MS / 1000));
    } catch (caughtError) {
      const error = caughtError as ApiError;
      if (error.statusCode === 429 && error.retryAfterSeconds) {
        setRateLimitError(error);
        const endTime = Date.now() + error.retryAfterSeconds * 1000;
        localStorage.setItem(COOLDOWN_STORAGE_KEY, endTime.toString());
        setCooldownEndTime(endTime);
        setRemainingSeconds(error.retryAfterSeconds);
      } else {
        console.error('API Error in onSubmit:', error);
        setInitialRequestDone(false);
      }
    }
  };

  const isCooldownActive = remainingSeconds > 0;
  const isSubmitDisabled = !isValid || isApiLoading || isCooldownActive;
  const isInputDisabled = isApiLoading;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {successMessage && !isApiLoading && !apiError && !rateLimitError && (
        <div className="mb-4 p-3 border border-green-500/50 bg-green-500/10 text-green-700 rounded flex items-center gap-2 text-sm">
          <CheckCircle className="h-8 w-8" />
          {successMessage}
        </div>
      )}
      {rateLimitError && (
        <div className="mb-4 p-3 border border-orange-500/50 bg-orange-500/10 text-orange-700 rounded flex items-center gap-2 text-sm">
          <Timer className="h-4 w-4" />
          {rateLimitError.message} Bitte warten Sie {remainingSeconds} Sekunden.
        </div>
      )}
      {apiError && !isApiLoading && !rateLimitError && (
        <div className="mb-4 p-3 border border-destructive/50 bg-destructive/10 text-destructive rounded flex items-center gap-2 text-sm">
          <AlertCircle className="h-4 w-4" />
          {apiError.message || 'Es ist ein Fehler beim Senden der Anfrage aufgetreten.'}
        </div>
      )}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          E-Mail
        </label>
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="E-Mail Adresse"
            className="pl-9 w-full"
            aria-invalid={errors.email ? 'true' : 'false'}
            disabled={isInputDisabled}
          />
        </div>
        {errors.email && !isCooldownActive && !rateLimitError && (
          <p className="mt-1 text-sm text-destructive" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>
      <div>
        <Button type="submit" className="w-full" disabled={isSubmitDisabled}>
          {isApiLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Senden...
            </>
          ) : isCooldownActive ? (
            `Bitte warten Sie ${remainingSeconds} Sekunden.`
          ) : (
            'Passwort zurücksetzen'
          )}
        </Button>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;
