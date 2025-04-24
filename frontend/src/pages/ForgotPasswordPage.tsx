import { Link } from 'react-router-dom';
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm';

const ForgotPasswordPage = () => {
  return (
    <div className="flex flex-grow flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">Passwort vergessen?</h1>
        </div>

        <div className="bg-background p-8 border border-t-0 border-gray-200 rounded-lg shadow-md">
          <ForgotPasswordForm />
        </div>

        <div className="text-center text-sm text-gray-600">
          Noch kein Mitglied?{' '}
          <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
            Registrieren
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
