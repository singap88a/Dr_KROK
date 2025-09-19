import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { FaBookOpen, FaRegCalendarAlt, FaUserCircle } from "react-icons/fa";
import "swiper/css";
import "swiper/css/pagination";
import { Link } from "react-router-dom";

export default function FeaturedArticles({ articles }) {
  const defaultArticles = [
    {
      id: 1,
      title: "Mastering React 19",
      description:
        "Discover the latest features in React 19 including Server Components and enhanced Suspense.",
      date: "Sep 1, 2025",
      image: "https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg",
      trainerName: "John Doe",
      trainerImage: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      id: 2,
      title: "TailwindCSS v4 Preview",
      description:
        "TailwindCSS 4.0 brings a fresh approach with faster builds and new utilities.",
      date: "Aug 28, 2025",
      image: "https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg",
      trainerName: "Sarah Lee",
      trainerImage: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      id: 3,
      title: "Why JavaScript Still Dominates",
      description:
        "JavaScript remains the most popular programming language with strong community support.",
      date: "Aug 20, 2025",
      image: "https://images.pexels.com/photos/356079/pexels-photo-356079.jpeg",
      trainerName: "Michael Smith",
      trainerImage: "https://randomuser.me/api/portraits/men/12.jpg",
    },
  ];

  const list = articles && articles.length ? articles : defaultArticles;

  return (
    <section className="relative py-16 w-full transition-colors duration-300 bg-gradient-to-r from-[#e0f9fa] via-white to-[#e0f9fa] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="px-4">
             <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
             <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Featured Articles
            </h2>
          </div>
          <Link className="py-2 text-sm font-bold underline transition text-primary border-primary" to="/articles">
            View All Articles
          </Link>
        </div>

        {/* Swiper Section */}
        <Swiper
          modules={[Pagination, Autoplay]}
          spaceBetween={25}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          autoplay={{ delay: 3500, disableOnInteraction: false }}
          loop={true}
          pagination={{ clickable: true }}
          className="pb-12"
        >
          {list.map((item) => (
            <SwiperSlide key={item.id}>
              <div className="overflow-hidden transition-transform duration-300 bg-white border border-gray-200 shadow-lg rounded-2xl dark:bg-gray-800 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1">
                {/* Image */}
                <div className="relative h-48">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="object-cover w-full h-full"
                  />
 
                </div>

                {/* Content */}
                <div className="flex flex-col h-full p-5">
                  <h3 className="mb-2 text-lg font-semibold line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="mb-3 text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                    {item.description}
                  </p>

                  <div className="flex items-center gap-2 mb-4 text-xs text-gray-500 dark:text-gray-400">
                    <FaRegCalendarAlt />
                    <span>{item.date}</span>
                  </div>

                  {/* Trainer Info */}
                  <div className="flex items-center mb-4">
                    {item.trainerImage ? (
                      <img
                        src={item.trainerImage}
                        alt={item.trainerName}
                        className="object-cover w-10 h-10 mr-3 rounded-full"
                      />
                    ) : (
                      <FaUserCircle className="w-10 h-10 mr-3 text-gray-500" />
                    )}
                    <span className="text-sm font-medium">{item.trainerName}</span>
                  </div>

                  {/* CTA Button */}
                  <button className="w-full px-4 py-2 mt-auto text-sm font-medium text-white transition bg-primary rounded-xl hover:shadow-md hover:brightness-110">
                    Read More
                  </button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div> 
      </div>

    </section>
  );
}
