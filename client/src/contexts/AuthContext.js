import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  isLoggingOut: false,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_LOGOUT_LOADING':
      return { ...state, isLoggingOut: action.payload };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        isLoggingOut: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        isLoggingOut: false,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const initAuth = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        try {
          const decodedToken = jwtDecode(token);
          const currentTime = Date.now() / 1000;

          if (decodedToken.exp > currentTime) {
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: {
                token,
                user: JSON.parse(userData),
              },
            });
          } else {
            // Token expired, try to refresh
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
              refreshAuthToken(refreshToken);
            } else {
              localStorage.removeItem('token');
              localStorage.removeItem('refreshToken');
              localStorage.removeItem('user');
              dispatch({ type: 'SET_LOADING', payload: false });
            }
          }
        } catch (error) {
          console.error('Token validation error:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    const refreshAuthToken = async (refreshToken) => {
      try {
        const response = await authAPI.refresh(refreshToken);
        if (response.data.success) {
          const { accessToken, refreshToken: newRefreshToken, user } = response.data.data;
          
          localStorage.setItem('token', accessToken);
          localStorage.setItem('refreshToken', newRefreshToken);
          localStorage.setItem('user', JSON.stringify(user));
          
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: { token: accessToken, user },
          });
        } else {
          throw new Error('Token refresh failed');
        }
      } catch (error) {
        console.error('Token refresh error:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await authAPI.login(credentials);
      
      if (response.data.success) {
        const { accessToken, refreshToken, user } = response.data.data;

        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));

        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { token: accessToken, user },
        });

        toast.success('Successfully logged in!');
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      const message = error.response?.data?.message || error.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await authAPI.register(userData);
      
      if (response.data.success) {
        const { accessToken, refreshToken, user } = response.data.data;

        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));

        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { token: accessToken, user },
        });

        toast.success('Registration successful!');
        return { success: true };
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
      const message = error.response?.data?.message || error.message || 'Registration failed';
      
      // Handle validation errors
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors.map(err => err.msg).join(', ');
        toast.error(validationErrors);
        return { success: false, message: validationErrors };
      }
      
      toast.error(message);
      return { success: false, message };
    }
  };

  // Simple logout that always works
  const forceLogout = () => {
    console.log('Force logout initiated...');
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
    toast.info('You have been logged out');
    console.log('Force logout complete');
  };

  const logout = async () => {
    try {
      dispatch({ type: 'SET_LOGOUT_LOADING', payload: true });
      console.log('Starting logout process...');
      
      // Call backend logout endpoint to invalidate refresh token
      try {
        await authAPI.logout();
        console.log('Backend logout successful');
        toast.success('Successfully logged out');
      } catch (apiError) {
        console.error('Backend logout failed:', apiError);
        toast.info('Logged out locally');
      }
      
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed, but clearing local session');
    } finally {
      // Always clear local storage and state regardless of API success/failure
      console.log('Clearing local storage and state...');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      dispatch({ type: 'LOGOUT' });
      console.log('Logout complete');
    }
  };

  const updateUser = (userData) => {
    const updatedUser = { ...state.user, ...userData };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  const isAdmin = () => {
    return state.user?.role === 'Admin' || state.user?.userType === 'Admin';
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    forceLogout,
    updateUser,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};