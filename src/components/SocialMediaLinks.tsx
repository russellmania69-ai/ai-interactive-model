import React from 'react';
import { Facebook, Twitter, Instagram, Youtube, Linkedin } from 'lucide-react';
import { Button } from './ui/button';

export const SocialMediaLinks: React.FC = () => {
  const socials = [
    { icon: Facebook, url: 'https://facebook.com', label: 'Facebook' },
    { icon: Twitter, url: 'https://twitter.com', label: 'Twitter' },
    { icon: Instagram, url: 'https://instagram.com', label: 'Instagram' },
    { icon: Youtube, url: 'https://youtube.com', label: 'YouTube' },
    { icon: Linkedin, url: 'https://linkedin.com', label: 'LinkedIn' }
  ];

  return (
    <div className="flex gap-3">
      {socials.map((social, i) => (
        <Button
          key={i}
          variant="outline"
          size="icon"
          onClick={() => window.open(social.url, '_blank')}
          aria-label={social.label}
          className="hover:bg-purple-100 hover:border-purple-400 transition-colors"
        >
          <social.icon className="w-5 h-5" />
        </Button>
      ))}
    </div>
  );
};
