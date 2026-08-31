import React, { useEffect } from 'react';

export interface SEOHeadProps {
  title: string;
  description?: string;
  canonicalPath?: string;
  ogType?: string;
  ogImage?: string;
  keywords?: string;
}

const DEFAULT_DOMAIN = 'https://deroyalhotspot.name.ng';

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description = 'DeRoyal Hotspot OS - Enterprise Wi-Fi hotspot management, voucher authentication, and high-speed bandwidth billing system.',
  canonicalPath = '',
  ogType = 'website',
  ogImage = '/favicon.svg',
  keywords = 'DeRoyal Hotspot, Wi-Fi Voucher, Captive Portal, MikroTik RouterOS, High Speed Wi-Fi, Bandwidth Management'
}) => {
  useEffect(() => {
    // Dynamic document title update
    const formattedTitle = title.includes('DeRoyal') ? title : `${title} | DeRoyal Hotspot OS`;
    document.title = formattedTitle;

    // Helper to set or update meta element
    const updateMetaTag = (selector: string, attribute: string, attrValue: string, contentValue: string) => {
      let element = document.querySelector(selector);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, attrValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', contentValue);
    };

    // Construct full canonical URL
    const baseUrl = window.location.origin.includes('localhost') 
      ? DEFAULT_DOMAIN 
      : window.location.origin;
      
    const cleanPath = canonicalPath ? (canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`) : window.location.pathname;
    const fullCanonicalUrl = `${baseUrl.replace(/\/$/, '')}${cleanPath}`;

    // Update canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', fullCanonicalUrl);

    // Meta Description & Keywords
    updateMetaTag('meta[name="description"]', 'name', 'description', description);
    updateMetaTag('meta[name="keywords"]', 'name', 'keywords', keywords);

    // OpenGraph Meta
    updateMetaTag('meta[property="og:title"]', 'property', 'og:title', formattedTitle);
    updateMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
    updateMetaTag('meta[property="og:url"]', 'property', 'og:url', fullCanonicalUrl);
    updateMetaTag('meta[property="og:type"]', 'property', 'og:type', ogType);
    updateMetaTag('meta[property="og:image"]', 'property', 'og:image', `${baseUrl}${ogImage}`);

    // Twitter Card Meta
    updateMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', formattedTitle);
    updateMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    updateMetaTag('meta[name="twitter:url"]', 'name', 'twitter:url', fullCanonicalUrl);
    updateMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', `${baseUrl}${ogImage}`);

    // Inject Schema.org JSON-LD Structured Data
    const schemaId = 'seo-schema-jsonld';
    let schemaScript = document.getElementById(schemaId) as HTMLScriptElement | null;
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.id = schemaId;
      schemaScript.type = 'application/ld+json';
      document.head.appendChild(schemaScript);
    }

    const jsonLdData = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': 'DeRoyal Hotspot OS',
      'url': fullCanonicalUrl,
      'description': description,
      'publisher': {
        '@type': 'Organization',
        'name': 'DeRoyal Hotspot OS',
        'url': DEFAULT_DOMAIN,
        'logo': `${DEFAULT_DOMAIN}/favicon.svg`
      }
    };
    schemaScript.text = JSON.stringify(jsonLdData);

  }, [title, description, canonicalPath, ogType, ogImage, keywords]);

  return null;
};
