import React, { useState, useEffect } from 'react';
import { AIModel } from '../types/model';
import { VideoGallery } from './VideoGallery';
import { FullscreenVideoModal } from './FullscreenVideoModal';
import { ModelAboutSection } from './ModelAboutSection';
import { ModelStatsSection } from './ModelStatsSection';

interface ModelDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  model: AIModel | null;
  onSubscribe: (model: AIModel) => void;
}

interface Video {
  id: string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url: string;
  duration: number;
  views: number;
}

export const ModelDetailModal: React.FC<ModelDetailModalProps> = ({ isOpen, onClose, model, onSubscribe }) => {
  const [activeTab, setActiveTab] = useState<'about' | 'videos' | 'stats'>('about');
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !model) return null;

  const handlePlayVideo = (video: Video) => {
    setSelectedVideo(video);
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto" 
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div 
          className="bg-white rounded-2xl w-full max-h-[95vh] max-w-7xl flex flex-col lg:flex-row overflow-hidden my-auto" 
          onClick={(e) => e.stopPropagation()}
          tabIndex={-1}
        >

          <div className="relative lg:w-2/5 flex-shrink-0 h-64 lg:h-full">
            <img src={model.image} alt={model.name} className="w-full h-full object-cover" />
            {model.isOnline && (
              <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-white rounded-full animate-pulse"></span>
                Online
              </div>
            )}
            <button
              onClick={onClose}
              className="absolute top-4 left-4 bg-white/90 hover:bg-white text-gray-800 w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all hover:scale-110 shadow-lg"
            >
              ✕
            </button>
          </div>
          
          {/* Content Section - Right side on landscape */}
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Header with Subscribe */}
            <div className="p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 truncate">{model.name}, {model.age}</h2>
                  <div className="flex items-center gap-3 text-sm sm:text-base text-gray-600 mb-1">
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400">★</span>
                      <span className="font-semibold">{model.rating}</span>
                    </div>
                    <span>•</span>
                    <span className="truncate">{model.subscribers.toLocaleString()} subscribers</span>
                  </div>
                  {model.lastActive && (
                    <p className="text-xs sm:text-sm text-gray-500">Active {model.lastActive}</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xl sm:text-2xl font-bold text-purple-600 mb-2">${model.subscriptionPrice}/mo</div>
                  <button
                    onClick={() => onSubscribe(model)}
                    className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-medium text-sm sm:text-base whitespace-nowrap"
                  >
                    Subscribe
                  </button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 flex-shrink-0 px-4 sm:px-6">
              <div className="flex gap-4 sm:gap-8">
                <button
                  onClick={() => setActiveTab('about')}
                  className={`pb-3 px-1 font-semibold transition-colors text-sm sm:text-base ${
                    activeTab === 'about'
                      ? 'text-purple-600 border-b-2 border-purple-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  About
                </button>
                <button
                  onClick={() => setActiveTab('stats')}
                  className={`pb-3 px-1 font-semibold transition-colors text-sm sm:text-base ${
                    activeTab === 'stats'
                      ? 'text-purple-600 border-b-2 border-purple-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Statistics
                </button>
                <button
                  onClick={() => setActiveTab('videos')}
                  className={`pb-3 px-1 font-semibold transition-colors text-sm sm:text-base ${
                    activeTab === 'videos'
                      ? 'text-purple-600 border-b-2 border-purple-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Videos
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-6">
              {activeTab === 'about' && (
                <>
                  <ModelAboutSection model={model} />
                  
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 sm:p-6 mt-6">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">Subscription Benefits</h3>
                    <ul className="space-y-2 text-sm sm:text-base text-gray-700">
                      <li className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Unlimited messaging and personalized interactions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Access to exclusive photos, videos, and content</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Priority response times and direct communication</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Behind-the-scenes content and personal updates</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span>Cancel anytime, no long-term commitments</span>
                      </li>
                    </ul>
                  </div>
                </>
              )}

              {activeTab === 'stats' && <ModelStatsSection model={model} />}

              {activeTab === 'videos' && (
                <VideoGallery modelId={model.id} onPlayVideo={handlePlayVideo} />
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedVideo && (
        <FullscreenVideoModal
          video={selectedVideo}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </>
  );
};
