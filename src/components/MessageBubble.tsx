import { Avatar } from '@/components/ui/avatar';

interface MessageBubbleProps {
  sender: 'user' | 'ai';
  message: string;
  image_url?: string;
  timestamp: string;
  modelImage?: string;
}

export function MessageBubble({ sender, message, image_url, timestamp, modelImage }: MessageBubbleProps) {
  const isUser = sender === 'user';
  
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <Avatar className="w-8 h-8 flex-shrink-0">
        <img 
          src={isUser ? 'https://api.dicebear.com/7.x/avataaars/svg?seed=user' : modelImage} 
          alt={sender}
          className="w-full h-full object-cover"
        />
      </Avatar>
      
      <div className={`flex flex-col max-w-[70%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`rounded-2xl px-4 py-2 ${
          isUser ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-900'
        }`}>
          {image_url && (
            <img src={image_url} alt="Shared" className="rounded-lg mb-2 max-w-full max-h-64 object-cover" />
          )}
          <p className="text-sm whitespace-pre-wrap break-words">{message}</p>
        </div>
        <span className="text-xs text-gray-500 mt-1 px-1">
          {new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}
