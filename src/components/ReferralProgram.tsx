import React, { useState } from 'react';
import { Gift, Copy, Users } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { toast } from 'sonner';

export const ReferralProgram: React.FC = () => {
  const referralCode = 'FRIEND2025';
  const referralLink = `${window.location.origin}?ref=${referralCode}`;

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied!');
  };

  return (
    <div className="py-12 md:py-16 bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="max-w-4xl mx-auto px-4">
        <Card className="p-6 md:p-8">
          <div className="text-center mb-6 md:mb-8">
            <Gift className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 text-purple-600" />
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">Refer Friends, Get Rewards</h2>
            <p className="text-base md:text-xl text-gray-600">Earn 20% commission on every friend's subscription!</p>
          </div>

          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-6 bg-purple-50 rounded-lg">
              <Users className="w-12 h-12 mx-auto mb-3 text-purple-600" />
              <h3 className="font-bold mb-2">Share Your Link</h3>
              <p className="text-sm text-gray-600">Send your unique referral link to friends</p>
            </div>
            <div className="text-center p-6 bg-purple-50 rounded-lg">
              <Gift className="w-12 h-12 mx-auto mb-3 text-purple-600" />
              <h3 className="font-bold mb-2">They Subscribe</h3>
              <p className="text-sm text-gray-600">Your friend gets 10% off their first month</p>
            </div>
            <div className="text-center p-6 bg-purple-50 rounded-lg">
              <Copy className="w-12 h-12 mx-auto mb-3 text-purple-600" />
              <h3 className="font-bold mb-2">You Earn</h3>
              <p className="text-sm text-gray-600">Get 20% of their subscription value</p>
            </div>
          </div>

          <div className="bg-gray-50 p-6 rounded-lg">
            <p className="text-sm text-gray-600 mb-3">Your Referral Link:</p>
            <div className="flex gap-3">
              <input
                type="text"
                value={referralLink}
                readOnly
                className="flex-1 px-4 py-2 border rounded-lg bg-white"
              />
              <Button onClick={copyReferralLink}>
                <Copy className="w-4 h-4 mr-2" /> Copy
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
