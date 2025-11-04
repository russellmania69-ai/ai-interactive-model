import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface RegenerateImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageId: string;
  originalPrompt: string;
  sessionId: string;
  onRegenerated: () => void;
}

export function RegenerateImageModal({ 
  isOpen, 
  onClose, 
  imageId, 
  originalPrompt, 
  sessionId,
  onRegenerated 
}: RegenerateImageModalProps) {
  const [prompt, setPrompt] = useState(originalPrompt);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleRegenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const supabaseUrl = supabase.supabaseUrl;
      const supabaseKey = session?.access_token || '';

      const { data, error } = await supabase.functions.invoke('regenerate-image', {
        body: { 
          prompt: prompt.trim(),
          sessionId,
          parentImageId: imageId,
          supabaseUrl,
          supabaseKey
        },
      });

      if (error) throw error;
      
      onRegenerated();
      onClose();
      setPrompt(originalPrompt);
    } catch (error) {
      console.error('Error regenerating image:', error);
      alert('Failed to regenerate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Edit & Regenerate Image
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Original Prompt
            </label>
            <p className="text-sm text-gray-600 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              {originalPrompt}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">
              Modified Prompt
            </label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Edit the prompt to regenerate with changes..."
              className="min-h-[120px]"
              disabled={isGenerating}
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose} disabled={isGenerating}>
              Cancel
            </Button>
            <Button onClick={handleRegenerate} disabled={isGenerating || !prompt.trim()}>
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Regenerate
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
