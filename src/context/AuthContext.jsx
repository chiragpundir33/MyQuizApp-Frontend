import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI, quizAPI } from '../services/api';
import apiClient from '../services/axiosConfig';

const AuthContext = createContext(null);

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Sync token with axios header and load user profile
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          localStorage.setItem('token', token);
          const decoded = parseJwt(token);
          
          if (decoded && decoded.sub) {
            const email = decoded.sub;
            const role = decoded.role;
            
            // Query all users to find matching user and resolve ID
            const usersResponse = await apiClient.get('/user/getAllUser');
            const allUsers = usersResponse.data;
            const matchedUser = allUsers.find(u => u.email === email);
            
            if (matchedUser) {
              setUser({
                id: matchedUser.id,
                name: matchedUser.name,
                email: matchedUser.email,
                role: role || 'USER',
              });
            } else {
              // Fallback if not found
              setUser({
                id: 1, // Fallback ID
                name: email.split('@')[0],
                email: email,
                role: role || 'USER',
              });
            }
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
          logout();
        }
      } else {
        localStorage.removeItem('token');
        setUser(null);
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await authAPI.login(email, password);
      if (response.token) {
        setToken(response.token);
        return { success: true };
      }
      return { success: false, message: response.message || 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Invalid credentials or Server down',
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const response = await authAPI.register(name, email, password);
      // Backend returns registered successfully but no token directly on register,
      // so user needs to login after registering.
      return { success: true, message: response.message };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed. Email might exist.',
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
