import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

export default function NewsUpdates({ news }) {
  const defaultNews = [
    {
      id: 1,
      title: "New React 19 Features Released",
      description:
        "React 19 introduces exciting new features including Server Components and improved Suspense.",
      date: "Sep 1, 2025",
      image:
        "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg",
    },
    {
      id: 2,
      title: "TailwindCSS v4 Coming Soon",
      description:
        "TailwindCSS team announced version 4 with improved performance and new design utilities.",
      date: "Aug 28, 2025",
      image:
        "https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg",
    },
    {
      id: 3,
      title: "JavaScript: The Most Popular Language",
      description:
        "For the 10th year in a row, JavaScript remains the most widely used programming language.",
      date: "Aug 20, 2025",
      image:
        "https://images.pexels.com/photos/356079/pexels-photo-356079.jpeg",
    },
    {
      id: 4,
      title: "AI in Frontend Development",
      description:
        "Artificial Intelligence is increasingly integrated into frontend workflows and tools.",
      date: "Aug 10, 2025",
      image:
        "https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg",
    },
  ];

  const list = news && news.length ? news : defaultNews;

  return (
    <section className="relative py-6 w-full transition-colors duration-300 bg-gradient-to-r from-[#e0f9fa] via-white to-[#e0f9fa] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-10 text-3xl font-bold tracking-tight text-center md:text-4xl">
          News & Updates
        </h2>

        {/* Swiper Section */}
        <Swiper
          modules={[Pagination, Autoplay]}
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          autoplay={{ delay: 2000, disableOnInteraction: false }}
          loop={true}
          pagination={{ clickable: true }}
          className="pb-12"
        >
          {list.map((item) => (
            <SwiperSlide key={item.id}>
              <div className="overflow-hidden transition-all duration-300 border rounded-2xl bg-surface border-border hover:shadow-lg hover:-translate-y-1">
                <div className="overflow-hidden h-44">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="object-cover w-full h-full transition-transform duration-500 hover:scale-110"
                  />
                </div>
                <div className="p-5">
                  <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                  <p className="mb-3 text-sm text-text-secondary line-clamp-3">
                    {item.description}
                  </p>
                  <p className="mb-4 text-xs text-text-muted">{item.date}</p>

                  <button className="px-4 py-2 text-sm font-medium text-white transition rounded-xl bg-primary hover:shadow-md hover:brightness-110">
                    Read More
                  </button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
