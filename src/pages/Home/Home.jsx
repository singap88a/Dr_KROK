import React, { Suspense, lazy } from "react";
import Hero from "../../components/Home/Hero";
import Features from "../../components/Home/Features";
import UniversityRepsPromo from "../../components/Home/UniversityRepsPromo";
import SEO from "../../components/SEO/SEO";

// Lazy-loaded components for below-the-fold content
const CoursesPreview = lazy(() => import("../../components/Home/CoursesPreview"));
const BooksCarousel = lazy(() => import("../../components/Home/BooksCarousel"));
const StatsSection = lazy(() => import("../../components/Home/StatsSection"));
const NewsUpdates = lazy(() => import("../../components/Home/Articles"));
const InstructorsCarousel = lazy(() => import("../../components/Home/InstructorsCarousel"));
const HomeBanners = lazy(() => import("../../components/Home/HomeBanners"));
const Live_courses = lazy(() => import("../../components/Home/Live_courses"));
const MerchantsCarousel = lazy(() => import("../../components/Home/MerchantsCarousel"));
const FlashOffers = lazy(() => import("../../components/Home/FlashOffers"));

export default function DrKrokHome() {
  return (
    <div className="relative w-full transition-colors duration-300 bg-gradient-to-r from-[#e0f9fa] via-white to-[#e0f9fa] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <SEO 
        description="DR-KROK is a medical education platform for KROK exam preparation, courses, practice tests, simulations, and clinical cases for medical, dental, and pharmacy students."
      />
      <Hero />
      <div className="">
        <Features />
        <UniversityRepsPromo />
        <Suspense fallback={<div className="h-40 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-xl m-8" />}>
          <CoursesPreview />
          <FlashOffers />
          <BooksCarousel />
          <StatsSection />
          <Live_courses/>
          <MerchantsCarousel />
          <NewsUpdates />
          <HomeBanners/>
          <InstructorsCarousel/>
        </Suspense>
      </div>
    </div>
  );
}
