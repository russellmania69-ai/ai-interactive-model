import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title = 'AI Models - Premium AI Companion Platform',
  description = 'Connect with beautiful AI-generated models. Subscribe to chat, share, and build meaningful connections with premium AI companions.',
  image = 'https://d64gsuwffb70l.cloudfront.net/690581f4bfdf2bad1e03802b_1761969066177_0abb8055.webp',
  url = window.location.href,
  type = 'website'
}) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "AI Models Platform",
    "description": description,
    "url": url,
    "applicationCategory": "Entertainment",
    "offers": {
      "@type": "Offer",
      "price": "9.99",
      "priceCurrency": "USD"
    }
  };

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      
      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Structured Data */}
      <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
    </Helmet>
  );
};
