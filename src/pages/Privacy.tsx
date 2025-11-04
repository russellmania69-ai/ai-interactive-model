import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const Privacy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button onClick={() => navigate('/')} variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-2xl font-bold text-purple-600">Privacy Policy</h1>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        <p className="text-gray-600 mb-8">Last updated: November 1, 2025</p>

        <div className="space-y-8">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
            <p className="text-gray-700 mb-3">We collect information you provide directly:</p>
            <ul className="space-y-2 text-gray-700">
              <li>• Account information (email, username, password)</li>
              <li>• Payment information (processed securely)</li>
              <li>• Usage data and preferences</li>
              <li>• Communication with our support team</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-700 mb-3">Your information is used to:</p>
            <ul className="space-y-2 text-gray-700">
              <li>• Provide and maintain our services</li>
              <li>• Process your transactions</li>
              <li>• Send important updates and notifications</li>
              <li>• Improve our platform and user experience</li>
              <li>• Prevent fraud and ensure security</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Data Security</h2>
            <p className="text-gray-700">
              We implement industry-standard security measures to protect your personal information. All data is encrypted in transit and at rest.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Sharing</h2>
            <p className="text-gray-700">
              We do not sell your personal information. We only share data with trusted service providers necessary for platform operation.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Your Rights</h2>
            <p className="text-gray-700 mb-3">You have the right to:</p>
            <ul className="space-y-2 text-gray-700">
              <li>• Access your personal data</li>
              <li>• Request data correction or deletion</li>
              <li>• Opt-out of marketing communications</li>
              <li>• Export your data</li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Contact Us</h2>
            <p className="text-gray-700">
              For privacy-related questions, contact us at privacy@aimodels.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
