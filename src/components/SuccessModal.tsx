import React, { useEffect } from 'react';
import { AIModel } from '../types/model';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  model: AIModel | null;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose, model }) => {
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


  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="success-modal-title"
    >
      <div 
        className="bg-white rounded-2xl p-8 max-w-md w-full text-center my-auto"
        tabIndex={-1}
      >

        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Free Trial Activated!</h2>
        <p className="text-gray-600 mb-6">Your 7-day free trial with {model.name} has started. Enjoy unlimited access!</p>

        <button
          onClick={onClose}
          className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium"
        >
          Start Chatting
        </button>
      </div>
    </div>
  );
};
