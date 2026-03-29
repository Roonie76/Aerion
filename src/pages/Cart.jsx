import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import PageWrapper from '../components/PageWrapper';
import SectionHeading from '../components/SectionHeading';
import { useCart, useAuth } from '../context';

const TAX_RATE = 0.12;

export default function Cart() {
  const navigate = useNavigate();
  const { cartItems, addItem, removeItem, deleteItem, clearCart } = useCart();
  const { user } = useAuth();
  
  const [isPlaced, setIsPlaced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [checkoutData, setCheckoutData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    paymentMethod: 'card',
  });

  useEffect(() => {
    if (user) {
      setCheckoutData(prev => ({
        ...prev,
        fullName: user.name,
        email: user.email
      }));
    }
  }, [user]);

  const { subtotal, taxes, totalItems, grandTotal } = useMemo(() => {
    const computedSubtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const computedItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const computedTaxes = Math.round(computedSubtotal * TAX_RATE);

    return {
      subtotal: computedSubtotal,
      taxes: computedTaxes,
      totalItems: computedItems,
      grandTotal: computedSubtotal + computedTaxes,
    };
  }, [cartItems]);

  const onChangeField = (event) => {
    const { name, value } = event.target;
    setCheckoutData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePayment = async () => {
    try {
      // 1. Get Public Key
      const keyRes = await fetch('/api/payments/key');
      const { keyId } = await keyRes.json();

      // 2. Create Order on Server
      const orderRes = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: grandTotal * 100 }), // Amount in paise
      });
      const orderData = await orderRes.json();

      if (!orderData.success) {
        throw new Error('Failed to create payment order');
      }

      const options = {
        key: keyId,
        amount: orderData.data.amount,
        currency: orderData.data.currency,
        name: 'AERION',
        description: 'Purchase of high-performance shuttlecocks',
        order_id: orderData.data.id,
        handler: async (response) => {
          // 3. Verify Payment
          const verifyRes = await fetch('/api/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            await finalizeOrder(response);
          } else {
            setError('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: checkoutData.fullName,
          email: checkoutData.email,
          contact: checkoutData.phone,
        },
        theme: { color: '#ef4444' },
      };

      if (orderData.mode === 'mock') {
        // Automatically simulate success in mock mode
        console.log('Mock Payment Mode Active');
        await finalizeOrder({
            razorpay_order_id: orderData.data.id,
            razorpay_payment_id: 'mock_pay_123',
            razorpay_signature: 'mock_sig_456'
        });
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err.message || 'Payment initialization failed.');
    }
  };

  const finalizeOrder = async (paymentResponse = {}) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

      if (response.ok) {
        setIsPlaced(true);
        clearCart();
      } else {
        const err = await response.json();
        throw new Error(err.message || 'Failed to record order.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onCheckout = async (event) => {
    event.preventDefault();
    setError('');

    if (!user) {
      navigate('/login?redirect=cart');
      return;
    }

    if (cartItems.length === 0) {
      return;
    }

    setLoading(true);

    if (checkoutData.paymentMethod === 'cod') {
      await finalizeOrder();
    } else {
      await handlePayment();
    }
  };

  if (isPlaced) {
    return (
      <PageWrapper>
        <section className="section-block page-section">
          <div className="site-container cart-empty-state">
            <SectionHeading title="Order Confirmed" subtitle="Your checkout has been placed successfully." />
            <p className="cart-empty-copy">
              Thank you for choosing AERION. Our operations team will process your order and share shipping details via
              email shortly.
            </p>
            <div className="cart-empty-actions">
              <Button onClick={() => navigate('/series')}>Continue Shopping</Button>
            </div>
          </div>
        </section>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <section className="section-block page-section">
        <div className="site-container">
          <SectionHeading title="Cart & Checkout" subtitle="Review your order and complete secure checkout." />

          {error && <div className="cart-error-message mb-6 p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

          {cartItems.length === 0 ? (
            <div className="cart-empty-state">
              <p className="cart-empty-copy">Your cart is empty. Add products to start your checkout.</p>
              <div className="cart-empty-actions">
                <Button onClick={() => navigate('/series')}>Explore Flight Series</Button>
              </div>
            </div>
          ) : (
            <div className="cart-layout">
              <section className="cart-list" aria-label="Cart Items">
                <h3 className="cart-title">Order Items ({totalItems})</h3>

                {cartItems.map((item) => (
                  <article key={item.id || item._id} className="cart-item">
                    <img src={item.img || item.image} alt={item.name} className="cart-item-image" loading="lazy" decoding="async" />

                    <div className="cart-item-content">
                      <div className="cart-item-head">
                        <div>
                          <h4>{item.name}</h4>
                          <p>{item.series}</p>
                        </div>
                        <span className="cart-item-price">INR {item.price}</span>
                      </div>

                      <div className="cart-item-actions">
                        <div className="qty-controls" aria-label={`Quantity controls for ${item.name}`}>
                          <button type="button" onClick={() => removeItem(item.id || item._id)} aria-label={`Decrease ${item.name}`}>
                            -
                          </button>
                          <span>{item.quantity}</span>
                          <button type="button" onClick={() => addItem(item)} aria-label={`Increase ${item.name}`}>
                            +
                          </button>
                        </div>

                        <button
                          type="button"
                          className="cart-remove"
                          onClick={() => deleteItem(item.id || item._id)}
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </section>

              <aside className="checkout-panel" aria-label="Checkout Summary">
                <h3 className="cart-title">Checkout Procedure</h3>
                <ol className="checkout-steps">
                  <li>Confirm selected products and quantity.</li>
                  <li>Enter shipping and contact details.</li>
                  <li>Select payment method and place order.</li>
                </ol>

                <form className="checkout-form" onSubmit={onCheckout}>
                  <label>
                    Full Name
                    <input
                      required
                      name="fullName"
                      value={checkoutData.fullName}
                      onChange={onChangeField}
                      autoComplete="name"
                    />
                  </label>

                  <label>
                    Email
                    <input
                      required
                      type="email"
                      name="email"
                      value={checkoutData.email}
                      onChange={onChangeField}
                      autoComplete="email"
                    />
                  </label>

                  <label>
                    Phone
                    <input
                      required
                      name="phone"
                      value={checkoutData.phone}
                      onChange={onChangeField}
                      autoComplete="tel"
                    />
                  </label>

                  <label>
                    Shipping Address
                    <textarea
                      required
                      name="address"
                      value={checkoutData.address}
                      onChange={onChangeField}
                      rows="3"
                      autoComplete="street-address"
                    />
                  </label>

                  <fieldset className="payment-group">
                    <legend>Payment Method</legend>
                    <label>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="card"
                        checked={checkoutData.paymentMethod === 'card'}
                        onChange={onChangeField}
                      />
                      Card / UPI (Razorpay)
                    </label>
                    <label>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={checkoutData.paymentMethod === 'cod'}
                        onChange={onChangeField}
                      />
                      Cash on Delivery
                    </label>
                  </fieldset>

                  <div className="checkout-totals">
                    <p>
                      <span>Subtotal</span>
                      <strong>INR {subtotal}</strong>
                    </p>
                    <p>
                      <span>Taxes (12%)</span>
                      <strong>INR {taxes}</strong>
                    </p>
                    <p className="checkout-grand-total">
                      <span>Total</span>
                      <strong>INR {grandTotal}</strong>
                    </p>
                  </div>

                  <Button type="submit" className="checkout-submit" disabled={loading} ariaLabel="Place Order">
                    {loading ? 'Processing...' : 'Place Order'}
                  </Button>
                </form>
              </aside>
            </div>
          )}
        </div>
      </section>
    </PageWrapper>
  );
}
