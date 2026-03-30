import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await register(formData.name, formData.email, formData.password);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message || 'Registration failed. Please try again.');
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
        <h1 className="lu-auth-title">Join Aerion</h1>
        <p className="lu-auth-subtitle">Create your account and elevate your game.</p>

        {error && <div className="lu-form-error" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} className="lu-form">
          <div className="lu-form-group">
            <label className="lu-form-label" htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="lu-input"
              placeholder="Your Name"
              value={formData.name}
              onChange={onChange}
              autoComplete="name"
            />
          </div>

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
              minLength={6}
              className="lu-input"
              placeholder="Min. 6 characters"
              value={formData.password}
              onChange={onChange}
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="lu-btn-primary" disabled={loading} style={{ width: '100%', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="lu-auth-footer">
          Already a member? <Link to="/login">Sign in here</Link>
        </p>
      </div>
    </div>
  );
}
