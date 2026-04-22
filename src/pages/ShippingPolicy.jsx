import React from 'react';
import LegalPage from './LegalPage';

export default function ShippingPolicy() {
  return (
    <LegalPage overline="Support" title="Shipping Policy" updated="21 April 2026">
      <p>
        We ship across India from our warehouse in Gurgaon, Haryana. This policy covers dispatch
        times, delivery estimates, and shipping charges.
      </p>

      <h2>1. Dispatch times</h2>
      <ul>
        <li>Orders placed before <strong>14:00 IST</strong> on a business day are dispatched the same day.</li>
        <li>Orders placed later, or on Sundays and public holidays, are dispatched the next business day.</li>
        <li>You will receive a shipment confirmation email with the courier name and tracking number once the order is dispatched.</li>
      </ul>

      <h2>2. Delivery estimates (from dispatch)</h2>
      <ul>
        <li>Metro cities (Delhi NCR, Mumbai, Bengaluru, Hyderabad, Chennai, Kolkata, Pune, Ahmedabad): <strong>2–4 business days</strong>.</li>
        <li>Other Tier-1 and Tier-2 cities: <strong>3–6 business days</strong>.</li>
        <li>Remote pincodes and north-eastern states: <strong>5–10 business days</strong>.</li>
      </ul>
      <p>
        These are estimates. Delivery times may be affected by courier load, weather, strikes, and
        other factors beyond our control.
      </p>

      <h2>3. Shipping charges</h2>
      <ul>
        <li><strong>Free standard shipping</strong> on all orders of ₹2,000 or more (after discounts).</li>
        <li>Orders under ₹2,000 are charged a flat ₹80 shipping fee.</li>
        <li>Cash on Delivery: an additional handling fee of ₹50 may apply on eligible orders.</li>
      </ul>

      <h2>4. Serviceability</h2>
      <p>
        Enter your pincode at checkout to confirm serviceability. If your pincode is not serviceable,
        contact us and we will try to arrange a courier on a best-effort basis.
      </p>

      <h2>5. International shipping</h2>
      <p>
        We do not currently ship outside India. For bulk international enquiries, email
        <a href="mailto:aerionsports@gmail.com"> aerionsports@gmail.com</a>.
      </p>

      <h2>6. Tracking and delivery attempts</h2>
      <ul>
        <li>Our courier partners typically make up to 3 delivery attempts.</li>
        <li>If all attempts fail and the shipment is returned to origin, we will contact you to re-ship (re-shipping fee may apply) or refund as per our <a href="/refund-policy">Refund Policy</a>.</li>
      </ul>

      <h2>7. Damaged or lost parcels</h2>
      <p>
        If a parcel arrives damaged or is marked delivered but not received, email us within 48 hours
        of the delivery date with photos or details. We will investigate with the courier and arrange a
        replacement or refund.
      </p>

      <h2>8. Contact</h2>
      <p>
        Email: <a href="mailto:aerionsports@gmail.com">aerionsports@gmail.com</a><br />
        Phone: +91 99xxxxxx45 (Mon–Sat, 10:00–19:00 IST)
      </p>
    </LegalPage>
  );
}
