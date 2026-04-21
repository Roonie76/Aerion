import React, { useMemo, useState, useEffect, memo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart, useAuth } from '../context';
import { useRazorpay } from '../hooks/useRazorpay';
import { toGA4Item, trackEvent } from '../lib/analytics';
import {
  isEmail,
  isIndianPhone,
  isNonEmpty,
  isPincode,
  validate,
} from '../utils/validation';

const TAX_RATE = 0.18;

const checkoutSchema = {
  name: [{ test: isNonEmpty, message: 'Enter the recipient name.' }],
  email: [
    { test: isNonEmpty, message: 'Enter your email address.' },
    { test: isEmail, message: 'Enter a valid email address.' },
  ],
  phone: [
    { test: isNonEmpty, message: 'Enter your phone number.' },
    { test: isIndianPhone, message: 'Enter a valid 10-digit Indian mobile number.' },
  ],
  line1: [{ test: isNonEmpty, message: 'Enter your street address.' }],
  city: [{ test: isNonEmpty, message: 'Enter your city.' }],
  state: [{ test: isNonEmpty, message: 'Enter your state.' }],
  pincode: [
    { test: isNonEmpty, message: 'Enter your pincode.' },
    { test: isPincode, message: 'Enter a valid 6-digit Indian pincode.' },
  ],
};

const fieldGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '16px',
};

const paymentFieldsetStyle = {
  border: '1px solid var(--border)',
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
};

const paymentOptionStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  color: 'var(--text-secondary)',
  fontSize: '0.85rem',
  cursor: 'pointer',
};

const CheckoutForm = memo(function CheckoutForm({ user, loading, error, onSubmit }) {
  const [data, setData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    line1: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'card',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setData((current) => ({ ...current, name: user.name || '', email: user.email || '' }));
    }
  }, [user]);

  const onChange = useCallback((e) => {
    const { name, value } = e.target;
    setData((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();

      const nextValidation = validate(data, checkoutSchema);
      if (!nextValidation.ok) {
        setErrors(nextValidation.errors);
        return;
      }

      onSubmit(data);
    },
    [data, onSubmit]
  );

  return (
    <form className="lu-form" onSubmit={handleSubmit} noValidate>
      {error && <div className="lu-form-error" role="alert">{error}</div>}

      <div style={fieldGridStyle}>
        <div className="lu-form-group">
          <label className="lu-form-label" htmlFor="checkout-name">Full Name</label>
          <input
            id="checkout-name"
            name="name"
            required
            className="lu-input"
            value={data.name}
            onChange={onChange}
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'checkout-name-error' : undefined}
          />
          {errors.name && <span id="checkout-name-error" role="alert" className="form-error">{errors.name}</span>}
        </div>

        <div className="lu-form-group">
          <label className="lu-form-label" htmlFor="checkout-email">Email</label>
          <input
            id="checkout-email"
            name="email"
            type="email"
            required
            className="lu-input"
            value={data.email}
            onChange={onChange}
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? 'checkout-email-error' : undefined}
          />
          {errors.email && <span id="checkout-email-error" role="alert" className="form-error">{errors.email}</span>}
        </div>
      </div>

      <div className="lu-form-group">
        <label className="lu-form-label" htmlFor="checkout-phone">Phone</label>
        <input
          id="checkout-phone"
          name="phone"
          type="tel"
          required
          className="lu-input"
          value={data.phone}
          onChange={onChange}
          autoComplete="tel"
          placeholder="+91 98765 43210"
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? 'checkout-phone-error' : undefined}
        />
        {errors.phone && <span id="checkout-phone-error" role="alert" className="form-error">{errors.phone}</span>}
      </div>

      <div className="lu-form-group">
        <label className="lu-form-label" htmlFor="checkout-line1">Address Line 1</label>
        <input
          id="checkout-line1"
          name="line1"
          required
          className="lu-input"
          value={data.line1}
          onChange={onChange}
          autoComplete="address-line1"
          placeholder="Street address, locality, landmark"
          aria-invalid={Boolean(errors.line1)}
          aria-describedby={errors.line1 ? 'checkout-line1-error' : undefined}
        />
        {errors.line1 && <span id="checkout-line1-error" role="alert" className="form-error">{errors.line1}</span>}
      </div>

      <div style={fieldGridStyle}>
        <div className="lu-form-group">
          <label className="lu-form-label" htmlFor="checkout-city">City</label>
          <input
            id="checkout-city"
            name="city"
            required
            className="lu-input"
            value={data.city}
            onChange={onChange}
            autoComplete="address-level2"
            aria-invalid={Boolean(errors.city)}
            aria-describedby={errors.city ? 'checkout-city-error' : undefined}
          />
          {errors.city && <span id="checkout-city-error" role="alert" className="form-error">{errors.city}</span>}
        </div>

        <div className="lu-form-group">
          <label className="lu-form-label" htmlFor="checkout-state">State</label>
          <input
            id="checkout-state"
            name="state"
            required
            className="lu-input"
            value={data.state}
            onChange={onChange}
            autoComplete="address-level1"
            aria-invalid={Boolean(errors.state)}
            aria-describedby={errors.state ? 'checkout-state-error' : undefined}
          />
          {errors.state && <span id="checkout-state-error" role="alert" className="form-error">{errors.state}</span>}
        </div>

        <div className="lu-form-group">
          <label className="lu-form-label" htmlFor="checkout-pincode">Pincode</label>
          <input
            id="checkout-pincode"
            name="pincode"
            required
            className="lu-input"
            value={data.pincode}
            onChange={onChange}
            autoComplete="postal-code"
            inputMode="numeric"
            placeholder="122001"
            aria-invalid={Boolean(errors.pincode)}
            aria-describedby={errors.pincode ? 'checkout-pincode-error' : undefined}
          />
          {errors.pincode && <span id="checkout-pincode-error" role="alert" className="form-error">{errors.pincode}</span>}
        </div>
      </div>

      <fieldset style={paymentFieldsetStyle}>
        <legend className="lu-form-label">Payment Method</legend>
        <label style={paymentOptionStyle}>
          <input type="radio" name="paymentMethod" value="card" checked={data.paymentMethod === 'card'} onChange={onChange} style={{ accentColor: 'var(--primary)' }} />
          Card / UPI (Razorpay)
        </label>
        <label style={paymentOptionStyle}>
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
        {loading ? 'Processing...' : 'Place Order'}
      </button>
    </form>
  );
});

