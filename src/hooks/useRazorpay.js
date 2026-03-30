/**
 * useRazorpay — A hook to encapsulate Razorpay initialization and payment flow.
 * Keeps payment infrastructure out of Cart.jsx and other UI components.
 *
 * Usage:
 *   const { initiatePayment } = useRazorpay();
 *   await initiatePayment({ amount, checkoutData, onSuccess, onFailure });
 */
export function useRazorpay() {
  const initiatePayment = async ({ amount, checkoutData, onSuccess, onFailure }) => {
    try {
      // 1. Fetch the Razorpay public key from the server
      const keyRes = await fetch('/api/v1/payments/key', { credentials: 'include' });
      if (!keyRes.ok) throw new Error('Could not fetch payment configuration.');
      const { keyId } = await keyRes.json();

      // 2. Create a Razorpay order on the server
      const orderRes = await fetch('/api/v1/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ amount: amount * 100 }), // convert to paise
      });
      const orderData = await orderRes.json();
      if (!orderData.success) throw new Error('Failed to create payment order.');

      // 3. Mock mode — skip actual Razorpay flow
      if (orderData.mode === 'mock') {
        await onSuccess({
          razorpay_order_id: orderData.data.id,
          razorpay_payment_id: 'mock_pay_dev',
          razorpay_signature: 'mock_sig_dev',
        });
        return;
      }

      // 4. Open Razorpay payment modal
      const options = {
        key: keyId,
        amount: orderData.data.amount,
        currency: orderData.data.currency,
        name: 'AERION',
        description: 'Elite Badminton Shuttlecocks',
        order_id: orderData.data.id,
        prefill: {
          name: checkoutData?.fullName,
          email: checkoutData?.email,
          contact: checkoutData?.phone,
        },
        theme: { color: '#c9a84c' }, // Aerion Gold
        handler: async (response) => {
          // 5. Verify signature on the server
          const verifyRes = await fetch('/api/v1/payments/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();

          if (verifyData.success && verifyData.verified) {
            await onSuccess(response);
          } else {
            onFailure('Payment signature verification failed. Please contact support.');
          }
        },
      };

      if (!window.Razorpay) {
        throw new Error('Razorpay SDK is not loaded. Please check your internet connection.');
      }

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        onFailure(response.error?.description || 'Payment failed. Please try again.');
      });
      rzp.open();
    } catch (err) {
      onFailure(err.message || 'Payment initialization failed.');
    }
  };

  return { initiatePayment };
}
