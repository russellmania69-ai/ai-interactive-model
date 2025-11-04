import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

export const PromoBanner: React.FC = () => {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 relative">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
        <Sparkles className="w-5 h-5" />
        <p className="text-sm md:text-base font-medium">
          <strong>Special Offer:</strong> Start your 7-day FREE trial today! No credit card required.
        </p>

        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 hover:bg-white/20"
          onClick={() => setVisible(false)}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
