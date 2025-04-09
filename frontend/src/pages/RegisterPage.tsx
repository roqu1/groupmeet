import { Link } from 'react-router-dom';
import RegisterForm from '../components/auth/RegisterForm';

const RegisterPage = () => {
  return (
    <div className="container-wrapper">
      <h1 className="text-5xl font-bold mb-1 text-center">Registrieren</h1>
      <p className="text-gray-600 mb-6 text-center">
        Bereits ein Mitglied?{' '}
        <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
          Anmelden
        </Link>
      </p>
      <RegisterForm />
    </div>
  );
};

export default RegisterPage;
