import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const About: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button onClick={() => navigate('/')} variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-2xl font-bold text-purple-600">About Us</h1>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">About AI Models Platform</h1>
        
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-gray-700 mb-4">
            We're revolutionizing digital companionship through cutting-edge AI technology. Our platform connects users with sophisticated AI companions designed to provide meaningful, engaging interactions.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What We Offer</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="text-purple-600 mr-2">•</span>
              Premium AI-generated companions with unique personalities
            </li>
            <li className="flex items-start">
              <span className="text-purple-600 mr-2">•</span>
              Real-time chat interactions with advanced AI technology
            </li>
            <li className="flex items-start">
              <span className="text-purple-600 mr-2">•</span>
              Exclusive photo and video content
            </li>
            <li className="flex items-start">
              <span className="text-purple-600 mr-2">•</span>
              Safe, secure, and private platform
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Values</h2>
          <p className="text-gray-700">
            Privacy, innovation, and user satisfaction are at the core of everything we do. We're committed to providing a premium experience while maintaining the highest standards of security and discretion.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
