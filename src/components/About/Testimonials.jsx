import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { FaStar } from "react-icons/fa";
import "swiper/css";
import "swiper/css/pagination";

export default function Testimonials() {
  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Frontend Developer",
      rating: 5,
      feedback:
        "This platform completely transformed my learning experience. The courses are hands-on and really well structured.",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      id: 2,
      name: "Michael Smith",
      role: "Fullstack Engineer",
      rating: 4,
      feedback:
        "The projects gave me confidence to apply for jobs. I learned React and Node.js in a practical way.",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    {
      id: 3,
      name: "Aisha Ali",
      role: "UI/UX Designer",
      rating: 5,
      feedback:
        "The design courses are up-to-date and focused on real trends. It really boosted my career as a designer.",
      image: "https://randomuser.me/api/portraits/women/68.jpg",
    },
    {
      id: 4,
      name: "David Brown",
      role: "Software Engineer",
      rating: 5,
      feedback:
        "Clear explanations and amazing support from instructors. Highly recommend this platform.",
      image: "https://randomuser.me/api/portraits/men/41.jpg",
    },
  ];

  return (
    <section className="relative w-full transition-colors duration-300 ">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-12 text-3xl font-bold text-center">
          Students <span className="text-primary">Testimonials</span>
        </h2>

        <Swiper
          modules={[Pagination, Autoplay]}
          pagination={{ clickable: true, el: ".custom-pagination" }}
          autoplay={{ delay: 4000 }}
          spaceBetween={30}
          breakpoints={{
            640: { slidesPerView: 1 },
            1024: { slidesPerView: 3},
          }}
        >
          {testimonials.map((item) => (
            <SwiperSlide key={item.id}>
              <div className="flex flex-col items-center h-full gap-6 p-8 border shadow-lg bg-surface dark:bg-background rounded-2xl border-border md:flex-row">
                {/* صورة الشخص */}
                <img
                  src={item.image}
                  alt={item.name}
                  className="object-cover w-24 h-24 border-4 rounded-full border-primary"
                />

                {/* النص */}
                <div className="flex flex-col text-center md:text-left">
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  <span className="mb-2 text-sm text-text-muted">
                    {item.role}
                  </span>

                  {/* Rating */}
                  <div className="flex justify-center mb-3 md:justify-start">
                    {[...Array(item.rating)].map((_, i) => (
                      <FaStar key={i} className="text-yellow-400" />
                    ))}
                  </div>

                  <p className="leading-relaxed text-text-secondary">
                    "{item.feedback}"
                  </p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Pagination in center */}
        <div className="flex justify-center mt-8 custom-pagination"></div>
      </div>
    </section>
  );
}
