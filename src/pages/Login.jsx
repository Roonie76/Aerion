import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message || 'Login failed. Please check your credentials.');
      }
    } catch {
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="lu-auth-page">
      <div className="lu-auth-glow" aria-hidden="true" />
      <div className="lu-auth-card">
        <div className="lu-auth-logo">
          <span className="lu-auth-logo-mark">AERION</span>
        </div>
        <h1 className="lu-auth-title">Welcome Back</h1>
        <p className="lu-auth-subtitle">Sign in to access your account and track your orders.</p>

        {error && <div className="lu-form-error" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} className="lu-form">
          <div className="lu-form-group">
            <label className="lu-form-label" htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="lu-input"
              placeholder="you@example.com"
              value={formData.email}
              onChange={onChange}
              autoComplete="email"
            />
          </div>

          <div className="lu-form-group">
            <label className="lu-form-label" htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="lu-input"
              placeholder="••••••••"
              value={formData.password}
              onChange={onChange}
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="lu-btn-primary" disabled={loading} style={{ width: '100%', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', margin: '24px 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }} />
          <span style={{ padding: '0 12px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)' }}>Or continue with</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border)' }} />
        </div>

        <button 
          type="button" 
          onClick={async () => {
            setLoading(true);
            const res = await signInWithGoogle();
            setLoading(false);
            if(res.success) navigate('/');
            else setError(res.message);
          }}
          className="lu-btn-ghost" 
          disabled={loading} 
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </button>

        <p className="lu-auth-footer">
          No account? <Link to="/register">Create one here</Link>
        </p>
      </div>
    </div>
  );
}
