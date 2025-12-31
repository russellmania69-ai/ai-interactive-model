import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { ImageGallery } from './ImageGallery';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ArrowLeft, Send, Image, X, Images } from 'lucide-react';


interface Message {
  id: string;
  sender: 'user' | 'ai';
  message: string;
  image_url?: string;
  created_at: string;
}

interface ChatInterfaceProps {
  sessionId: string;
  modelName: string;
  modelImage: string;
  onBack: () => void;
}

export function ChatInterface({ sessionId, modelName, modelImage, onBack }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showGallery, setShowGallery] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  // include sessionId only; these functions are stable for this component
   
  const loadMessages = useCallback(async () => {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });
    
    if (data) setMessages(data);
  }, [sessionId]);

  const subscribeToMessages = useCallback(() => {
    const channel = supabase
      .channel(`chat:${sessionId}`)
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `session_id=eq.${sessionId}` },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [sessionId]);

  useEffect(() => {
    loadMessages();
    const cleanup = subscribeToMessages();
    return cleanup;
  }, [loadMessages, subscribeToMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file: File) => {
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('chat-images')
      .upload(fileName, file);
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
      .from('chat-images')
      .getPublicUrl(fileName);
    
    return publicUrl;
  };

  const sendMessage = async () => {
    if (!input.trim() && !imageFile) return;

    let imageUrl = null;
    if (imageFile) {
      imageUrl = await uploadImage(imageFile);
    }

    const userMsg = {
      session_id: sessionId,
      sender: 'user',
      message: input,
      image_url: imageUrl
    };

    await supabase.from('chat_messages').insert(userMsg);
    
    setInput('');
    setImageFile(null);
    setImagePreview(null);
    setIsTyping(true);

    try {
      const { data, error } = await supabase.functions.invoke('chat-ai-response', {
        body: { 
          message: input, 
          modelName, 
          chatHistory: messages.slice(-10),
          sessionId: sessionId,
          supabaseUrl: import.meta.env.https://wnytflqoxaxglgetafqn.supabase.co,
          supabaseKey: import.meta.env.sb_secret_LPREFjdNhDgMOBdr6xGJPA_I7sCHuEd
        }
      });

      setIsTyping(false);

      if (error) throw error;

      if (data?.response) {
        await supabase.from('chat_messages').insert({
          session_id: sessionId,
          sender: 'ai',
          message: data.response,
          image_url: data.imageUrl || null
        });
      }


    } catch (error) {
      setIsTyping(false);
      console.error('Chat error:', error);
      await supabase.from('chat_messages').insert({
        session_id: sessionId,
        sender: 'ai',
        message: 'Sorry, I encountered an error. Please try again.'
      });
    }
  };

  return (
    <>
      <div className="flex flex-col h-screen bg-white">
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <img src={modelImage} alt={modelName} className="w-10 h-10 rounded-full object-cover" />
            <div>
              <h2 className="font-semibold">{modelName}</h2>
              <p className="text-xs text-green-600">Online</p>
            </div>
          </div>
          <Button variant="outline" size="icon" onClick={() => setShowGallery(true)} title="View Image Gallery">
            <Images className="w-5 h-5" />
          </Button>
        </div>


      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} {...msg} timestamp={msg.created_at} modelImage={modelImage} />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {imagePreview && (
        <div className="px-4 pb-2">
          <div className="relative inline-block">
            <img src={imagePreview} alt="Preview" className="h-20 rounded-lg" />
            <Button size="icon" variant="destructive" className="absolute -top-2 -right-2 h-6 w-6" onClick={() => { setImageFile(null); setImagePreview(null); }}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      <div className="p-4 border-t bg-gray-50">
        <div className="flex gap-2">
          <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
          <Button variant="outline" size="icon" onClick={() => fileInputRef.current?.click()}>
            <Image className="w-5 h-5" />
          </Button>
          <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessage()} placeholder="Type a message..." className="flex-1" />
          <Button onClick={sendMessage} disabled={!input.trim() && !imageFile}>
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
      </div>

      {showGallery && (
        <ImageGallery sessionId={sessionId} onClose={() => setShowGallery(false)} />
      )}
    </>
  );
}

