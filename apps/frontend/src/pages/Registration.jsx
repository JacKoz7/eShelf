import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from '../App';

function Registration() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { setAuthState } = useContext(AuthContext);
  const navigate = useNavigate();

  // Funkcja walidująca email
  const validateEmail = (email) => {
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    return emailRegex.test(email);
  };

  // Walidacja formularza
  const validateForm = () => {
    const newErrors = {};
    
    // Walidacja email
    if (!email) {
      newErrors.email = 'Email jest wymagany';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Podaj prawidłowy adres email';
    }
    
    // Walidacja hasła
    if (!password) {
      newErrors.password = 'Hasło jest wymagane';
    } else if (password.length < 6) {
      newErrors.password = 'Hasło musi mieć co najmniej 6 znaków';
    }
    
    // Walidacja potwierdzenia hasła
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Hasła nie są identyczne';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Sprawdź walidację
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Wysłanie danych do API
      const response = await axios.post('http://localhost:3001/api/users', {
        email,
        password
      });
      
      // Obsługa udanej rejestracji
      toast.success('Konto zostało utworzone pomyślnie! Możesz się teraz zalogować.');
      
      // Nie ustawiamy tokenu ani statusu - użytkownik musi się zalogować
      // Przekieruj użytkownika do logowania po udanej rejestracji
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (error) {
      // Obsługa błędów
      if (error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Wystąpił błąd podczas rejestracji');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <ToastContainer />
      <div className="w-full max-w-md p-8 border border-gray-300 rounded-lg shadow-md bg-white">
        <h2 className="text-2xl font-bold mb-6 text-center text-black">Rejestracja</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              required
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>
          
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Hasło</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              required
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
          </div>
          
          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Potwierdź hasło</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
              required
            />
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
          </div>
          
          <div className="flex flex-col gap-3 mt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-black text-white font-medium rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
            >
              {isLoading ? 'Rejestracja...' : 'Zarejestruj'}
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full py-2 px-4 bg-white text-black border border-black font-medium rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Anuluj
            </button>
            
            <Link to="/login" className="text-center text-sm text-gray-600 hover:text-black mt-2">
              Mam już konto
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Registration;