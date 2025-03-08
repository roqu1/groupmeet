import { useState, useEffect } from 'react';
import { API_CONFIG } from '../config/api';

const TestConnection = () => {
  const [message, setMessage] = useState<string>('Loading...');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoints.test}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
      })
      .then((data) => setMessage(data))
      .catch((err) => setError('Error connecting to backend: ' + err.message));
  }, []);

  return (
    <div className="p-5">
      <h2 className="text-xl font-bold mb-3">Backend Connection Test</h2>
      {error ? <p className="text-red-500">{error}</p> : <p>{message}</p>}
    </div>
  );
};

export default TestConnection;
