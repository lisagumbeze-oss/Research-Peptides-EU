import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

import { BRAND_NAME, SITE_URL, defaultOgImageUrl } from '../../config/brand';

interface SEOProps {
  title: string;
  description: string;
  canonicalPath?: string;
  type?: 'website' | 'article' | 'product';
  image?: string;
}

export function SEO({
  title,
  description,
  canonicalPath,
  type = 'website',
  image,
}: SEOProps) {
  const location = useLocation();
  const origin = SITE_URL.replace(/\/+$/, '');
  const currentUrl = `${origin}${canonicalPath || location.pathname}`;
  const ogImage = image || defaultOgImageUrl(origin);

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content={BRAND_NAME} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
}
