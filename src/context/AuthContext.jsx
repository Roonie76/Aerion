import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';

const AuthContext = createContext(undefined);

const API_BASE = '/api/v1';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('aerion_token'));

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('aerion_token');
  }, []);

  const request = useCallback(async (endpoint, options = {}) => {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const currentToken = localStorage.getItem('aerion_token');
    if (currentToken) {
      headers['Authorization'] = `Bearer ${currentToken}`;
    }

    try {
      const response = await fetch(url, { ...options, headers });
      
      if (response.status === 401) {
        logout();
        return { success: false, status: 401, message: 'Session expired' };
      }

      const data = await response.json();
      if (response.ok) {
        return { success: true, data: data.data, status: response.status };
      } else {
        return { success: false, message: data.message || 'Something went wrong', status: response.status };
      }
    } catch (error) {
      return { success: false, message: error.message || 'Network error', status: 500 };
    }
  }, [logout]);

  useEffect(() => {
    async function checkAuth() {
      if (!token) {
        setLoading(false);
        return;
      }

      const result = await request('/auth/me');
      if (result.success) {
        setUser(result.data);
      } else {
        logout();
      }
      setLoading(false);
    }
    checkAuth();
  }, [token, request, logout]);

  const login = async (email, password) => {
    const result = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (result.success) {
      const { user: userData, token: userToken } = result.data;
      setUser(userData);
      setToken(userToken);
      localStorage.setItem('aerion_token', userToken);
      return { success: true };
    }
    return result;
  };

  const register = async (name, email, password) => {
    const result = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });

    if (result.success) {
      const { user: userData, token: userToken } = result.data;
      setUser(userData);
      setToken(userToken);
      localStorage.setItem('aerion_token', userToken);
      return { success: true };
    }
    return result;
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      request,
      isAuthenticated: !!user,
    }),
    [user, loading, request, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }
  return context;
}
