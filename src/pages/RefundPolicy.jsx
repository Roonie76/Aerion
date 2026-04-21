import React from 'react';
import LegalPage from './LegalPage';

export default function RefundPolicy() {
  return (
    <LegalPage overline="Support" title="Refund & Returns Policy" updated="21 April 2026">
      <p>
        We want you to be satisfied with every tube of Aerion shuttlecocks you receive. This policy
        explains when you can return an order and how refunds are processed.
      </p>

      <h2>1. Return window</h2>
      <p>
        You may request a return within <strong>7 days</strong> of delivery if the product meets the
        eligibility conditions below.
      </p>

      <h2>2. Eligibility</h2>
      <ul>
        <li>The tube must be <strong>unopened and in its original, undamaged packaging</strong>. Opened tubes are not eligible for return because shuttlecocks are performance-sensitive and cannot be re-sold.</li>
        <li>Returns are accepted for: damage in transit, defective units, or wrong item shipped.</li>
        <li>Change-of-mind returns are at our discretion and may incur a restocking fee.</li>
      </ul>

      <h2>3. How to request a return</h2>
      <ol>
        <li>Email <a href="mailto:aerionsports@gmail.com">aerionsports@gmail.com</a> within 7 days of delivery with your order ID and photos of the issue.</li>
        <li>We will reply within 2 business days with a return authorisation and instructions.</li>
        <li>Ship the item back to the address we provide, using a trackable courier. Keep the tracking number.</li>
      </ol>

      <h2>4. Refunds</h2>
      <ul>
        <li>Refunds are issued to the original payment method within <strong>7 business days</strong> of us receiving and inspecting the returned item.</li>
        <li>For online payments, the refund appears on your card/UPI statement within 5–10 business days depending on your bank.</li>
        <li>For Cash on Delivery orders, refunds are transferred via bank / UPI after you share account details with us.</li>
      </ul>

      <h2>5. Cancellations</h2>
      <p>
        Orders can be cancelled free of charge before we mark them as dispatched. Once dispatched, the
        return process above applies.
      </p>

      <h2>6. Non-returnable items</h2>
      <ul>
        <li>Tubes that have been opened.</li>
        <li>Items damaged by misuse, play wear, or improper storage.</li>
        <li>Final-sale or clearance items, if explicitly marked at the time of purchase.</li>
      </ul>

      <h2>7. Damaged or wrong deliveries</h2>
      <p>
        If your order arrives damaged or is not what you ordered, email us within 48 hours of delivery
        with photos. We will arrange a replacement or full refund at no cost to you.
      </p>

      <h2>8. Contact</h2>
      <p>
        Email: <a href="mailto:aerionsports@gmail.com">aerionsports@gmail.com</a><br />
        Phone: +91 99112 25445 (Mon–Sat, 10:00–19:00 IST)
      </p>
    </LegalPage>
  );
}
