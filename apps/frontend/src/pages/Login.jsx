import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthContext } from '../App';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { setAuthState } = useContext(AuthContext);
  const navigate = useNavigate();

  // Walidacja formularza
  const validateForm = () => {
    const newErrors = {};
    
    // Walidacja email
    if (!email) {
      newErrors.email = 'Email jest wymagany';
    }
    
    // Walidacja hasła
    if (!password) {
      newErrors.password = 'Hasło jest wymagane';
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
      const response = await axios.post('http://localhost:3001/api/users/login', {
        email,
        password
      });
      
      // Obsługa udanego logowania
      toast.success('Zalogowano pomyślnie!');
      
      // Zapisz token w localStorage
      localStorage.setItem('accessToken', response.data.accessToken);
      
      // Aktualizacja stanu autentykacji
      setAuthState({
        email: response.data.email,
        id: response.data._id,
        status: true
      });
      
      // Przekieruj użytkownika po udanym logowaniu
      setTimeout(() => {
        navigate('/');
      }, 2000);
      
    } catch (error) {
      // Obsługa błędów
      if (error.response && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Wystąpił błąd podczas logowania');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <ToastContainer />
      <div className="w-full max-w-md p-8 border border-gray-300 rounded-lg shadow-md bg-white">
        <h2 className="text-2xl font-bold mb-6 text-center text-black">Logowanie</h2>
        
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
          
          <div className="mb-6">
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
          
          <div className="flex flex-col gap-3 mt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-black text-white font-medium rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
            >
              {isLoading ? 'Logowanie...' : 'Zaloguj'}
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full py-2 px-4 bg-white text-black border border-black font-medium rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Anuluj
            </button>
            
            <Link to="/registration" className="text-center text-sm text-gray-600 hover:text-black mt-2">
              Nie mam konta
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;