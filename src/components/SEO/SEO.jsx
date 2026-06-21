import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, image, url }) => {
  const siteTitle = 'DR-KROK';
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;
  const defaultDescription = 'DR-KROK is the ultimate platform for KROK 1, 2, 3, M, and B preparation. Best KROK courses, medical exams preparation, online tests, simulation, and clinical cases for medicine, dentistry, and pharmacy students. Pass KROK easily with our academy.';
  const defaultKeywords = 'KROK, DR KROK, KROK Courses, KROK Preparation, KROK Exam, KROK Test, KROK Questions, KROK Practice Tests, KROK Mock Exam, KROK Online, KROK Platform, KROK Training, KROK Medical Exam, KROK Medicine, KROK Dentistry, KROK Dental, KROK Stomatology, KROK Pharmacy, KROK Nursing, KROK 1, KROK 2, KROK 3, KROK M, KROK B, KROK English, KROK Ukrainian, KROK Preparation Course, KROK Intensive, KROK Exam 2026, KROK Results, KROK Passing Score, KROK University Exam, KROK Booklets, KROK Database, KROK Study Materials, KROK Video Lessons, KROK Lessons Online, KROK Medical Students, Best KROK Courses, KROK Tutor, KROK Academy, KROK Preparation Ukraine, Pass KROK Easily, KROK Explained, KROK Exam Help, KROK Simulation, KROK Clinical Cases, KROK Updates, KROK News, KROK Telegram, KROK PDF, KROK Answers, КРОК, ДР КРОК, Курси КРОК, Підготовка до КРОК, Іспит КРОК, Тест КРОК, Онлайн КРОК, КРОК медицина, КРОК стоматологія, КРОК фармація, КРОК медсестринство, КРОК 1, КРОК 2, КРОК 3, КРОК М, КРОК Б, Буклети КРОК, База КРОК, Питання КРОК, Відповіді КРОК, Пробний КРОК, Підготовка КРОК онлайн, КРОК англійською, КРОК українською, Курси КРОК стоматологія, Курси КРОК медицина, Курси КРОК фармація, Найкращі курси КРОК, Платформа КРОК, Навчання КРОК, Матеріали КРОК, Відеоуроки КРОК, Репетитор КРОК, Екзамен КРОК 2026, Дата КРОК, Результати КРОК, Новини КРОК, Симуляція КРОК, Тренажер КРОК, КРОК PDF, КРОК Telegram, КРОК для студентів, Підготовка до перескладання КРОК, Інтенсив КРОК, КРОК для медиків, КРОК для стоматологів, КРОК для фармацевтів, Курсы КРОК, Подготовка к КРОК, Экзамен КРОК, Тесты КРОК, КРОК онлайн, КРОК медицина, КРОК стоматология, КРОК фармация, КРОК медсестринство, Онлайн курсы КРОК, КРОК на английском, КРОК на украинском, Лучшие курсы КРОК, Подготовка КРОК стоматология, Подготовка КРОК медицина, Подготовка КРОК фармация, Видео уроки КРОК, Интенсив КРОК, KROK Ukraine, Медицинский экзамен КРОК, Сдать КРОК, KROK Practice, KROK Students, KROK University, KROK Help';

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
