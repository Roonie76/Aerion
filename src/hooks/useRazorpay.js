/**
 * useRazorpay — A hook to encapsulate Razorpay initialization and payment flow.
 */
import { useAuth } from '../context';

export function useRazorpay() {
  const { request } = useAuth();
  const initiatePayment = async ({ amount, checkoutData, onSuccess, onFailure }) => {
    try {
      // 1. Fetch the Razorpay public key from the server
      const keyRes = await request('/payments/key');
      if (!keyRes.success) throw new Error(keyRes.message || 'Could not fetch payment configuration.');
      const { keyId } = keyRes.data;

      // 2. Create a Razorpay order on the server
      const orderRes = await request('/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({ amount: amount * 100 }), // convert to paise
      });
      if (!orderRes.success) throw new Error(orderRes.message || 'Failed to create payment order.');
      const orderData = orderRes.data;

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
          const verifyRes = await request('/payments/verify', {
            method: 'POST',
            body: JSON.stringify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });

          if (verifyRes.success && verifyRes.data.verified) {
            await onSuccess(response);
          } else {
            onFailure(verifyRes.message || 'Payment signature verification failed.');
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
