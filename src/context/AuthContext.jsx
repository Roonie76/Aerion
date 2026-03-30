import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';

const AuthContext = createContext(undefined);

const API_BASE = '/api/v1';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Shared fetch helper — credentials: 'include' sends httpOnly cookies automatically
  const request = useCallback(async (endpoint, options = {}) => {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Always send cookies with every request
      });

      if (response.status === 401) {
        setUser(null);
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
  }, []);

  const logout = useCallback(async () => {
    // Ask the server to clear the httpOnly cookie
    await request('/auth/logout', { method: 'POST' });
    setUser(null);
  }, [request]);

  // On mount, try to restore session from the httpOnly cookie via /auth/me
  useEffect(() => {
    async function checkAuth() {
      const result = await request('/auth/me');
      if (result.success) {
        setUser(result.data);
      } else {
        setUser(null);
      }
      setLoading(false);
    }
    checkAuth();
  }, [request]);

  const login = async (email, password) => {
    const result = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (result.success) {
      setUser(result.data.user);
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
      setUser(result.data.user);
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
