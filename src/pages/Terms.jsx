import React from 'react';
import LegalPage from './LegalPage';

export default function Terms() {
  return (
    <LegalPage overline="Legal" title="Terms & Conditions" updated="21 April 2026">
      <p>
        These Terms govern your use of aerionsports.com and any purchase you make from Aerion Sports
        (&ldquo;Aerion&rdquo;, &ldquo;we&rdquo;). By using the site or placing an order, you accept these Terms.
      </p>

      <h2>1. About us</h2>
      <p>
        Aerion Sports is operated from Sector 92, Gurgaon, India. Contact:
        <a href="mailto:aerionsports@gmail.com"> aerionsports@gmail.com</a>, +91 99112 25445.
      </p>

      <h2>2. Eligibility</h2>
      <p>
        You must be at least 18 years old and capable of entering a binding contract under applicable
        law to place an order.
      </p>

      <h2>3. Products and pricing</h2>
      <ul>
        <li>All prices are listed in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise at checkout.</li>
        <li>We make reasonable efforts to display product details and images accurately; slight variations are possible.</li>
        <li>We reserve the right to correct pricing errors or cancel orders with an incorrect price, with a full refund to you.</li>
      </ul>

      <h2>4. Orders and acceptance</h2>
      <p>
        Placing an order is an offer to buy. The contract is formed only when we confirm dispatch. We
        may decline any order, including for suspected fraud, failure of payment authorisation, or
        non-serviceable delivery address.
      </p>

      <h2>5. Payment</h2>
      <p>
        Payments are processed by Razorpay Software Private Limited. Cash on Delivery is available for
        eligible pincodes and order values. We do not store complete payment credentials.
      </p>

      <h2>6. Shipping, returns and refunds</h2>
      <p>
        See our <a href="/shipping-policy">Shipping Policy</a> and <a href="/refund-policy">Refund Policy</a>
        for delivery timelines, return eligibility, and refund procedures.
      </p>

      <h2>7. Acceptable use</h2>
      <ul>
        <li>Do not use the site for any unlawful purpose or in a way that could damage or disrupt it.</li>
        <li>Do not attempt unauthorised access, reverse-engineer the service, or scrape at scale.</li>
        <li>Do not submit reviews or content that are defamatory, misleading, or infringe third-party rights.</li>
      </ul>

      <h2>8. Intellectual property</h2>
      <p>
        The site content, including the Aerion name, logo, product photography, and copy, is owned by
        Aerion Sports or its licensors and may not be copied or reused without written permission.
      </p>

      <h2>9. Disclaimers</h2>
      <p>
        Shuttlecocks are consumable sporting goods and wear through normal play. Performance may vary
        with temperature, altitude, humidity, and stroke technique. Specifications are calibrated under
        controlled conditions; your court conditions may differ.
      </p>

      <h2>10. Limitation of liability</h2>
      <p>
        To the extent permitted by law, our aggregate liability for any claim relating to an order is
        limited to the amount you paid for that order. We are not liable for indirect or consequential
        loss.
      </p>

      <h2>11. Governing law and jurisdiction</h2>
      <p>
        These Terms are governed by the laws of India. Courts at Gurugram, Haryana shall have exclusive
        jurisdiction over any disputes.
      </p>

      <h2>12. Changes</h2>
      <p>
        We may update these Terms. Continued use of the site after updates constitutes acceptance. The
        &ldquo;last updated&rdquo; date above reflects the most recent version.
      </p>
    </LegalPage>
  );
}
