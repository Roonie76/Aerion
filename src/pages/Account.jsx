import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context';
import { Package, User, LogOut, ChevronRight, Clock, MapPin, CreditCard } from 'lucide-react';

export default function Account() {
  const { user, logout, request } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=account');
      return;
    }

    async function fetchOrders() {
      try {
        const result = await request('/orders/my');
        if (result.success) {
          setOrders(result.data);
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [user, navigate, request]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="lu-account-page">
        <div className="lu-container text-center">
          <p className="lu-gold">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lu-account-page">
      <div className="lu-container">
        <div className="lu-account-grid">
          {/* Sidebar */}
          <aside className="lu-account-sidebar">
            <div className="lu-profile-card">
              <div className="lu-profile-avatar">
                {user?.name?.charAt(0)}
              </div>
              <h2 className="lu-profile-name">{user?.name}</h2>
              <p className="lu-profile-email">{user?.email}</p>
              
              <div style={{ marginTop: '24px', width: '100%', pt: '24px', borderTop: '1px solid var(--border)' }}>
                <button 
                  onClick={handleLogout}
                  className="lu-btn-ghost" 
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#ff4444' }}
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>

            <div className="lu-account-section" style={{ padding: '24px' }}>
              <p className="lu-form-label" style={{ marginBottom: '16px' }}>Quick Links</p>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link to="/series" className="lu-link" style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Package size={14} /> Shop Collection
                </Link>
                <Link to="/cart" className="lu-link" style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CreditCard size={14} /> My Cart
                </Link>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lu-account-content">
            <div className="lu-account-section">
              <div className="lu-account-section-title">
                <span>Recent Orders</span>
                <span style={{ fontSize: '0.65rem', opacity: 0.5 }}>{orders.length} Orders Total</span>
              </div>

              {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>You haven't placed any orders yet.</p>
                  <Link to="/series" className="lu-btn-primary">Start Your Journey</Link>
                </div>
              ) : (
                <div className="lu-orders-list">
                  {orders.map((order) => (
                    <article key={order._id} className="lu-order-item">
                      <div className="lu-order-head">
                        <div>
                          <p className="lu-order-id">#{order._id.substring(0, 8).toUpperCase()}</p>
                          <p className="lu-order-date">{new Date(order.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                        <div className={`lu-order-status lu-status-${order.orderStatus}`}>
                          {order.orderStatus}
                        </div>
                      </div>
                      
                      <div className="lu-order-body">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="lu-order-product">
                            <img src={item.image} alt={item.name} className="lu-order-product-img" />
                            <div>
                              <p className="lu-order-product-name">{item.name}</p>
                              <p className="lu-order-product-meta">Qty: {item.quantity} × ₹{item.price}</p>
                            </div>
                            <div className="lu-order-product-total">₹{item.price * item.quantity}</div>
                          </div>
                        ))}
                      </div>

                      <div className="lu-order-foot">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                          <MapPin size={12} />
                          <span>{order.shippingAddress?.address?.substring(0, 30)}...</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span className="lu-order-total-label">Grand Total </span>
                          <span className="lu-order-total-value">₹{order.total}</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
