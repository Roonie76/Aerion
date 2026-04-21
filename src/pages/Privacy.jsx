import React from 'react';
import LegalPage from './LegalPage';

export default function Privacy() {
  return (
    <LegalPage overline="Legal" title="Privacy Policy" updated="21 April 2026">
      <p>
        Aerion Sports (&ldquo;Aerion&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) respects your privacy. This policy
        explains what personal information we collect when you use aerionsports.com, how we use it, and
        the choices you have. This policy is issued in compliance with the Digital Personal Data
        Protection Act, 2023 (India) and applicable consumer protection rules.
      </p>

      <h2>1. Information we collect</h2>
      <h3>Information you provide</h3>
      <ul>
        <li>Name, email, phone number, and shipping address when you place an order or create an account.</li>
        <li>Payment information is collected and processed by our payment partner (Razorpay). We do not store full card numbers or CVVs on our servers.</li>
        <li>Messages you send via the contact form.</li>
      </ul>
      <h3>Information collected automatically</h3>
      <ul>
        <li>Device and browser type, IP address, pages visited, and referring URL (standard web logs).</li>
        <li>Cookies and similar technologies used to keep you signed in and remember your cart. See our Cookies section below.</li>
      </ul>

      <h2>2. How we use your information</h2>
      <ul>
        <li>To process and fulfil orders, including sharing address and contact details with our shipping partners.</li>
        <li>To communicate order status, shipping updates, and respond to support enquiries.</li>
        <li>To send marketing communications if you have opted in (you can unsubscribe at any time).</li>
        <li>To prevent fraud, comply with legal obligations, and enforce our Terms.</li>
      </ul>

      <h2>3. Sharing with third parties</h2>
      <p>We share only what is needed to operate the service:</p>
      <ul>
        <li><strong>Payments:</strong> Razorpay Software Private Limited.</li>
        <li><strong>Shipping:</strong> courier partners required to deliver your order.</li>
        <li><strong>Infrastructure:</strong> our hosting and email-delivery providers, under confidentiality obligations.</li>
        <li><strong>Legal:</strong> when required by law, court order, or to protect our rights.</li>
      </ul>
      <p>We do not sell your personal information.</p>

      <h2>4. Cookies</h2>
      <p>
        We use essential cookies for authentication and cart persistence. We do not currently set
        third-party advertising cookies. You can control cookies from your browser settings; disabling
        essential cookies may prevent checkout from working.
      </p>

      <h2>5. Data retention</h2>
      <p>
        Account and order records are retained for as long as your account is active and for up to 7
        years thereafter to meet tax, accounting, and legal requirements. You can request deletion of
        your account; residual records required by law will be kept until the retention period ends.
      </p>

      <h2>6. Your rights</h2>
      <ul>
        <li>Access the personal data we hold about you.</li>
        <li>Request correction of inaccurate data.</li>
        <li>Request deletion of your account and personal data, subject to legal retention rules.</li>
        <li>Withdraw consent for marketing communications.</li>
      </ul>
      <p>To exercise any of these rights, email <a href="mailto:aerionsports@gmail.com">aerionsports@gmail.com</a>.</p>

      <h2>7. Security</h2>
      <p>
        We use HTTPS, hashed password storage (via Firebase Authentication), and access controls on
        production data. No system is perfectly secure; if we detect a breach that affects you, we will
        notify you without undue delay.
      </p>

      <h2>8. Children</h2>
      <p>Aerion is not directed at children under 18. We do not knowingly collect data from minors.</p>

      <h2>9. Changes to this policy</h2>
      <p>
        We may update this policy from time to time. The &ldquo;last updated&rdquo; date above reflects the
        most recent revision. Material changes will be highlighted on the site.
      </p>

      <h2>10. Contact</h2>
      <p>
        Aerion Sports, Sector 92, Gurgaon, India.<br />
        Email: <a href="mailto:aerionsports@gmail.com">aerionsports@gmail.com</a><br />
        Phone: +91 99112 25445
      </p>
    </LegalPage>
  );
}
