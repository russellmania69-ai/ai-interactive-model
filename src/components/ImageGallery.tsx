import { useState, useEffect } from 'react';
import { X, Download, Share2, Image as ImageIcon, Sparkles, History, CheckSquare, Square, Trash2, Archive } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { RegenerateImageModal } from './RegenerateImageModal';

interface GalleryImage {
  id: string;
  image_url: string;
  prompt: string;
  created_at: string;
  parent_image_id?: string;
  version_number: number;
  original_prompt?: string;
}

interface ImageGalleryProps {
  sessionId: string;
  onClose: () => void;
}

export function ImageGallery({ sessionId, onClose }: ImageGalleryProps) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [regenerateModal, setRegenerateModal] = useState<{ isOpen: boolean; image: GalleryImage | null }>({
    isOpen: false,
    image: null
  });
  const [versions, setVersions] = useState<GalleryImage[]>([]);

  useEffect(() => {
    loadImages();
  }, [sessionId]);

  const loadImages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_images')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error loading images:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadVersions = async (imageId: string, parentId?: string) => {
    const rootId = parentId || imageId;
    const { data } = await supabase
      .from('chat_images')
      .select('*')
      .or(`id.eq.${rootId},parent_image_id.eq.${rootId}`)
      .order('version_number', { ascending: true });
    
    setVersions(data || []);
  };

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    setSelectedIds(new Set(images.map(img => img.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleBatchDownload = async () => {
    const selectedImages = images.filter(img => selectedIds.has(img.id));
    const imageUrls = selectedImages.map(img => img.image_url);

    try {
      const { data, error } = await supabase.functions.invoke('download-images-zip', {
        body: { imageUrls }
      });

      if (error) throw error;
      
      // For now, download individually
      for (const img of selectedImages) {
        await handleDownload(img);
      }
    } catch (error) {
      console.error('Batch download error:', error);
      // Fallback: download individually
      for (const img of selectedImages) {
        await handleDownload(img);
      }
    }
  };

  const handleBatchDelete = async () => {
    if (!confirm(`Delete ${selectedIds.size} images?`)) return;

    try {
      const { error } = await supabase
        .from('chat_images')
        .delete()
        .in('id', Array.from(selectedIds));

      if (error) throw error;
      
      await loadImages();
      setSelectedIds(new Set());
      setSelectionMode(false);
    } catch (error) {
      console.error('Error deleting images:', error);
    }
  };

  const handleDownload = async (image: GalleryImage) => {
    try {
      const response = await fetch(image.image_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-generated-${image.id}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const handleShare = async (image: GalleryImage) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI Generated Image',
          text: `Check out this AI-generated image: ${image.prompt}`,
          url: image.image_url
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(image.image_url);
      alert('Image URL copied to clipboard!');
    }
  };

  const handleImageClick = (image: GalleryImage) => {
    if (selectionMode) {
      toggleSelection(image.id);
    } else {
      setSelectedImage(image);
      loadVersions(image.id, image.parent_image_id);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <div className="bg-gray-900 rounded-lg w-full max-w-6xl max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Image Gallery ({images.length})
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSelectionMode(!selectionMode);
                  setSelectedIds(new Set());
                }}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectionMode ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {selectionMode ? 'Exit Selection' : 'Select'}
              </button>
              <button onClick={onClose} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {selectionMode && (
            <div className="p-4 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-white">{selectedIds.size} selected</span>
                <button onClick={selectAll} className="text-purple-400 hover:text-purple-300 text-sm">
                  Select All
                </button>
                <button onClick={deselectAll} className="text-purple-400 hover:text-purple-300 text-sm">
                  Deselect All
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleBatchDownload}
                  disabled={selectedIds.size === 0}
                  className="px-4 py-2 bg-pink-600 rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-white"
                >
                  <Archive className="w-4 h-4" /> Download ({selectedIds.size})
                </button>
                <button
                  onClick={handleBatchDelete}
                  disabled={selectedIds.size === 0}
                  className="px-4 py-2 bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-white"
                >
                  <Trash2 className="w-4 h-4" /> Delete ({selectedIds.size})
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="text-center text-gray-400 py-12">Loading images...</div>
            ) : images.length === 0 ? (
              <div className="text-center text-gray-400 py-12">No images generated yet</div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image) => (
                  <div key={image.id} className="group relative aspect-square rounded-lg overflow-hidden bg-gray-800 cursor-pointer"
                    onClick={() => handleImageClick(image)}>
                    <img src={image.image_url} alt={image.prompt} className="w-full h-full object-cover" />
                    {selectionMode && (
                      <div className="absolute top-2 left-2 z-10">
                        {selectedIds.has(image.id) ? (
                          <CheckSquare className="w-6 h-6 text-purple-500 fill-purple-500" />
                        ) : (
                          <Square className="w-6 h-6 text-white" />
                        )}
                      </div>
                    )}
                    {image.version_number > 1 && (
                      <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded-full">
                        v{image.version_number}
                      </div>
                    )}
                    {!selectionMode && (
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button onClick={(e) => { e.stopPropagation(); handleDownload(image); }}
                          className="p-2 bg-white/20 rounded-full hover:bg-white/30">
                          <Download className="w-5 h-5 text-white" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleShare(image); }}
                          className="p-2 bg-white/20 rounded-full hover:bg-white/30">
                          <Share2 className="w-5 h-5 text-white" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {selectedImage && !selectionMode && (
          <div className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}>
            <div className="max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
              <img src={selectedImage.image_url} alt={selectedImage.prompt} className="w-full rounded-lg" />
              <div className="mt-4 text-white space-y-3">
                <div>
                  <p className="text-sm text-gray-400">Prompt:</p>
                  <p>{selectedImage.prompt}</p>
                </div>
                {versions.length > 1 && (
                  <div>
                    <p className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                      <History className="w-4 h-4" />
                      Version History ({versions.length} versions)
                    </p>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {versions.map((v) => (
                        <div key={v.id} 
                          className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden cursor-pointer border-2 ${
                            v.id === selectedImage.id ? 'border-purple-500' : 'border-transparent'
                          }`}
                          onClick={() => setSelectedImage(v)}>
                          <img src={v.image_url} alt={`v${v.version_number}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  <button onClick={() => handleDownload(selectedImage)}
                    className="px-4 py-2 bg-pink-600 rounded-lg hover:bg-pink-700 flex items-center gap-2">
                    <Download className="w-4 h-4" /> Download
                  </button>
                  <button onClick={() => handleShare(selectedImage)}
                    className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 flex items-center gap-2">
                    <Share2 className="w-4 h-4" /> Share
                  </button>
                  <button 
                    onClick={() => {
                      setRegenerateModal({ isOpen: true, image: selectedImage });
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Edit & Regenerate
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {regenerateModal.image && (
        <RegenerateImageModal
          isOpen={regenerateModal.isOpen}
          onClose={() => setRegenerateModal({ isOpen: false, image: null })}
          imageId={regenerateModal.image.id}
          originalPrompt={regenerateModal.image.original_prompt || regenerateModal.image.prompt}
          sessionId={sessionId}
          onRegenerated={() => {
            loadImages();
            if (selectedImage) {
              loadVersions(selectedImage.id, selectedImage.parent_image_id);
            }
          }}
        />
      )}
    </>
  );
}
