import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context';
import PageWrapper from '../components/PageWrapper';
import Button from '../components/Button';
import SectionHeading from '../components/SectionHeading';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

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
    } catch (err) {
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <section className="section-block page-section">
        <div className="site-container auth-form-container">
          <SectionHeading title="Welcome Back" subtitle="Please enter your credentials to access your account." />

          <form onSubmit={handleSubmit} className="auth-form glassmorphic-card">
            {error && <div className="auth-error">{error}</div>}

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                required
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </Button>

            <p className="auth-footer text-center mt-4">
              Don't have an account? <Link to="/register">Register here</Link>
            </p>
          </form>
        </div>
      </section>
    </PageWrapper>
  );
}
