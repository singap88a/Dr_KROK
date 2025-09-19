import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import {
  FiClock,
  FiVideo,
  FiBookOpen,
  FiUsers,
  FiAward,
  FiShield,
} from "react-icons/fi";
import "swiper/css";
import "swiper/css/pagination";

export default function Features({ features }) {
  const [isDark, ] = useState(() => {
    if (typeof window === "undefined") return false;
    return document.documentElement.classList.contains("dark");
  });

  useEffect(() => {
    if (isDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [isDark]);

  const defaultFeatures = [
    {
      id: 1,
      title: "Online & Live Courses",
      description:
        "Recorded lectures and live sessions with instructors. Attend directly  .",
      icon: <FiVideo size={24} className="shrink-0" />,
    },
    {
      id: 2,
      title: "Books & References",
      description:
        "Dedicated pages for each book with easy previews and downloadable PDF files.",
      icon: <FiBookOpen size={24} className="shrink-0" />,
    },
    {
      id: 3,
      title: "Randomized Quizzes",
      description:
        "Every student gets unique questions to ensure real understanding and assessment.",
      icon: <FiClock size={24} className="shrink-0" />,
    },
    {
      id: 4,
      title: "Student Community",
      description:
        "Chats, study groups, peer feedback, and rating system to boost collaboration.",
      icon: <FiUsers size={24} className="shrink-0" />,
    },
    {
      id: 5,
      title: "Certified Diplomas",
      description:
        "Printable certificates upon course completion with online verification links.",
      icon: <FiAward size={24} className="shrink-0" />,
    },
    {
      id: 6,
      title: "Security & Privacy",
      description:
        "Advanced data protection, backups, and customizable privacy settings.",
      icon: <FiShield size={24} className="shrink-0" />,
    },
  ];

  const list = features && features.length ? features : defaultFeatures;

  return (
    <section className="relative w-full transition-colors duration-300 bg-gradient-to-r from-[#e0f9fa] via-white to-[#e0f9fa] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="px-4">
            <div className="py-10 mx-auto  max-w-7xl">
        {/* Title & Toggle */}
        <div className="flex flex-col items-center justify-between gap-6 mb-10 md:flex-row">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Platform Features
            </h2>
            <p className="max-w-lg mt-2 text-base text-text-secondary">
              Everything you need for a smooth and professional learning journey.
            </p>
          </div>

 
        </div>

        {/* Swiper Section */}
        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={24}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          className="pb-12"
        >
          {list.map((item) => (
            <SwiperSlide key={item.id}>
              <article className="flex flex-col justify-between h-full p-6 transition-all duration-300 border group rounded-2xl bg-surface border-border hover:shadow-xl hover:-translate-y-1">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center p-4 transition-transform duration-200 rounded-xl bg-accent text-primary group-hover:scale-105">
                    {item.icon ?? <FiAward size={24} />}
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-6">
                  <button className="px-4 py-2 text-sm transition border rounded-full border-border bg-primary/5 text-primary hover:bg-primary hover:text-white">
                    Learn More
                  </button>
                  <a
                    href="#"
                    className="text-sm underline text-text-secondary hover:text-text"
                  >
                    Try Now
                  </a>
                </div>
              </article>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* CTA */}

      </div>  
      </div>

    </section>
  );
}
