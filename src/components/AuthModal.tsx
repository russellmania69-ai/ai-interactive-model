import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { PasswordResetForm } from '@/components/auth/PasswordResetForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'login' | 'signup' | 'reset';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialView = 'login' }) => {
  const [view, setView] = useState<'login' | 'signup' | 'reset'>(initialView);

  const handleSuccess = () => {
    onClose();
    setView('login');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {view === 'login' && 'Welcome Back'}
            {view === 'signup' && 'Create Account'}
            {view === 'reset' && 'Reset Password'}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {view === 'login' && (
            <LoginForm
              onSuccess={handleSuccess}
              onSwitchToSignUp={() => setView('signup')}
              onSwitchToReset={() => setView('reset')}
            />
          )}
          
          {view === 'signup' && (
            <SignUpForm
              onSuccess={handleSuccess}
              onSwitchToLogin={() => setView('login')}
            />
          )}
          
          {view === 'reset' && (
            <PasswordResetForm
              onSuccess={handleSuccess}
              onSwitchToLogin={() => setView('login')}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
