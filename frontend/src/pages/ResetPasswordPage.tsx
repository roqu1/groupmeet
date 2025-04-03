import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import ResetPasswordForm from '../components/auth/ResetPasswordForm';

const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const displayToken = token || 'dummy-token-for-testing';

  return (
    <div className="flex flex-grow flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">Neues Passwort festlegen</h1>
        </div>

        <div className="bg-background p-8 border border-t-0 border-gray-200 rounded-lg shadow-md">
          {displayToken ? (
            <ResetPasswordForm token={displayToken} />
          ) : (
            <div className="text-center text-destructive space-y-4">
              <h3 className="text-lg font-medium">Ungültiger Link</h3>
              <p className="text-sm">
                Der Link zum Zurücksetzen des Passworts ist ungültig oder fehlt. Bitte fordern Sie
                einen neuen Link an.
              </p>
              <Link
                to="/forgot-password"
                className="inline-block mt-4 font-medium text-blue-600 hover:text-blue-500"
              >
                Passwort vergessen?
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
