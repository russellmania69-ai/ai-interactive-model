import React from 'react';
import { AIModel } from '../types/model';

interface ModelStatsSectionProps {
  model: AIModel;
}

export const ModelStatsSection: React.FC<ModelStatsSectionProps> = ({ model }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Content Statistics</h3>
        {model.contentCount ? (
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
              <div className="text-4xl font-bold mb-2">{model.contentCount.photos}</div>
              <div className="text-purple-100">Photos</div>
            </div>
            <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-6 text-white">
              <div className="text-4xl font-bold mb-2">{model.contentCount.videos}</div>
              <div className="text-pink-100">Videos</div>
            </div>
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white">
              <div className="text-4xl font-bold mb-2">{model.contentCount.posts}</div>
              <div className="text-indigo-100">Posts</div>
            </div>
          </div>
        ) : (
          <p className="text-gray-600">Content statistics not available</p>
        )}
      </div>

      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Engagement Metrics</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">{model.subscribers.toLocaleString()}</div>
            <div className="text-blue-700 font-medium">Total Subscribers</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6">
            <div className="text-3xl font-bold text-yellow-600 mb-2">{model.rating} ★</div>
            <div className="text-yellow-700 font-medium">Average Rating</div>
          </div>
        </div>
      </div>
    </div>
  );
};
