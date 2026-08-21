import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const SEO = ({ title, description, image, url, noindex }) => {
  const location = useLocation();
  const siteTitle = 'DR-KROK';
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const defaultDescription = 'DR-KROK is a medical education platform for KROK exam preparation, courses, practice tests, simulations, and clinical cases for medical, dental, and pharmacy students.';
  const defaultImage = 'https://dr-krok.com/logo.png';
  
  const metaDescription = description || defaultDescription;
  
  const path = url || (location?.pathname ? (location.pathname === '/' ? '/' : location.pathname) : '/');
  const canonicalUrl = path.startsWith('http') 
    ? path 
    : `https://dr-krok.com${path.startsWith('/') ? path : '/' + path}`;

  const ogImage = image 
    ? (image.startsWith('http') ? image : `https://dr-krok.com${image.startsWith('/') ? image : '/' + image}`)
    : defaultImage;

  const robotsContent = noindex ? 'noindex, nofollow' : 'index, follow';

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{fullTitle}</title>
      <meta name='description' content={metaDescription} />
      <meta name='robots' content={robotsContent} />
      <link rel='canonical' href={canonicalUrl} />

      {/* Open Graph / Facebook tags */}
      <meta property='og:type' content='website' />
      <meta property='og:site_name' content={siteTitle} />
      <meta property='og:title' content={fullTitle} />
      <meta property='og:description' content={metaDescription} />
      <meta property='og:image' content={ogImage} />
      <meta property='og:url' content={canonicalUrl} />

      {/* Twitter tags */}
      <meta name='twitter:card' content='summary_large_image' />
      <meta name='twitter:title' content={fullTitle} />
      <meta name='twitter:description' content={metaDescription} />
      <meta name='twitter:image' content={ogImage} />
      <meta name='twitter:url' content={canonicalUrl} />
    </Helmet>
  );
};

export default SEO;
