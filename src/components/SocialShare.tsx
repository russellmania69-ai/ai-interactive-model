import React from 'react';
import { Share2, Facebook, Twitter, Linkedin, Link2 } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
}

export const SocialShare: React.FC<SocialShareProps> = ({ url, title, description }) => {
  const shareUrl = encodeURIComponent(url);
  const shareTitle = encodeURIComponent(title);
  const shareDesc = encodeURIComponent(description || '');

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`,
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600 flex items-center gap-1">
        <Share2 className="w-4 h-4" /> Share:
      </span>
      <Button variant="outline" size="sm" onClick={() => window.open(shareLinks.facebook, '_blank')}>
        <Facebook className="w-4 h-4" />
      </Button>
      <Button variant="outline" size="sm" onClick={() => window.open(shareLinks.twitter, '_blank')}>
        <Twitter className="w-4 h-4" />
      </Button>
      <Button variant="outline" size="sm" onClick={() => window.open(shareLinks.linkedin, '_blank')}>
        <Linkedin className="w-4 h-4" />
      </Button>
      <Button variant="outline" size="sm" onClick={copyToClipboard}>
        <Link2 className="w-4 h-4" />
      </Button>
    </div>
  );
};