export default function Cart() {
  const navigate = useNavigate();
  const { cartItems, addItem, removeItem, deleteItem, clearCart } = useCart();
  const { user, request } = useAuth();
  const { initiatePayment } = useRazorpay();

  const [isPlaced, setIsPlaced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const beginCheckoutTrackedRef = React.useRef(false);

  const { subtotal, taxes, totalItems, grandTotal } = useMemo(() => {
    const sub = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = Math.round(sub * TAX_RATE);
    return {
      subtotal: sub,
      taxes: tax,
      totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      grandTotal: sub + tax,
    };
  }, [cartItems]);

  const onCheckout = async (checkoutData) => {
    setError('');

    if (!user) {
      navigate('/login?redirect=cart');
      return;
    }

    if (cartItems.length === 0) {
      return;
    }

    const gaItems = cartItems.map((item) => toGA4Item(item, item.quantity || 1));
    const analyticsBase = {
      currency: 'INR',
      value: grandTotal,
      items: gaItems,
    };

    if (!beginCheckoutTrackedRef.current) {
      trackEvent('begin_checkout', analyticsBase);
      beginCheckoutTrackedRef.current = true;
    }

    trackEvent('add_shipping_info', {
      ...analyticsBase,
      shipping_tier: 'Standard',
    });

    setLoading(true);

    try {
      const orderRes = await request('/orders', {
        method: 'POST',
        body: JSON.stringify({
          shippingAddress: {
            label: 'checkout',
            recipientName: checkoutData.name,
            phone: checkoutData.phone,
            line1: checkoutData.line1,
            city: checkoutData.city,
            state: checkoutData.state,
            postalCode: checkoutData.pincode,
            country: 'India',
          },
          paymentMethod: checkoutData.paymentMethod,
        }),
      });

      if (!orderRes.success) {
        throw new Error(orderRes.message || 'Failed to create order.');
      }

      const orderId = orderRes.data.id;

      if (checkoutData.paymentMethod === 'cod') {
        setIsPlaced(true);
        await clearCart();
        setLoading(false);
        return;
      }

      trackEvent('add_payment_info', {
        ...analyticsBase,
        payment_type: 'Razorpay',
      });

      await initiatePayment({
        orderId,
        checkoutData,
        analyticsContext: {
          ...analyticsBase,
          payment_type: 'Razorpay',
        },
        onSuccess: async () => {
          trackEvent('purchase', {
            transaction_id: orderId,
            currency: 'INR',
            value: grandTotal,
            tax: taxes,
            shipping: 0,
            items: gaItems,
          });
          setIsPlaced(true);
          await clearCart();
          setLoading(false);
        },
        onFailure: (message) => {
          setError(message);
          setLoading(false);
        },
      });
    } catch (err) {
      setError(err.message || 'Unable to place your order right now.');
      setLoading(false);
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
            <section className="lu-cart-panel" aria-label="Cart Items">
              <p className="lu-cart-title">Order Items - {totalItems}</p>
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
                        <button className="lu-qty-btn" type="button" onClick={() => removeItem(item.id || item._id)} aria-label="Decrease quantity">-</button>
                        <span className="lu-qty-count">{item.quantity}</span>
                        <button className="lu-qty-btn" type="button" onClick={() => addItem(item)} aria-label="Increase quantity">+</button>
                      </div>
                      <button className="lu-cart-remove" type="button" onClick={() => deleteItem(item.id || item._id)}>Remove</button>
                    </div>
                  </div>
                </article>
              ))}
            </section>

            <aside className="lu-cart-panel" aria-label="Checkout">
              <p className="lu-cart-title">Checkout</p>

              <div className="lu-totals" style={{ marginBottom: '28px' }}>
                <div className="lu-totals-row"><span>Subtotal</span><span>₹{subtotal}</span></div>
                <div className="lu-totals-row"><span>GST (18%)</span><span>₹{taxes}</span></div>
                <div className="lu-totals-row grand" role="status" aria-live="polite" aria-atomic="true"><span>Total</span><strong>₹{grandTotal}</strong></div>
              </div>

              <CheckoutForm user={user} loading={loading} error={error} onSubmit={onCheckout} />
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
