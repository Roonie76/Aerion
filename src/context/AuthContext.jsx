import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth } from '../firebase';

const AuthContext = createContext(undefined);

const API_BASE = '/api/v1';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Maintain custom request handler to ensure your core backend (Products/Orders/etc)
  // still functions properly, but now inject the Firebase JWT token securely!
  const request = useCallback(async (endpoint, options = {}) => {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
    
    let token = '';
    if (auth.currentUser) {
      token = await auth.currentUser.getIdToken();
    }

    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Retains compatibility if your backend still requires session cookies
      });

      if (response.status === 401) {
        return { success: false, status: 401, message: 'Session expired or unauthorized' };
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
    await signOut(auth);
  }, []);

  // Automatically track Firebase user auth state transitions
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
          uid: currentUser.uid,
          email: currentUser.email,
          name: currentUser.displayName || currentUser.email.split('@')[0], 
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error) {
      // Create user-friendly Firebase errors
      let msg = 'Failed to login.';
      if (error.code === 'auth/invalid-credential') msg = 'Invalid email or password.';
      if (error.code === 'auth/too-many-requests') msg = 'Too many attempts. Try again later.';
      return { success: false, message: msg };
    }
  };

  const register = async (name, email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Overwrite the Firebase display name with our user's input
      await updateProfile(userCredential.user, {
        displayName: name
      });
      
      setUser({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        name: name,
      });

      return { success: true };
    } catch (error) {
      let msg = 'Registration failed.';
      if (error.code === 'auth/email-already-in-use') msg = 'This email is already registered.';
      if (error.code === 'auth/weak-password') msg = 'Password should be at least 6 characters.';
      return { success: false, message: msg };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      return { success: true };
    } catch (error) {
      if (error.code === 'auth/popup-closed-by-user') {
        return { success: false, message: 'Google sign-in was cancelled.' };
      }
      return { success: false, message: error.message };
    }
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      signInWithGoogle,
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
