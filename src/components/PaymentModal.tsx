import React, { useState, useEffect } from 'react';
import { AIModel } from '../types/model';
import { supabase } from '@/lib/supabase';
import { CreditCard, Wallet } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  model: AIModel | null;
  onSuccess: () => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, model, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'crypto' | 'paypal'>('card');

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !model) return null;


  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setError('');
    
    try {
      if (paymentMethod === 'card') {
        // Use Stripe for card payments
        const { data, error: fnError } = await supabase.functions.invoke('create-stripe-checkout', {
          body: { 
            modelName: model.name,
            modelId: model.id,
            amount: model.subscriptionPrice,
            userEmail: email 
          },
        });

        if (fnError) {
          throw new Error(fnError.message || 'Failed to connect to payment service');
        }

        if (data?.error) {
          throw new Error(data.error as string);
        }
        
        if (data?.url) {
          window.location.href = data.url as string;
        } else {
          throw new Error('No payment URL received');
        }

      } else if (paymentMethod === 'paypal') {
        // Use PayPal for PayPal payments
        const { data, error: fnError } = await supabase.functions.invoke('create-paypal-order', {
          body: { 
            modelName: model.name,
            modelId: model.id,
            amount: model.subscriptionPrice,
            userEmail: email 
          },
        });

        if (fnError) {
          throw new Error(fnError.message || 'Failed to connect to PayPal');
        }

        if (data?.error) {
          throw new Error(data.error as string);
        }
        
        if (data?.approvalUrl) {
          window.location.href = data.approvalUrl as string;
        } else {
          throw new Error('No PayPal approval URL received');
        }

      } else if (paymentMethod === 'crypto') {
        setError('Cryptocurrency payments are temporarily unavailable. Please use credit card or PayPal.');
        setProcessing(false);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed. Please try again.';
      setError(errorMessage);
      setProcessing(false);
    }
  };


  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-modal-title"
    >
      <div 
        className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto my-auto"
        tabIndex={-1}
      >

        <h2 className="text-3xl font-bold text-gray-900 mb-2">Subscribe to {model.name}</h2>
        <p className="text-gray-600 mb-6">Start your 7-day free trial</p>
        
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">FREE TRIAL</div>
            <span className="text-lg font-bold text-green-700">7 Days Free</span>
          </div>
          <p className="text-sm text-gray-700">No credit card required. Cancel anytime during trial.</p>
        </div>

        <div className="bg-purple-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-700">After trial ends</span>
            <span className="text-2xl font-bold text-purple-600">${model.subscriptionPrice}/mo</span>
          </div>
          <p className="text-sm text-gray-600">Billed monthly, cancel anytime</p>
        </div>


        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={`w-full p-4 rounded-lg border-2 transition-all flex items-center gap-3 ${
                paymentMethod === 'card' ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <CreditCard className="w-5 h-5" />
              <div className="text-left flex-1">
                <div className="font-semibold">Credit/Debit Card</div>
                <div className="text-xs text-gray-600">Visa, Mastercard, Amex</div>
              </div>
            </button>
            
            <button
              type="button"
              disabled
              className="w-full p-4 rounded-lg border-2 border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed flex items-center gap-3"
            >
              <div className="w-5 h-5 bg-gray-400 rounded flex items-center justify-center text-white text-xs font-bold">P</div>
              <div className="text-left flex-1">
                <div className="font-semibold text-gray-600">PayPal</div>
                <div className="text-xs text-gray-500">Coming soon</div>
              </div>
              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Disabled</span>
            </button>


            <button
              type="button"
              disabled
              className="w-full p-4 rounded-lg border-2 border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed flex items-center gap-3"
            >
              <Wallet className="w-5 h-5 text-gray-400" />
              <div className="text-left flex-1">
                <div className="font-semibold text-gray-600">Cryptocurrency</div>
                <div className="text-xs text-gray-500">Coming soon</div>
              </div>
              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">Disabled</span>
            </button>

          </div>
        </div>

        <form onSubmit={handlePayment}>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-4"
            required
          />

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={processing}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={processing}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium disabled:opacity-50"
            >
              {processing ? 'Processing...' : 'Start Free Trial'}

            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
