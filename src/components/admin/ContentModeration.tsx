import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Trash2, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ChatSession {
  id: string;
  user_email: string;
  model_name: string;
  created_at: string;
}

interface ChatImage {
  id: string;
  session_id: string;
  image_url: string;
  prompt: string;
  created_at: string;
}

export default function ContentModeration() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [images, setImages] = useState<ChatImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const [sessionsRes, imagesRes] = await Promise.all([
        supabase.from('chat_sessions').select('*').order('created_at', { ascending: false }).limit(20),
        supabase.from('chat_images').select('*').order('created_at', { ascending: false }).limit(20),
      ]);

      setSessions(sessionsRes.data || []);
      setImages(imagesRes.data || []);
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (id: string) => {
    if (!confirm('Delete this chat session?')) return;
    
    try {
      const { error } = await supabase.from('chat_sessions').delete().eq('id', id);
      if (error) throw error;
      loadContent();
    } catch (error) {
      console.error('Error deleting session:', error);
    }
  };

  const deleteImage = async (id: string) => {
    if (!confirm('Delete this image?')) return;
    
    try {
      const { error } = await supabase.from('chat_images').delete().eq('id', id);
      if (error) throw error;
      loadContent();
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Recent Chat Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell>{session.user_email}</TableCell>
                  <TableCell>{session.model_name}</TableCell>
                  <TableCell>{new Date(session.created_at).toLocaleString()}</TableCell>
                  <TableCell>
                    <Button variant="destructive" size="sm" onClick={() => deleteSession(session.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Images</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <img src={image.image_url} alt="Generated" className="w-full h-32 object-cover rounded" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="sm" variant="secondary" onClick={() => setSelectedImage(image.image_url)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteImage(image.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Image Preview</DialogTitle>
          </DialogHeader>
          {selectedImage && <img src={selectedImage} alt="Preview" className="w-full" />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
