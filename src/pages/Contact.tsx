import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, MessageSquare, Phone } from 'lucide-react';
import { toast } from 'sonner';

const Contact: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success('Message sent! We\'ll get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Button onClick={() => navigate('/')} variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-2xl font-bold text-purple-600">Contact Us</h1>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-16">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 text-center">Get in Touch</h1>
        <p className="text-xl text-gray-600 mb-12 text-center">Have questions? We'd love to hear from you.</p>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Mail className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2">Email</h3>
            <p className="text-gray-600">support@aimodels.com</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <MessageSquare className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2">Live Chat</h3>
            <p className="text-gray-600">Available 24/7</p>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <Phone className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <h3 className="font-bold text-lg mb-2">Phone</h3>
            <p className="text-gray-600">1-800-AI-MODEL</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <input type="text" required value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea required rows={6} value={formData.message} onChange={(e) => setFormData({...formData, message: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full py-6 text-lg">
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
