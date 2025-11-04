import React, { useState } from 'react';
import { Mail } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { toast } from 'sonner';

export const NewsletterSignup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      toast.success('Successfully subscribed to newsletter!');
      setEmail('');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
      <div className="flex items-center gap-3 mb-4">
        <Mail className="w-8 h-8" />
        <h3 className="text-2xl font-bold">Stay Updated</h3>
      </div>
      <p className="mb-6 text-purple-100">Get exclusive offers, new model alerts, and special promotions delivered to your inbox.</p>
      <form onSubmit={handleSubmit} className="flex gap-3">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 bg-white text-gray-900"
          disabled={loading}
        />
        <Button type="submit" variant="secondary" disabled={loading}>
          {loading ? 'Subscribing...' : 'Subscribe'}
        </Button>
      </form>
    </div>
  );
};
