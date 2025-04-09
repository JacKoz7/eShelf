import React, { useState, useEffect, createContext } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  NavLink,
  useNavigate,
} from "react-router-dom";
import Registration from "./pages/Registration";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import EditBook from "./pages/EditBook";
import axios from "axios";
import "./App.css";
import UserBooks from "./pages/UserBooks";
import FriendList from "./pages/FriendList";
import FriendBooks from "./pages/FriendBooks";

// Stworzenie kontekstu autoryzacji
export const AuthContext = createContext({});

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const [authState, setAuthState] = useState({
    email: "",
    id: 0,
    status: false,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
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
          localStorage.removeItem("accessToken");
          setAuthState((prevState) => ({ ...prevState, status: false }));
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        await axios.post(
          `http://localhost:3001/api/users/logout/${authState.id}`,
          {},
          {
            headers: { accessToken: token },
          }
        );
        localStorage.removeItem("accessToken");
        setAuthState({ email: "", id: 0, status: false });
        navigate("/login");
      } catch (error) {
        console.error("Error during logout:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        Ładowanie...
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ authState, setAuthState }}>
      {authState.status && (
        <nav className="flex justify-between items-center px-6 py-4 bg-white border-b border-gray-400 shadow-sm">
          <div className="flex gap-6">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `text-sm font-medium ${
                  isActive
                    ? "text-black underline"
                    : "text-gray-600 hover:text-black"
                }`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/userbooks"
              className={({ isActive }) =>
                `text-sm font-medium ${
                  isActive
                    ? "text-black underline"
                    : "text-gray-600 hover:text-black"
                }`
              }
            >
              Moje książki
            </NavLink>
            <NavLink
              to="/friendlist"
              className={({ isActive }) =>
                `text-sm font-medium ${
                  isActive
                    ? "text-black underline"
                    : "text-gray-600 hover:text-black"
                }`
              }
            >
              Znajomi
            </NavLink>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-gray-600 hover:text-black border border-gray-300 px-4 py-1 rounded-md hover:bg-gray-100 transition"
          >
            Wyloguj
          </button>
        </nav>
      )}

      <Routes>
        <Route
          path="/"
          element={
            authState.status ? (
              <Navigate to="/dashboard" />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/registration"
          element={
            authState.status ? <Navigate to="/dashboard" /> : <Registration />
          }
        />
        <Route
          path="/login"
          element={authState.status ? <Navigate to="/dashboard" /> : <Login />}
        />
        <Route
          path="/userbooks"
          element={authState.status ? <UserBooks /> : <Navigate to="/login" />}
        />
        <Route
          path="/edit-book/:id"
          element={authState.status ? <EditBook /> : <Navigate to="/login" />}
        />
        <Route
          path="/friendlist"
          element={authState.status ? <FriendList /> : <Navigate to="/login" />}
        />
        <Route
          path="/friend-books/:friendId"
          element={
            authState.status ? <FriendBooks /> : <Navigate to="/login" />
          }
        />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </AuthContext.Provider>
  );
}

export default App;
