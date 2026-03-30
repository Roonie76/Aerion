import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
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
          <span className="lu-auth-logo-mark">✦ Aerion</span>
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

        <p className="lu-auth-footer">
          No account? <Link to="/register">Create one here</Link>
        </p>
      </div>
    </div>
  );
}
