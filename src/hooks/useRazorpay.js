/**
 * useRazorpay — A hook to encapsulate Razorpay initialization and payment flow.
 */
import { useAuth } from '../context';

export function useRazorpay() {
  const { request } = useAuth();
  const initiatePayment = async ({ orderId, checkoutData, onSuccess, onFailure }) => {
    try {
      // 1. Fetch the Razorpay public key from the server
      const keyRes = await request('/payments/key');
      if (!keyRes.success) throw new Error(keyRes.message || 'Could not fetch payment configuration.');
      const { keyId } = keyRes.data;

      // 2. Create payment intent anchored to the database order
      const intentRes = await request('/payments/create-intent', {
        method: 'POST',
        body: JSON.stringify({ orderId }), 
      });
      if (!intentRes.success) throw new Error(intentRes.message || 'Failed to create payment intent.');
      const orderData = intentRes.data;
      const providerOrder = orderData.data;

      // 3. Mock mode — skip actual Razorpay flow
      if (orderData.mode === 'mock') {
        // Fast-track mock verification against server architecture
        const verifyRes = await request('/payments/verify', {
          method: 'POST',
          body: JSON.stringify({
            razorpayOrderId: providerOrder.id,
            razorpayPaymentId: 'mock_pay_dev',
            razorpaySignature: 'mock_sig_dev',
          }),
        });

        if (verifyRes.success) {
          await onSuccess();
        } else {
          onFailure('Mock payment failed verification.');
        }
        return;
      }

      // 4. Open Razorpay payment modal
      const options = {
        key: keyId,
        amount: providerOrder.amount,
        currency: providerOrder.currency,
        name: 'AERION',
        description: 'Elite Badminton Shuttlecocks',
        order_id: providerOrder.id,
        prefill: {
          name: checkoutData?.fullName,
          email: checkoutData?.email,
          contact: checkoutData?.phone,
        },
        theme: { color: '#c9a84c' }, // Aerion Gold
        handler: async (response) => {
          // 5. Verify signature on the server ensuring db lock resolves
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
