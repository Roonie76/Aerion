import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';
import SectionHeading from '../components/SectionHeading';
import Button from '../components/Button';
import { useAuth } from '../context';

export default function Orders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login?redirect=orders');
      return;
    }

    async function fetchOrders() {
      try {
        const response = await fetch('/api/orders/my-orders');
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setOrders(data.data);
          }
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [user, navigate]);

  if (loading) {
    return (
      <PageWrapper>
        <div className="site-container py-20 text-center">Loading your orders...</div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <section className="section-block page-section">
        <div className="site-container">
          <SectionHeading title="My Orders" subtitle="Track your order status and history." />

          {orders.length === 0 ? (
            <div className="cart-empty-state">
              <p className="cart-empty-copy">You haven't placed any orders yet.</p>
              <div className="cart-empty-actions">
                <Button onClick={() => navigate('/series')}>Start Shopping</Button>
              </div>
            </div>
          ) : (
            <div className="orders-list">
              {orders.map((order) => (
                <article key={order._id} className="order-card glassmorphic-card p-6 mb-6">
                  <div className="order-header flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm opacity-60">Order ID: #{order._id.substring(0, 8).toUpperCase()}</p>
                      <p className="font-semibold text-lg">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <span className={`status-badge status-${order.orderStatus}`}>
                        {order.orderStatus.toUpperCase()}
                      </span>
                      <p className="mt-1 font-bold">INR {order.total}</p>
                    </div>
                  </div>

                  <div className="order-items grid gap-4 border-t border-gray-100 pt-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex gap-4 items-center">
                        <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm opacity-60">Qty: {item.quantity} × INR {item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="order-footer grid gap-1 border-t border-gray-100 pt-4 mt-4 text-sm opacity-80">
                    <p><strong>Shipping to:</strong> {order.shippingAddress.address}</p>
                    <p><strong>Payment:</strong> {order.paymentMethod.toUpperCase()} ({order.paymentStatus})</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </PageWrapper>
  );
}
