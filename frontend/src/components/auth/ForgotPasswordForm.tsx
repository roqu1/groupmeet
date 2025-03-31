import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Mail } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'E-Mail ist erforderlich' })
    .email({ message: 'Ungültige E-Mail-Adresse' }),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPasswordForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onTouched',
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    console.log('Forgot password requested for:', data.email);
    // TODO: Implement API call to request password reset link.
  };
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-sm text-destructive" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <Button type="submit" className="w-full" disabled={!isValid}>
          Senden
        </Button>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;
