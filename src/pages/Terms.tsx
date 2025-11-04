import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const Terms: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button onClick={() => navigate('/')} variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-2xl font-bold text-purple-600">Terms of Service</h1>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Terms of Service</h1>
        <p className="text-gray-600 mb-8">Last updated: November 1, 2025</p>

        <div className="space-y-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700">
              By accessing and using AI Models Platform, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Age Requirement</h2>
            <p className="text-gray-700">
              You must be at least 18 years old to use this service. By using this platform, you confirm that you meet this age requirement.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Conduct</h2>
            <p className="text-gray-700 mb-3">Users agree to:</p>
            <ul className="space-y-2 text-gray-700">
              <li>• Use the service responsibly and legally</li>
              <li>• Respect the platform and other users</li>
              <li>• Not share account credentials</li>
              <li>• Not attempt to circumvent payment systems</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Subscriptions and Payments</h2>
            <p className="text-gray-700">
              Subscription fees are charged monthly. Cancellations can be made at any time but refunds are not provided for partial months.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Content Rights</h2>
            <p className="text-gray-700">
              All content on this platform is protected by copyright. Users may not reproduce, distribute, or create derivative works without permission.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Termination</h2>
            <p className="text-gray-700">
              We reserve the right to terminate or suspend access to our service immediately, without prior notice, for conduct that violates these Terms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
