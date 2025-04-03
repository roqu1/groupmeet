import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react';

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

  // useEffect(() => {
  //   // TODO: Implement API call to validate the token on component mount
  //   // If token is invalid, show an error message or redirect
  //   console.log('Validating token:', token);
  // }, [token]);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onTouched',
  });

  const onSubmit = (data: ResetPasswordFormData) => {
    console.log('Submitting new password with token:', token);
    console.log('New password:', data.newPassword);
    setIsSubmitted(true);
    reset();
  };

  const toggleShowPassword = () => setShowPassword(!showPassword);
  const toggleShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  if (isSubmitted) {
    return (
      <div className="text-center space-y-4">
        <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
        <h3 className="text-lg font-medium text-gray-900">Passwort erfolgreich zurückgesetzt</h3>
        <p className="text-sm text-gray-600">
          Sie können sich jetzt mit Ihrem neuen Passwort anmelden.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" // Стилизуем как кнопку
        >
          Zum Login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
            placeholder="Neues Passwort eingeben"
            className="pl-9 pr-10 w-full"
            aria-invalid={errors.newPassword ? 'true' : 'false'}
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              type="button"
              onClick={toggleShowPassword}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
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
            placeholder="Neues Passwort wiederholen"
            className="pl-9 pr-10 w-full"
            aria-invalid={errors.confirmPassword ? 'true' : 'false'}
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              type="button"
              onClick={toggleShowConfirmPassword}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
              aria-label={
                showConfirmPassword ? 'Hide confirmation password' : 'Show confirmation password'
              }
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
        <Button type="submit" className="w-full" disabled={!isValid}>
          Passwort speichern
        </Button>
      </div>
    </form>
  );
};

export default ResetPasswordForm;
