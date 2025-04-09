import { Link } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';

const LoginPage = () => {
  return (
    <div className="container-wrapper">
      <h1 className="text-5xl font-bold mb-1 text-center">Anmelden</h1>
      <p className="text-gray-600 mb-6 text-center">
        Noch kein Mitglied?{' '}
        <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
          Registrieren
        </Link>
      </p>
      <LoginForm />
    </div>
  );
};

export default LoginPage;
