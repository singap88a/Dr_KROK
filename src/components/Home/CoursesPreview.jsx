import React from "react";
import { FiClock, FiUsers } from "react-icons/fi";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

import { sampleVideoCourses } from "../../pages/Courses/data/coursesData";

export default function CoursesPreview({ courses }) {
  // لو مبعتش props.courses يجيب الداتا من الملف
  const list = courses && courses.length ? courses : sampleVideoCourses;

  return (
    <section className="relative w-full transition-colors duration-300 bg-gradient-to-r from-[#e0f9fa] via-white to-[#e0f9fa] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="px-4 mx-auto max-w-7xl">
        <h2 className="mb-10 text-3xl font-bold tracking-tight text-center md:text-4xl">
          Featured Medical Courses
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
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          loop={true}
          pagination={{ clickable: true }}
          className="pb-12"
        >
          {list.map((course) => (
            <SwiperSlide key={course.id}>
              <div className="overflow-hidden transition-all duration-300 bg-white border border-gray-200 rounded-2xl dark:bg-gray-800 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1">
                <div className="overflow-hidden h-44">
                  <img
                    src={course.img}
                    alt={course.title}
                    className="object-cover w-full h-full transition-transform duration-500 hover:scale-110"
                  />
                </div>
                <div className="p-5">
                  <h3 className="mb-2 text-lg font-semibold line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="mb-3 text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                    {course.description}
                  </p>

                  <div className="flex items-center justify-between mb-3 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-2">
                      <FiClock /> {course.hours}h
                    </span>
                    <span className="flex items-center gap-2">
                      <FiUsers /> {course.students} Students
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">
                      ${course.price}
                    </span>
                    <button className="px-4 py-2 text-sm font-medium text-white rounded-xl bg-primary hover:shadow-md hover:brightness-110">
                      View Course
                    </button>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

      </div>

              <div className="text-center ">
          <a
            href="#courses"
            className="inline-block px-8 py-3 font-medium text-white transition shadow rounded-xl bg-primary hover:shadow-xl"
          >
            Browse Courses
          </a>
        </div>
    </section>
  );
}
