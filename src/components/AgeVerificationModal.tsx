import React, { useState, useEffect } from 'react';

interface AgeVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
}

export const AgeVerificationModal: React.FC<AgeVerificationModalProps> = ({ isOpen, onClose, onVerified }) => {
  const [birthDate, setBirthDate] = useState('');
  const [error, setError] = useState('');

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

  if (!isOpen) return null;


  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      if (age - 1 >= 18) {
        onVerified();
      } else {
        setError('You must be 18 or older to subscribe.');
      }
    } else if (age >= 18) {
      onVerified();
    } else {
      setError('You must be 18 or older to subscribe.');
    }
  };

  const handleYesNo = (isOver18: boolean) => {
    if (isOver18) {
      onVerified();
    } else {
      setError('You must be 18 or older to subscribe.');
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-verification-title"
    >
      <div 
        className="bg-white rounded-2xl p-8 max-w-md w-full my-auto"
        tabIndex={-1}
      >

        <h2 className="text-3xl font-bold text-gray-900 mb-2">Age Verification</h2>
        <p className="text-gray-600 mb-6">Are you over 18?</p>
        <div className="mb-6 flex gap-3">
          <button
            type="button"
            onClick={() => handleYesNo(true)}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-medium"
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => handleYesNo(false)}
            className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            No
          </button>
        </div>
        <form onSubmit={handleVerify}>
          <label className="block text-sm font-medium text-gray-700 mb-2">Or enter your Date of Birth</label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => { setBirthDate(e.target.value); setError(''); }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-4"
          />
          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium"
            >
              Verify
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
