import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, image, url }) => {
  const siteTitle = 'DR-KROK';
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const defaultDescription = 'DR-KROK is the ultimate platform for KROK 1, 2, 3, M, and B preparation. Best KROK courses, medical exams preparation, online tests, and study materials.';
  const defaultKeywords = 'KROK, DR KROK, KROK Courses, KROK Preparation, KROK Exam, KROK Test, KROK Questions, KROK Practice Tests, KROK Mock Exam, KROK Online';

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{fullTitle}</title>
      <meta name='description' content={description || defaultDescription} />
      <meta name='keywords' content={keywords || defaultKeywords} />

      {/* Open Graph / Facebook tags */}
      <meta property='og:type' content='website' />
      <meta property='og:title' content={fullTitle} />
      <meta property='og:description' content={description || defaultDescription} />
      {image && <meta property='og:image' content={image} />}
      {url && <meta property='og:url' content={url} />}

      {/* Twitter tags */}
      <meta name='twitter:card' content='summary_large_image' />
      <meta name='twitter:title' content={fullTitle} />
      <meta name='twitter:description' content={description || defaultDescription} />
      {image && <meta name='twitter:image' content={image} />}
    </Helmet>
  );
};

export default SEO;
