import React from 'react';
import { AIModel } from '../types/model';
import { Video } from 'lucide-react';

interface ModelCardProps {
  model: AIModel;
  onViewDetails: (model: AIModel) => void;
  onSubscribe: (model: AIModel) => void;
}

export const ModelCard: React.FC<ModelCardProps> = ({ model, onViewDetails, onSubscribe }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
      <div className="relative">
        <img src={model.image} alt={model.name} className="w-full h-56 sm:h-80 object-cover" />
        {model.isOnline && (
          <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            Online
          </div>
        )}
        {model.videoUrl && (
          <div className="absolute top-4 left-4 bg-pink-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
            <Video className="w-4 h-4" />
            Video
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <h3 className="text-white text-2xl font-bold">{model.name}, {model.age}</h3>
          <div className="flex items-center gap-1 text-yellow-400 text-sm">
            <span>★</span>
            <span>{model.rating}</span>
            <span className="text-white/80 ml-2">({model.subscribers} subscribers)</span>
          </div>
        </div>
      </div>
      <div className="p-4">
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{model.bio}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {model.interests.map((interest) => (
            <span key={interest} className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
              {interest}
            </span>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="text-2xl font-bold text-purple-600">${model.subscriptionPrice}/mo</div>
          <div className="flex gap-2 flex-shrink-0 flex-wrap">
            <button
              onClick={() => onViewDetails(model)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm sm:text-base"
            >
              View
            </button>
            <button
              onClick={() => onSubscribe(model)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium text-sm sm:text-base whitespace-nowrap"
            >
              Subscribe
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

