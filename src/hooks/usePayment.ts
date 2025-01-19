import { create } from 'zustand';
import { api } from '../lib/axios';

interface PaymentState {
  loading: boolean;
  error: string | null;
  processPayment: (amount: number, rideId: string) => Promise<boolean>;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const usePayment = create<PaymentState>((set) => ({
  loading: false,
  error: null,

  processPayment: async (amount: number, rideId: string) => {
    set({ loading: true, error: null });
    try {
      // Create order
      const orderResponse = await api.post('/payments/create-order', {
        amount,
        rideId
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderResponse.data.amount,
        currency: orderResponse.data.currency,
        name: 'Raftaar',
        description: 'Ride Payment',
        order_id: orderResponse.data.orderId,
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyResponse = await api.post('/payments/verify', {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature
            });
            
            if (verifyResponse.data.success) {
              return true;
            }
            throw new Error('Payment verification failed');
          } catch (error) {
            console.error('Payment verification error:', error);
            throw error;
          }
        },
        prefill: {
          name: 'User Name', // Get from user profile
          email: 'user@example.com', // Get from user profile
          contact: '+91XXXXXXXXXX' // Get from user profile
        },
        theme: {
          color: '#000000'
        }
      };

      return new Promise((resolve, reject) => {
        const razorpay = new window.Razorpay(options);
        razorpay.on('payment.failed', (response: any) => {
          set({ error: 'Payment failed' });
          reject(new Error('Payment failed'));
        });
        razorpay.open();
      });
    } catch (error: any) {
      set({ error: error.message || 'Payment processing failed' });
      throw error;
    } finally {
      set({ loading: false });
    }
  }
}));