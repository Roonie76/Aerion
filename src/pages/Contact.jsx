import React, { useState } from 'react';
import { useAuth } from '../context';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function Contact() {
  const { request } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', subject: 'General Query', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await request('/contact', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (result.success) {
        setSuccess(true);
        setFormData({ name: '', email: '', subject: 'General Query', message: '' });
      } else {
        setError(result.message || 'Failed to send message.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="lu-section" style={{ minHeight: '100vh' }}>
      <div className="lu-container">
        <div className="lu-section-header">
          <p className="lu-overline">Connect With Us</p>
          <h1 className="lu-section-title">Experience Aerion</h1>
          <p className="lu-section-sub">For professional partnerships, procurement, or product queries, we are at your command.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '64px', marginTop: '64px' }} className="responsive-contact">
          {/* Info Side */}
          <aside>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ width: '40px', height: '40px', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Mail size={18} />
                </div>
                <div>
                  <p style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.5, marginBottom: '4px' }}>Email Us</p>
                  <p style={{ fontWeight: 700, color: 'var(--text)' }}>aerionsports@gmail.com</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ width: '40px', height: '40px', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Phone size={18} />
                </div>
                <div>
                  <p style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.5, marginBottom: '4px' }}>Call Us</p>
                  <p style={{ fontWeight: 700, color: 'var(--text)' }}>+91 99112 25445</p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '20px' }}>
                <div style={{ width: '40px', height: '40px', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MapPin size={18} />
                </div>
                <div>
                  <p style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.5, marginBottom: '4px' }}>Headquarters</p>
                  <p style={{ fontWeight: 700, color: 'var(--text)' }}>Sec-92 Gurgaon </p>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '56px', padding: '32px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.8 }}>
                “AERION isn't just equipment; it's a standard of excellence. Our technical team is available for deep-dive flight diagnostics and club-level consultancy.”
              </p>
              <p style={{ marginTop: '16px', color: 'var(--primary)', fontWeight: 900, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1.5px' }}>— Lead Flight Engineer</p>
            </div>
          </aside>

          {/* Form Side */}
          <main>
            {success ? (
              <div style={{ background: 'rgba(74, 222, 128, 0.05)', border: '1px solid #4ade80', padding: '48px', textAlign: 'center' }}>
                <div style={{ width: '64px', height: '64px', border: '2px solid #4ade80', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4ade80', margin: '0 auto 24px' }}>
                  <Send size={24} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '12px' }}>Transmission Received</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Our team will respond to your query within 4 business hours.</p>
                <button onClick={() => setSuccess(false)} className="lu-btn-ghost" style={{ marginTop: '24px' }}>Send Another</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="lu-form" style={{ padding: '40px', background: 'var(--card)', border: '1px solid var(--border)' }}>
                {error && <div className="lu-form-error" style={{ marginBottom: '24px' }}>{error}</div>}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                  <div className="lu-form-group" style={{ marginBottom: 0 }}>
                    <label className="lu-form-label">Full Name</label>
                    <input type="text" name="name" required className="lu-input" placeholder="Enter name..." value={formData.name} onChange={onChange} />
                  </div>
                  <div className="lu-form-group" style={{ marginBottom: 0 }}>
                    <label className="lu-form-label">Email Hub</label>
                    <input type="email" name="email" required className="lu-input" placeholder="you@example.com" value={formData.email} onChange={onChange} />
                  </div>
                </div>

                <div className="lu-form-group">
                  <label className="lu-form-label">Subject</label>
                  <select name="subject" className="lu-input" value={formData.subject} onChange={onChange}>
                    <option value="General Query">General Query</option>
                    <option value="Bulk Order / Procurement">Bulk Order / Procurement</option>
                    <option value="Sponsorship & Partnership">Sponsorship & Partnership</option>
                    <option value="Product Technical Deep-dive">Product Technical Deep-dive</option>
                  </select>
                </div>

                <div className="lu-form-group">
                  <label className="lu-form-label">Mission Brief / Message</label>
                  <textarea name="message" required className="lu-input" rows="5" placeholder="How can Aerion elevate your standard?" value={formData.message} onChange={onChange} style={{ resize: 'vertical' }} />
                </div>

                <button type="submit" disabled={loading} className="lu-btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                  {loading ? 'Transmitting...' : 'Send Query'} <Send size={16} />
                </button>
              </form>
            )}
          </main>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @media (max-width: 868px) {
          .responsive-contact { grid-template-columns: 1fr !important; gap: 48px !important; }
        }
      ` }} />
    </section>
  );
}
