import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '../ui/input.tsx';
import { Button } from '../ui/button.tsx';
import { User, Mail, Lock, UserCheck } from 'lucide-react';

const registerSchema = z
  .object({
    gender: z.enum(['männlich', 'weiblich'], {
      required_error: 'Bitte wählen Sie Ihr Geschlecht aus',
    }),
    nickname: z.string().min(4, 'Benutzername ist erforderlich'),
    firstName: z.string().min(1, 'Vorname ist erforderlich'),
    lastName: z.string().min(1, 'Nachname ist erforderlich'),
    email: z.string().email('Ungültige E-Mail-Adresse'),
    password: z
      .string()
      .min(8, 'Das Passwort muss mindestens 8 Zeichen lang sein')
      .regex(/[A-Z]/, 'Das Passwort muss mindestens einen Großbuchstaben enthalten')
      .regex(/\d/, 'Das Passwort muss mindestens eine Ziffer enthalten')
      .regex(/[!@#$%^&*]/, 'Das Passwort muss mindestens ein Sonderzeichen (!@#$%^&*) enthalten'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Die Passwörter stimmen nicht überein',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
    criteriaMode: 'all',
  });

  const onSubmit = () => {
    reset();
  };

  return (
    <form
      className="max-w-md mx-auto bg-background rounded-md shadow-md p-6"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Geschlecht:</h2>
        <div className="flex gap-4">
          <label className="flex items-center space-x-2">
            <input type="radio" value="männlich" {...register('gender')} className="h-4 w-4" />
            <span>männlich</span>
          </label>
          <label className="flex items-center space-x-2">
            <input type="radio" value="weiblich" {...register('gender')} className="h-4 w-4" />
            <span>weiblich</span>
          </label>
        </div>
        {errors.gender && <p className="text-destructive text-sm mt-1">{errors.gender.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-4 w-4 text-gray-400" />
            </div>
            <Input type="text" {...register('firstName')} placeholder="Vorname" className="pl-9" />
          </div>
          {errors.firstName && (
            <p className="text-destructive text-sm mt-1">{errors.firstName.message}</p>
          )}
        </div>

        <div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-4 w-4 text-gray-400" />
            </div>
            <Input type="text" {...register('lastName')} placeholder="Nachname" className="pl-9" />
          </div>
          {errors.lastName && (
            <p className="text-destructive text-sm mt-1">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div className="mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <UserCheck className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            type="text"
            {...register('nickname')}
            placeholder="Benutzername"
            className="pl-9"
          />
        </div>
        {errors.nickname && (
          <p className="text-destructive text-sm mt-1">{errors.nickname.message}</p>
        )}
      </div>

      <div className="mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            type="email"
            {...register('email')}
            placeholder="E-Mail Adresse"
            className="pl-9"
          />
        </div>
        {errors.email && <p className="text-destructive text-sm mt-1">{errors.email.message}</p>}
      </div>

      <div className="mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            type="password"
            {...register('password')}
            placeholder="Passwort"
            className="pl-9"
          />
        </div>
        {errors.password && (
          <p className="text-destructive text-sm mt-1">{errors.password.message}</p>
        )}
      </div>

      <div className="mb-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            type="password"
            {...register('confirmPassword')}
            placeholder="Passwort wiederholen"
            className="pl-9"
          />
        </div>
        {errors.confirmPassword && (
          <p className="text-destructive text-sm mt-1">{errors.confirmPassword.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={!isValid}>
        Registrieren
      </Button>
    </form>
  );
};

export default RegisterForm;
