import React from "react";
import { FiClock, FiBookOpen } from "react-icons/fi";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

export default function CoursesPreview({ courses }) {
  const defaultCourses = [
    {
      id: 1,
      title: "Mastering JavaScript",
      description: "Learn JavaScript from basics to advanced concepts.",
      duration: "12h",
      level: "Beginner",
      image:
        "https://images.pexels.com/photos/1181671/pexels-photo-1181671.jpeg",
    },
    {
      id: 2,
      title: "React for Developers",
      description: "Build dynamic and modern web apps with React.js.",
      duration: "15h",
      level: "Intermediate",
      image:
        "https://images.pexels.com/photos/4974912/pexels-photo-4974912.jpeg",
    },
    {
      id: 3,
      title: "TailwindCSS Masterclass",
      description: "Create stunning UIs faster with TailwindCSS.",
      duration: "8h",
      level: "All Levels",
      image:
        "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg",
    },
    {
      id: 4,
      title: "Next.js Full Guide",
      description: "Server-side rendering & static site generation.",
      duration: "10h",
      level: "Advanced",
      image:
        "https://images.pexels.com/photos/270404/pexels-photo-270404.jpeg",
    },
    {
      id: 5,
      title: "React for Developers",
      description: "Build dynamic and modern web apps with React.js.",
      duration: "15h",
      level: "Intermediate",
      image:
        "https://images.pexels.com/photos/4974912/pexels-photo-4974912.jpeg",
    },
  ];

  const list = courses && courses.length ? courses : defaultCourses;

  return (
    <section className="relative w-full transition-colors duration-300 bg-gradient-to-r from-[#e0f9fa] via-white to-[#e0f9fa] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-10 text-3xl font-bold tracking-tight text-center md:text-4xl">
          Featured Courses
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
            1280: { slidesPerView: 4 },
          }}
          autoplay={{ delay: 2000, disableOnInteraction: false }}
          loop={true}
          pagination={{
            clickable: true,
            el: ".custom-pagination",
          }}
          className="pb-12"
        >
          {list.map((course) => (
            <SwiperSlide key={course.id}>
              <div className="overflow-hidden transition-all duration-300 border rounded-2xl bg-surface border-border hover:shadow-lg hover:-translate-y-1">
                <div className="h-40 overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="object-cover w-full h-full transition-transform duration-500 hover:scale-110"
                  />
                </div>
                <div className="p-5">
                  <h3 className="mb-2 text-lg font-semibold">{course.title}</h3>
                  <p className="mb-4 text-sm text-text-secondary">
                    {course.description}
                  </p>

                  <div className="flex items-center justify-between mb-4 text-sm text-text-muted">
                    <span className="flex items-center gap-2">
                      <FiClock /> {course.duration}
                    </span>
                    <span className="flex items-center gap-2">
                      <FiBookOpen /> {course.level}
                    </span>
                  </div>

                  <button className="w-full px-4 py-2 text-sm font-medium text-white transition rounded-xl bg-primary hover:shadow-md hover:brightness-110">
                    View Course
                  </button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Pagination */}
        <div className="flex justify-center mt-6">
          <div className="flex gap-2 custom-pagination"></div>
        </div>

        {/* Custom Pagination Styles */}
        <style>
          {`
            .custom-pagination .swiper-pagination-bullet {
              width: 24px;
              height: 4px;
              border-radius: 2px;
              background: #ccc;
              opacity: 1;
              transition: all 0.3s ease;
            }
            .custom-pagination .swiper-pagination-bullet-active {
              background: #3b82f6; /* Tailwind primary blue */
              width: 36px;
            }
          `}
        </style>
      </div>
    </section>
  );
}
