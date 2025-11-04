import React from 'react';
import { Users, Heart, MessageCircle, TrendingUp } from 'lucide-react';

const stats = [
  { icon: Users, value: '50,000+', label: 'Active Users' },
  { icon: Heart, value: '1M+', label: 'Connections Made' },
  { icon: MessageCircle, value: '10M+', label: 'Messages Sent' },
  { icon: TrendingUp, value: '98%', label: 'Satisfaction Rate' }
];

export const StatsSection: React.FC = () => {
  return (
    <div className="py-12 md:py-16 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <stat.icon className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-3 md:mb-4 opacity-90" />
              <div className="text-2xl md:text-4xl font-bold mb-1 md:mb-2">{stat.value}</div>
              <div className="text-sm md:text-base text-purple-100">{stat.label}</div>
            </div>

          ))}
        </div>
      </div>
    </div>
  );
};
