import { Link } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';

const LoginPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-4">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900">Anmelden</h1>
          <p className="mt-2 text-gray-600">
            Noch kein Mitglied?{' '}
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
              Registrieren
            </Link>
          </p>
        </div>

        <div className="bg-background p-8 border border-t-0 border-gray-200 rounded-lg shadow-md">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
