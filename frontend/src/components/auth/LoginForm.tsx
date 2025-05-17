import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { useLogin } from '../../hooks/auth/useLogin';

const loginSchema = z.object({
  usernameOrEmail: z.string().min(1, { message: 'Benutzername oder E-Mail ist erforderlich' }),
  password: z.string().min(1, { message: 'Passwort ist erforderlich' }),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { loginUser, isLoading, error, clearError } = useLogin();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
  });

  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      await loginUser({
        usernameOrEmail: data.usernameOrEmail,
        password: data.password,
      });
      reset();
      navigate('/');
    } catch (err) {
      console.error('Login failed:', err);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <form
      className="max-w-md mx-auto bg-background rounded-md shadow-md p-6"
      onSubmit={handleSubmit(onSubmit)}
    >
      {error && (
        <div className="mb-4 p-3 border border-destructive/50 bg-destructive/10 text-destructive rounded flex items-center gap-2 text-sm">
          <AlertCircle className="h-4 w-4" />
          {error.message}
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="usernameOrEmail" className="block text-sm font-medium text-gray-700 mb-1">
          Benutzername oder E-Mail
        </label>
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-4 w-4 text-gray-400" />
          </div>
          <Input
            id="usernameOrEmail"
            type="text"
            {...register('usernameOrEmail')}
            placeholder="Benutzername oder E-Mail"
            className="pl-9 w-full"
            aria-invalid={errors.usernameOrEmail ? 'true' : 'false'}
            onChange={() => error && clearError()}
          />
        </div>

        {errors.usernameOrEmail && (
          <p className="mt-1 text-sm text-destructive" role="alert">
            {errors.usernameOrEmail.message}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          Passwort
        </label>
        <div className="relative rounded-md shadow-sm">
          {' '}
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-4 w-4 text-gray-400" />
          </div>{' '}
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            {...register('password', {
              onChange: () => {
                clearError();
              },
            })}
            placeholder="Passwort"
            className="pl-9 pr-10 w-full"
            aria-invalid={errors.password ? 'true' : 'false'}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSubmit((data) => {
                  onSubmit(data);
                })();
              }
            }}
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
              aria-label={showPassword ? 'Passwort verbergen' : 'Passwort anzeigen'}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {errors.password && (
          <p className="mt-1 text-sm text-destructive" role="alert">
            {errors.password.message}
          </p>
        )}
      </div>

      <div className="mb-4">
        <div className="text-sm">
          <Link to="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
            Passwort vergessen?
          </Link>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Wird angemeldet...
          </>
        ) : (
          'Anmelden'
        )}
      </Button>
    </form>
  );
};

export default LoginForm;
