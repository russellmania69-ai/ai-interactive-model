import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { VideoPlayer } from './VideoPlayer';

interface Video {
  id: string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url: string;
  duration: number;
  views: number;
}

interface FullscreenVideoModalProps {
  video: Video | null;
  onClose: () => void;
}

export function FullscreenVideoModal({ video, onClose }: FullscreenVideoModalProps) {
  const viewTrackedRef = useRef(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (video) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [video]);

  useEffect(() => {
    if (video && !viewTrackedRef.current) {
      trackView(video.id);
      viewTrackedRef.current = true;
    }
    
    return () => {
      viewTrackedRef.current = false;
    };
  }, [video]);

  const trackView = async (videoId: string) => {
    try {
      await supabase.rpc('increment_video_views', { video_id: videoId });
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  };

  if (!video) return null;


  return (
    <div 
      className="fixed inset-0 bg-black z-50 flex items-center justify-center overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="video-modal-title"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
      >
        <X className="w-6 h-6 text-white" />
      </button>
      
      <div className="w-full h-full flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-6xl">
          <VideoPlayer videoUrl={video.video_url} />
          <div className="mt-4 text-white">
            <h2 className="text-2xl font-bold">{video.title}</h2>
            {video.description && (
              <p className="text-gray-300 mt-2">{video.description}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
