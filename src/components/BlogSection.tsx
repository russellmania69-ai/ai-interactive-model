import React from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';

const blogPosts = [
  {
    title: 'The Future of AI Companions: What to Expect in 2025',
    excerpt: 'Explore the latest advancements in AI technology and how they\'re shaping the future of digital companionship.',
    date: '2025-10-28',
    image: 'https://d64gsuwffb70l.cloudfront.net/690581f4bfdf2bad1e03802b_1761969066177_0abb8055.webp',
    category: 'Technology'
  },
  {
    title: '5 Tips for Getting the Most Out of Your AI Model Subscription',
    excerpt: 'Maximize your experience with these expert tips on interacting with AI companions.',
    date: '2025-10-25',
    image: 'https://d64gsuwffb70l.cloudfront.net/690581f4bfdf2bad1e03802b_1761969066177_0abb8055.webp',
    category: 'Tips & Tricks'
  },
  {
    title: 'Understanding AI Ethics: Our Commitment to Responsible AI',
    excerpt: 'Learn about our ethical guidelines and how we ensure a safe, respectful platform.',
    date: '2025-10-20',
    image: 'https://d64gsuwffb70l.cloudfront.net/690581f4bfdf2bad1e03802b_1761969066177_0abb8055.webp',
    category: 'Ethics'
  }
];

export const BlogSection: React.FC = () => {
  return (
    <div className="py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">Latest from Our Blog</h2>
          <p className="text-base md:text-xl text-gray-600">Insights, tips, and news about AI companions</p>
        </div>

        
        <div className="grid md:grid-cols-3 gap-8">
          {blogPosts.map((post, i) => (
            <Card key={i} className="overflow-hidden hover:shadow-xl transition-shadow">
              <img src={post.image} alt={post.title} className="w-full h-48 object-cover" />
              <div className="p-6">
                <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full">{post.category}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(post.date).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-3">{post.title}</h3>

                <p className="text-gray-600 mb-4">{post.excerpt}</p>
                <Button variant="link" className="p-0">
                  Read More <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
