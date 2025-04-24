import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Lock, Eye, EyeOff, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { useResetPassword } from '../../hooks/auth/useResetPassword';

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, { message: 'Das Passwort muss mindestens 8 Zeichen lang sein' })
      .regex(/[A-Z]/, { message: 'Das Passwort muss mindestens einen Großbuchstaben enthalten' })
      .regex(/\d/, { message: 'Das Passwort muss mindestens eine Ziffer enthalten' })
      .regex(/[!@#$%^&*]/, {
        message: 'Das Passwort muss mindestens ein Sonderzeichen (!@#$%^&*) enthalten',
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Die Passwörter stimmen nicht überein',
    path: ['confirmPassword'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordFormProps {
  token: string;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ token }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { submitResetPassword, isLoading, error, data, clearStatus } = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onTouched',
  });

  useEffect(() => {
    return () => {
      clearStatus();
    };
  }, [clearStatus, token]);

  const onSubmit = async (formData: ResetPasswordFormData) => {
    clearStatus();
    try {
      await submitResetPassword(token, formData.newPassword);
      setIsSubmitted(true);
      reset();
    } catch (err) {
      console.error('Password reset failed:', err);
    }
  };

  const toggleShowPassword = () => setShowPassword(!showPassword);
  const toggleShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  if (isSubmitted && data) {
    return (
      <div className="text-center space-y-4">
        <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
        <h3 className="text-lg font-medium text-gray-900">Passwort erfolgreich zurückgesetzt</h3>
        <p className="text-sm text-gray-600">
          {data.message || 'Sie können sich mit dem neuen Passwort anmelden.'}
        </p>
        <Link
          to="/login"
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Zur Login-Seite
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="mb-4 p-3 border border-destructive/50 bg-destructive/10 text-destructive rounded flex items-center gap-2 text-sm">
          <AlertCircle className="h-4 w-4" />
          {error.message || 'Passwort konnte nicht zurückgesetzt werden.'}
        </div>
      )}

      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
          Neues Passwort
        </label>
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            id="newPassword"
            type={showPassword ? 'text' : 'password'}
            {...register('newPassword')}
            placeholder="Geben Sie ein neues Passwort ein"
            className="pl-9 pr-10 w-full"
            aria-invalid={errors.newPassword ? 'true' : 'false'}
            disabled={isLoading}
            onChange={() => error && clearStatus()}
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              type="button"
              onClick={toggleShowPassword}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
              aria-label={showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
              disabled={isLoading}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {errors.newPassword && (
          <p className="mt-1 text-sm text-destructive" role="alert">
            {errors.newPassword.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
          Passwort bestätigen
        </label>
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            {...register('confirmPassword')}
            placeholder="Wiederholen Sie das neue Passwort"
            className="pl-9 pr-10 w-full"
            aria-invalid={errors.confirmPassword ? 'true' : 'false'}
            disabled={isLoading}
            onChange={() => error && clearStatus()}
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              type="button"
              onClick={toggleShowConfirmPassword}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
              aria-label={
                showConfirmPassword
                  ? 'Bestätigungspasswort verbergen'
                  : 'Bestätigungspasswort anzeigen'
              }
              disabled={isLoading}
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-destructive" role="alert">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <div>
        <Button type="submit" className="w-full" disabled={!isValid || isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Speichern...
            </>
          ) : (
            'Passwort speichern'
          )}
        </Button>
      </div>
    </form>
  );
};

export default ResetPasswordForm;
