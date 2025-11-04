import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

import { models } from '../data/models';
import { models2 } from '../data/models2';
import { models3 } from '../data/models3';
import { models4 } from '../data/models4';

import { AIModel } from '../types/model';
import { ModelCard } from './ModelCard';
import { ModelDetailModal } from './ModelDetailModal';
import { AgeVerificationModal } from './AgeVerificationModal';
import { PaymentModal } from './PaymentModal';
import { SuccessModal } from './SuccessModal';
import { SEOHead } from './SEOHead';
import { PromoBanner } from './PromoBanner';
import { StatsSection } from './StatsSection';
import { Testimonials } from './Testimonials';
import { BlogSection } from './BlogSection';
import { ReferralProgram } from './ReferralProgram';
import { NewsletterSignup } from './NewsletterSignup';
import { SocialMediaLinks } from './SocialMediaLinks';
import { FeaturedModels } from './FeaturedModels';
import { AuthModal } from './AuthModal';
import { UserProfile } from './UserProfile';
import { Button } from './ui/button';
import { Toaster } from './ui/sonner';

const AppLayout: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showAgeVerification, setShowAgeVerification] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'online'>('all');

  const handleSubscribe = (model: AIModel) => {
    setSelectedModel(model);
    setShowDetail(false);
    setShowAgeVerification(true);
  };

  const allModels = [...models, ...models2, ...models3, ...models4];

  const filteredModels = allModels.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) || model.bio.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || (filter === 'online' && model.isOnline);
    return matchesSearch && matchesFilter;
  });

  if (showProfile && user) {
    return <UserProfile />;
  }

  return (
    <>
      <SEOHead />
      <Toaster />
      <PromoBanner />
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <nav className="bg-white shadow-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold text-purple-600 cursor-pointer" onClick={() => navigate('/')}>AI Models</h1>
              <div className="hidden md:flex gap-6">
                <button onClick={() => navigate('/about')} className="text-gray-700 hover:text-purple-600 font-medium">About</button>
                <button onClick={() => navigate('/contact')} className="text-gray-700 hover:text-purple-600 font-medium">Contact</button>
              </div>
            </div>
            <div className="flex gap-3">
              {user ? (
                <>
                  {profile?.role === 'admin' && (
                    <Button onClick={() => navigate('/admin')} variant="default">
                      Admin Dashboard
                    </Button>
                  )}
                  <Button onClick={() => setShowProfile(true)} variant="outline">
                    My Profile
                  </Button>
                </>

              ) : (
                <Button onClick={() => setShowAuthModal(true)}>
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </nav>


        <div className="relative h-[500px] md:h-[700px] overflow-hidden">
          <img src="https://d64gsuwffb70l.cloudfront.net/690581f4bfdf2bad1e03802b_1761969066177_0abb8055.webp" alt="Hero" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/95 via-pink-900/90 to-purple-900/95 flex items-center justify-center">
            <div className="text-center text-white px-4 max-w-5xl">
              <div className="inline-block mb-3 md:mb-4 px-4 md:px-6 py-1.5 md:py-2 bg-white/20 backdrop-blur-sm rounded-full text-xs md:text-sm font-semibold">
                Premium AI Companion Platform
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 md:mb-6 leading-tight">
                Connect with Your Perfect
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-300">
                  AI Companion
                </span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 md:mb-10 text-purple-100 max-w-3xl mx-auto px-2">
                Experience meaningful interactions with stunning AI-generated models. Join 50,000+ satisfied users today.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
                <button 
                  onClick={() => document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' })} 
                  className="px-6 md:px-10 py-3 md:py-4 bg-white text-purple-600 rounded-full hover:bg-purple-50 transition-all font-bold text-base md:text-lg shadow-2xl hover:scale-105 transform"
                >
                  Explore Models
                </button>
                <button 
                  onClick={() => document.getElementById('models')?.scrollIntoView({ behavior: 'smooth' })} 
                  className="px-6 md:px-10 py-3 md:py-4 bg-transparent border-2 border-white text-white rounded-full hover:bg-white/10 transition-all font-bold text-base md:text-lg"
                >
                  View All
                </button>
              </div>
            </div>
          </div>
        </div>


        <div id="featured">
          <FeaturedModels 
            models={allModels} 
            onModelClick={(model) => { 
              setSelectedModel(model); 
              setShowDetail(true); 
            }} 
          />
        </div>
        <div id="models" className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">All AI Models</h2>
            <p className="text-base md:text-lg text-gray-600">Browse our complete collection of AI companions</p>
          </div>



          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <input type="text" placeholder="Search models..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
              <select value={filter} onChange={(e) => setFilter(e.target.value as 'all' | 'online')} className="px-4 py-3 border border-gray-300 rounded-lg">
                <option value="all">All Models</option>
                <option value="online">Online Only</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
            {filteredModels.map((model) => (<ModelCard key={model.id} model={model} onViewDetails={(m) => { setSelectedModel(m); setShowDetail(true); }} onSubscribe={handleSubscribe} />))}
          </div>
        </div>
        <StatsSection />
        <Testimonials />
        <BlogSection />
        <ReferralProgram />
        <div className="max-w-7xl mx-auto px-4 py-16"><NewsletterSignup /></div>
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div>
                <h3 className="text-2xl font-bold mb-4">AI Models</h3>
                <p className="text-gray-400">Premium AI companion platform</p>
              </div>
              <div>
                <h4 className="font-bold mb-4">Platform</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><button onClick={() => document.getElementById('models')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white">Browse Models</button></li>
                  <li><button onClick={() => document.getElementById('featured')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-white">Featured</button></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Company</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><button onClick={() => navigate('/about')} className="hover:text-white">About Us</button></li>
                  <li><button onClick={() => navigate('/contact')} className="hover:text-white">Contact</button></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-4">Legal</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><button onClick={() => navigate('/terms')} className="hover:text-white">Terms of Service</button></li>
                  <li><button onClick={() => navigate('/privacy')} className="hover:text-white">Privacy Policy</button></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400">© 2025 AI Models Platform. All rights reserved.</p>
              <SocialMediaLinks />
            </div>
          </div>
        </footer>

        <ModelDetailModal isOpen={showDetail} onClose={() => setShowDetail(false)} model={selectedModel} onSubscribe={handleSubscribe} />
        <AgeVerificationModal isOpen={showAgeVerification} onClose={() => setShowAgeVerification(false)} onVerified={() => { setShowAgeVerification(false); setShowPayment(true); }} />
        <PaymentModal isOpen={showPayment} onClose={() => setShowPayment(false)} model={selectedModel} onSuccess={() => { setShowPayment(false); setShowSuccess(true); }} />
        <SuccessModal isOpen={showSuccess} onClose={() => setShowSuccess(false)} model={selectedModel} />
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </div>

    </>
  );
};

export default AppLayout;
