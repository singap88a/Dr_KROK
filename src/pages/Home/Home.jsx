import React, { useEffect, useState } from "react";
 import Hero from "../../components/Home/Hero";
import Features from "../../components/Home/Features";
import CoursesPreview from "../../components/Home/CoursesPreview";
import BooksCarousel from "../../components/Home/BooksCarousel";
import ThemeToggle from "../../components/Home/ThemeToggle";
import NewsUpdates from "../../components/Home/NewsUpdates";
 import InstructorsCarousel from "../../components/Home/InstructorsCarousel";
  
export default function DrKrokHome() {
  const [dark, setDark] = useState(() => {
    try {
      const v = localStorage.getItem("drkrok:theme");
      if (v) return v === "dark";
      return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    } catch (e) {
      return false;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("drkrok:theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <div className="relative w-full transition-colors duration-300 bg-gradient-to-r from-[#e0f9fa] via-white to-[#e0f9fa] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
     
         <Hero />
        <div className="">
          <Features />
          <CoursesPreview />
          <BooksCarousel />
          <ThemeToggle />
          <NewsUpdates />
           <InstructorsCarousel/>
         </div>
      </div>
  );
}