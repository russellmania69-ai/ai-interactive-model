import { useState, useEffect } from 'react';
import { Play, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Video {
  id: string;
  title: string;
  description?: string;
  video_url: string;
  thumbnail_url: string;
  duration: number;
  views: number;
}

interface VideoGalleryProps {
  modelId: string;
  onPlayVideo: (video: Video) => void;
}

export function VideoGallery({ modelId, onPlayVideo }: VideoGalleryProps) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVideos();
  }, [modelId]);

  const loadVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('model_videos')
        .select('*')
        .eq('model_id', modelId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <div className="text-center py-8">Loading videos...</div>;
  }

  if (videos.length === 0) {
    return <div className="text-center py-8 text-gray-500">No videos available yet</div>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {videos.map((video) => (
        <div
          key={video.id}
          className="group relative cursor-pointer rounded-lg overflow-hidden bg-gray-900"
          onClick={() => onPlayVideo(video)}
        >
          <img
            src={video.thumbnail_url}
            alt={video.title}
            className="w-full aspect-video object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors flex items-center justify-center">
            <Play className="w-12 h-12 text-white opacity-80 group-hover:opacity-100 transition-opacity" fill="white" />
          </div>
          <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-xs text-white">
            {formatDuration(video.duration)}
          </div>
          <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 rounded text-xs text-white flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {video.views}
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            <h3 className="text-white text-sm font-medium truncate">{video.title}</h3>
          </div>
        </div>
      ))}
    </div>
  );
}
