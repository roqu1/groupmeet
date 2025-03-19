import React, { useState, useEffect } from 'react';
import { Input } from '../ui/input.tsx';

interface FormErrors {
  gender?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const RegisterForm = () => {
  const [gender, setGender] = useState<'männlich' | 'weiblich' | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({
    email: false,
    password: false,
    confirmPassword: false,
    gender: false,
    firstName: false,
    lastName: false,
    nickname: false,
  });
  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    validateForm();
  }, [gender, email, password, confirmPassword, touched]);

  const validateForm = () => {
    const newErrors: FormErrors = {};
    let newIsFormValid = true;

    if (
      !gender &&
      (touched.firstName ||
        touched.lastName ||
        touched.nickname ||
        touched.email ||
        touched.password ||
        touched.confirmPassword)
    ) {
      newErrors.gender = 'Bitte wählen Sie Ihr Geschlecht aus.';
      newIsFormValid = false;
    }

    if (!email) {
      if (touched.email) {
        newErrors.email = 'Bitte geben Sie Ihre E-Mail-Adresse ein.';
        newIsFormValid = false;
      }
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      if (touched.email) {
        newErrors.email = 'Bitte geben Sie eine gültige E-Mail-Adresse ein.';
        newIsFormValid = false;
      }
    }
    if (!password) {
      if (touched.password) {
        newErrors.password = 'Bitte geben Sie Ihr Passwort ein.';
        newIsFormValid = false;
      }
    } else if (password.length < 8) {
      if (touched.password) {
        newErrors.password = 'Das Passwort muss mindestens 8 Zeichen lang sein.';
        newIsFormValid = false;
      }
    } else if (!/\d/.test(password)) {
      if (touched.password) {
        newErrors.password = 'Das Passwort muss mindestens eine Ziffer enthalten.';
        newIsFormValid = false;
      }
    } else if (!/[A-Z]/.test(password)) {
      if (touched.password) {
        newErrors.password = 'Das Passwort muss mindestens einen Großbuchstaben enthalten.';
        newIsFormValid = false;
      }
    } else if (!/[!@#$%^&*]/.test(password)) {
      if (touched.password) {
        newErrors.password = 'Das Passwort muss mindestens ein Sonderzeichen (!@#$%^&*) enthalten.';
        newIsFormValid = false;
      }
    }
    if (!confirmPassword) {
      if (touched.confirmPassword) {
        newErrors.confirmPassword = 'Bitte bestätigen Sie Ihr Passwort.';
        newIsFormValid = false;
      }
    } else if (password !== confirmPassword) {
      if (touched.confirmPassword) {
        newErrors.confirmPassword = 'Die Passwörter stimmen nicht überein.';
        newIsFormValid = false;
      }
    }

    setErrors(newErrors);
    setIsFormValid(newIsFormValid);
    return newErrors;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    setTouched((prev) => ({ ...prev, [id]: true }));

    switch (id) {
      case 'firstName':
        setFirstName(value);
        break;
      case 'lastName':
        setLastName(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'password':
        setPassword(value);
        break;
      case 'confirmPassword':
        setConfirmPassword(value);
        break;
      case 'nickname':
        setNickname(value);
        break;
      default:
        break;
    }
    validateForm();
  };

  const handleGenderChange = (newGender: 'männlich' | 'weiblich') => {
    setGender(newGender);
    setTouched((prev) => ({ ...prev, gender: true }));
    validateForm();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validateForm();

    if (isFormValid) {
      console.log('Form data:', { gender, firstName, lastName, email, password, nickname });

      setGender(null);
      setFirstName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setNickname('');
      setErrors({});
      setTouched({
        email: false,
        password: false,
        confirmPassword: false,
        gender: false,
        firstName: false,
        lastName: false,
        nickname: false,
      });
      setIsFormValid(false);
    }
  };

  return (
    <form className="max-w-md mx-auto bg-white rounded-md shadow-md p-6" onSubmit={handleSubmit}>
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Geschlecht:</h2>
        <div className="flex gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="gender"
              value="männlich"
              checked={gender === 'männlich'}
              onChange={() => handleGenderChange('männlich')}
              className="h-4 w-4"
            />
            <span>männlich</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="gender"
              value="weiblich"
              checked={gender === 'weiblich'}
              onChange={() => handleGenderChange('weiblich')}
              className="h-4 w-4"
            />
            <span>weiblich</span>
          </label>
        </div>
        {errors.gender && touched.gender && (
          <p className="text-red-500 text-sm mt-1">{errors.gender}</p>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="nickname">Benutzername</label>
        <Input
          type="text"
          id="nickname"
          placeholder="Geben Sie Ihren Benutzernamen ein"
          value={nickname}
          onChange={handleInputChange}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="firstName">Vorname</label>
        <Input
          type="text"
          id="firstName"
          placeholder="Geben Sie Ihren Vornamen ein"
          value={firstName}
          onChange={handleInputChange}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="lastName">Nachname</label>
        <Input
          type="text"
          id="lastName"
          placeholder="Geben Sie Ihren Nachnamen ein"
          value={lastName}
          onChange={handleInputChange}
        />
      </div>

      <div className="mb-4">
        <label htmlFor="email">Email</label>
        <Input
          type="email"
          id="email"
          placeholder="Geben Sie Ihre E-Mail ein"
          value={email}
          onChange={handleInputChange}
        />
        {errors.email && touched.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email}</p>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="password">Passwort</label>
        <Input
          type="password"
          id="password"
          placeholder="Geben Sie Ihr Passwort ein"
          value={password}
          onChange={handleInputChange}
        />
        {errors.password && touched.password && (
          <p className="text-red-500 text-sm mt-1">{errors.password}</p>
        )}
      </div>

      <div className="mb-4">
        <label htmlFor="confirmPassword">Passwort wiederholen</label>
        <Input
          type="password"
          id="confirmPassword"
          placeholder="Wiederholen Sie bitte Ihr Passwort"
          value={confirmPassword}
          onChange={handleInputChange}
        />
        {errors.confirmPassword && touched.confirmPassword && (
          <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
        )}
      </div>

      <button
        type="submit"
        className="w-full bg-gray-800 text-white py-2 px-4 rounded disabled:opacity-50"
        disabled={!isFormValid}
      >
        Registrieren
      </button>
    </form>
  );
};

export default RegisterForm;
