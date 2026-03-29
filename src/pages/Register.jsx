import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context';
import PageWrapper from '../components/PageWrapper';
import Button from '../components/Button';
import SectionHeading from '../components/SectionHeading';

export default function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

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
          <SectionHeading title="Join Aerion" subtitle="Create an account to track orders and save your favorites." />

          <form onSubmit={handleSubmit} className="auth-form glassmorphic-card">
            {error && <div className="auth-error">{error}</div>}

            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                required
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

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
              {loading ? 'Creating Account...' : 'Register'}
            </Button>

            <p className="auth-footer text-center mt-4">
              Already have an account? <Link to="/login">Login here</Link>
            </p>
          </form>
        </div>
      </section>
    </PageWrapper>
  );
}
