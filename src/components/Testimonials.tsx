import React from 'react';
import { Star } from 'lucide-react';
import { Card } from './ui/card';

const testimonials = [
  { name: 'Alex M.', rating: 5, text: 'Amazing experience! The AI models are incredibly realistic and engaging. Worth every penny!', location: 'New York, USA' },
  { name: 'Sarah K.', rating: 5, text: 'Best platform I\'ve found. The variety of models and quality of interactions is unmatched.', location: 'London, UK' },
  { name: 'Mike R.', rating: 5, text: 'Subscribed to multiple models. The conversations feel natural and the experience is premium.', location: 'Toronto, Canada' },
  { name: 'Emma L.', rating: 5, text: 'Love the platform! Easy to use, great selection, and the payment process is seamless.', location: 'Sydney, Australia' },
];

export const Testimonials: React.FC = () => {
  return (
    <div className="py-12 md:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12">What Our Users Say</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((t, i) => (
            <Card key={i} className="p-6">
              <div className="flex gap-1 mb-3">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-700 mb-4">"{t.text}"</p>
              <div>
                <p className="font-bold">{t.name}</p>
                <p className="text-sm text-gray-500">{t.location}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
