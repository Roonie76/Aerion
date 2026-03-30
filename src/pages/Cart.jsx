import React, { useMemo, useState, useEffect, memo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart, useAuth } from '../context';
import { useRazorpay } from '../hooks/useRazorpay';

const TAX_RATE = 0.12;

/* ─── Memoized Checkout Form ─────────────────────────────── */
const CheckoutForm = memo(function CheckoutForm({ user, loading, error, onSubmit }) {
  const [data, setData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    paymentMethod: 'card',
  });

  useEffect(() => {
    if (user) {
      setData((prev) => ({ ...prev, fullName: user.name, email: user.email }));
    }
  }, [user]);

  const onChange = useCallback((e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(data);
  };

  return (
    <form className="lu-form" onSubmit={handleSubmit}>
      {error && <div className="lu-form-error" role="alert">{error}</div>}

      <div className="lu-form-group">
        <label className="lu-form-label" htmlFor="fullName">Full Name</label>
        <input id="fullName" name="fullName" required className="lu-input" value={data.fullName} onChange={onChange} autoComplete="name" />
      </div>

      <div className="lu-form-group">
        <label className="lu-form-label" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required className="lu-input" value={data.email} onChange={onChange} autoComplete="email" />
      </div>

      <div className="lu-form-group">
        <label className="lu-form-label" htmlFor="phone">Phone</label>
        <input id="phone" name="phone" required className="lu-input" value={data.phone} onChange={onChange} autoComplete="tel" placeholder="+91 00000 00000" />
      </div>

      <div className="lu-form-group">
        <label className="lu-form-label" htmlFor="address">Shipping Address</label>
        <textarea id="address" name="address" required className="lu-input" value={data.address} onChange={onChange} rows="3" autoComplete="street-address" style={{ resize: 'vertical' }} />
      </div>

      <fieldset style={{ border: '1px solid var(--border)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <legend className="lu-form-label">Payment Method</legend>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', fontSize: '0.85rem', cursor: 'pointer' }}>
          <input type="radio" name="paymentMethod" value="card" checked={data.paymentMethod === 'card'} onChange={onChange} style={{ accentColor: 'var(--primary)' }} />
          Card / UPI (Razorpay)
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-secondary)', fontSize: '0.85rem', cursor: 'pointer' }}>
          <input type="radio" name="paymentMethod" value="cod" checked={data.paymentMethod === 'cod'} onChange={onChange} style={{ accentColor: 'var(--primary)' }} />
          Cash on Delivery
        </label>
      </fieldset>

      <button
        type="submit"
        className="lu-btn-primary"
        disabled={loading}
        style={{ width: '100%', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
      >
        {loading ? 'Processing…' : 'Place Order'}
      </button>
    </form>
  );
});

/* ─── Main Cart Component ─────────────────────────────────── */
export default function Cart() {
  const navigate = useNavigate();
  const { cartItems, addItem, removeItem, deleteItem, clearCart } = useCart();
  const { user } = useAuth();
  const { initiatePayment } = useRazorpay();

  const [isPlaced, setIsPlaced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { subtotal, taxes, totalItems, grandTotal } = useMemo(() => {
    const sub = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
    const tax = Math.round(sub * TAX_RATE);
    return { subtotal: sub, taxes: tax, totalItems: cartItems.reduce((s, i) => s + i.quantity, 0), grandTotal: sub + tax };
  }, [cartItems]);

  const finalizeOrder = async (checkoutData, paymentResponse = {}) => {
    try {
      const result = await request('/orders', {
        method: 'POST',
        body: JSON.stringify({
          shippingAddress: {
            fullName: checkoutData.fullName,
            email: checkoutData.email,
            phone: checkoutData.phone,
            address: checkoutData.address,
          },
          paymentMethod: checkoutData.paymentMethod,
          razorpayOrderId: paymentResponse.razorpay_order_id,
          razorpayPaymentId: paymentResponse.razorpay_payment_id,
          razorpaySignature: paymentResponse.razorpay_signature,
        }),
      });

      if (result.success) {
        setIsPlaced(true);
        clearCart();
      } else {
        throw new Error(result.message || 'Failed to record order.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  const onCheckout = async (checkoutData) => {
    setError('');
    if (!user) { navigate('/login?redirect=cart'); return; }
    if (cartItems.length === 0) return;
    setLoading(true);

    if (checkoutData.paymentMethod === 'cod') {
      await finalizeOrder(checkoutData);
    } else {
      await initiatePayment({
        amount: grandTotal,
        checkoutData,
        onSuccess: (payRes) => finalizeOrder(checkoutData, payRes),
        onFailure: (msg) => { setError(msg); setLoading(false); },
      });
    }
  };

  if (isPlaced) {
    return (
      <div className="lu-cart-page">
        <div className="lu-container lu-order-success">
          <div className="lu-order-success-icon">✓</div>
          <p className="lu-overline lu-gold">Order Confirmed</p>
          <h1 className="lu-section-title">Thank You</h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', lineHeight: 1.7 }}>
            Your order has been placed successfully. Our team will process it and share shipping details via email shortly.
          </p>
          <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
            <Link to="/series" className="lu-btn-primary">Continue Shopping</Link>
            <Link to="/orders" className="lu-btn-ghost">View Orders</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lu-cart-page">
      <div className="lu-container">
        <div className="lu-section-header" style={{ marginBottom: '48px' }}>
          <p className="lu-overline">Your Selection</p>
          <h1 className="lu-section-title">Cart & Checkout</h1>
        </div>

        {cartItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '28px' }}>Your cart is empty. Discover our collection.</p>
            <Link to="/series" className="lu-btn-primary">Explore Flight Series</Link>
          </div>
        ) : (
          <div className="lu-cart-layout">
            {/* Cart Items */}
            <section className="lu-cart-panel" aria-label="Cart Items">
              <p className="lu-cart-title">Order Items — {totalItems}</p>
              {cartItems.map((item) => (
                <article key={item.id || item._id} className="lu-cart-item">
                  <img src={item.img || item.image} alt={item.name} className="lu-cart-item-img" loading="lazy" />
                  <div className="lu-cart-item-body">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 className="lu-cart-item-name">{item.name}</h4>
                        <p className="lu-cart-item-sub">{item.series || ''}</p>
                      </div>
                      <span className="lu-cart-item-price">₹{item.price}</span>
                    </div>
                    <div className="lu-cart-item-actions">
                      <div className="lu-qty-controls">
                        <button className="lu-qty-btn" type="button" onClick={() => removeItem(item.id || item._id)} aria-label="Decrease">−</button>
                        <span className="lu-qty-count">{item.quantity}</span>
                        <button className="lu-qty-btn" type="button" onClick={() => addItem(item)} aria-label="Increase">+</button>
                      </div>
                      <button className="lu-cart-remove" type="button" onClick={() => deleteItem(item.id || item._id)}>Remove</button>
                    </div>
                  </div>
                </article>
              ))}
            </section>

            {/* Checkout Panel */}
            <aside className="lu-cart-panel" aria-label="Checkout">
              <p className="lu-cart-title">Checkout</p>

              <div className="lu-totals" style={{ marginBottom: '28px' }}>
                <div className="lu-totals-row"><span>Subtotal</span><span>₹{subtotal}</span></div>
                <div className="lu-totals-row"><span>GST (12%)</span><span>₹{taxes}</span></div>
                <div className="lu-totals-row grand"><span>Total</span><strong>₹{grandTotal}</strong></div>
              </div>

              <CheckoutForm user={user} loading={loading} error={error} onSubmit={onCheckout} />
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
