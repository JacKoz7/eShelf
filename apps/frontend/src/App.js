import React, { useState, useEffect, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Registration from './pages/Registration';
import Login from './pages/Login';
import axios from 'axios';
import "./App.css";
import Dashboard from './pages/Dashboard';

// Stworzenie kontekstu autoryzacji
export const AuthContext = createContext({});

function App() {
  const [authState, setAuthState] = useState({
    email: "",
    id: 0,
    status: false,
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      // Sprawdzenie tokenu na backendzie
      axios
        .get("http://localhost:3001/api/users/verify", {
          headers: { accessToken: token },
        })
        .then((response) => {
          if (response.data.error) {
            setAuthState((prevState) => ({ ...prevState, status: false }));
          } else {
            setAuthState({
              email: response.data.email,
              id: response.data.id,
              status: true,
            });
          }
          setLoading(false);
        })
        .catch(() => {
          localStorage.removeItem("accessToken"); // Usunięcie nieprawidłowego tokenu
          setAuthState((prevState) => ({ ...prevState, status: false }));
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-white">Ładowanie...</div>;
  }

  return (
    <AuthContext.Provider value={{ authState, setAuthState }}>
      <Router>
        <Routes>
          <Route path="/" element={
            authState.status ? (
              <Navigate to="/dashboard" /> // Tutaj możesz dodać komponent dla zalogowanych użytkowników
            ) : (
              <Navigate to="/login" />
            )
          } />
          <Route path="/registration" element={
            authState.status ? <Navigate to="/dashboard" /> : <Registration />
          } />
          <Route path="/login" element={
            authState.status ? <Navigate to="/dashboard" /> : <Login />
          } />
          <Route path="/dashboard" element={<Dashboard/>}/>
          {/* Tutaj możesz dodać więcej tras */}
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;