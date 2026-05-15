import React from "react";
import Hero from "../../components/Home/Hero";
import Features from "../../components/Home/Features";
import CoursesPreview from "../../components/Home/CoursesPreview";
import BooksCarousel from "../../components/Home/BooksCarousel";
import StatsSection from "../../components/Home/StatsSection";
import NewsUpdates from "../../components/Home/Articles";
import InstructorsCarousel from "../../components/Home/InstructorsCarousel";
import HomeBanners from "../../components/Home/HomeBanners";
import Live_courses from "../../components/Home/Live_courses";
import SEO from "../../components/SEO/SEO";

export default function DrKrokHome() {
  return (
    <div className="relative w-full transition-colors duration-300 bg-gradient-to-r from-[#e0f9fa] via-white to-[#e0f9fa] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <SEO 
        // title="Best KROK Preparation Platform 2026"
        description="DR-KROK is your ultimate medical education platform. We offer comprehensive KROK 1, 2, 3, M, and B courses, video lessons, medical books, and interactive quizzes for medical students in Ukraine."
        keywords="KROK, DR KROK, KROK Courses, KROK Preparation, KROK Exam, KROK Test, KROK Questions, KROK Practice Tests, KROK Mock Exam, KROK Online, KROK Platform, KROK Training, KROK Medical Exam, КРОК, Курси КРОК, Підготовка до КРОК, Іспит КРОК, Тест КРОК, КРОК медицина, КРОК стоматологія, КРОК фармація, КРОК 1, КРОК 2, КРОК 3, КРОК М, КРОК Б, Буклети КРОК, База КРОК, Питання КРОК, Відповіді КРОК, Пробний КРОК, Подготовка к КРОК, Экзамен КРОК, Тесты КРОК, КРОК онлайн"
      />
      <Hero />
      <div className="">
        <Features />
        <CoursesPreview />
        <BooksCarousel />
        <StatsSection />
        <Live_courses/>
        <NewsUpdates />
        <HomeBanners/>
        <InstructorsCarousel/>
      </div>
    </div>
  );
}
