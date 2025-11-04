import React, { useState } from 'react';
import { AIModel } from '../types/model';
import { Star, Users, TrendingUp } from 'lucide-react';

interface FeaturedModelsProps {
  models: AIModel[];
  onModelClick: (model: AIModel) => void;
}

export const FeaturedModels: React.FC<FeaturedModelsProps> = ({ models, onModelClick }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const topModels = models
    .sort((a, b) => b.subscribers - a.subscribers)
    .slice(0, 8);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
      <div className="text-center mb-8 md:mb-12">
        <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-3 md:px-4 py-1.5 md:py-2 rounded-full mb-3 md:mb-4">
          <TrendingUp className="w-4 h-4 md:w-5 md:h-5" />
          <span className="font-semibold text-sm md:text-base">Most Popular</span>
        </div>
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-4">Featured AI Models</h2>
        <p className="text-base md:text-xl text-gray-600">Connect with our most loved AI companions</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {topModels.map((model) => (
          <div
            key={model.id}
            onClick={() => onModelClick(model)}
            onMouseEnter={() => setHoveredId(model.id)}
            onMouseLeave={() => setHoveredId(null)}
            className="group cursor-pointer"
          >
            <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              {model.videoUrl && hoveredId === model.id ? (
                <video
                  src={model.videoUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full aspect-[3/4] object-cover"
                />
              ) : (
                <img
                  src={model.image}
                  alt={model.name}
                  className="w-full aspect-[3/4] object-cover"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {model.isOnline && (
                <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  Online
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-base md:text-lg font-bold mb-1">{model.name}</h3>
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{model.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{(model.subscribers / 1000).toFixed(1)}K</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
