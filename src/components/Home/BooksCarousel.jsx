import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

function BooksCarousel() {
  const books = [
    {
      id: 1,
      title: "The Art of Learning",
      description: "Master the process of learning and accelerate your growth.",
      price: 20,
      discount: 30,
      img: "https://placehold.co/300x400?text=Book+1",
    },
    {
      id: 2,
      title: "React Made Easy",
      description: "A beginner-friendly guide to mastering React.js.",
      price: 25,
      discount: 40,
      img: "https://placehold.co/300x400?text=Book+2",
    },
    {
      id: 3,
      title: "Design Thinking",
      description: "Unleash creativity and solve problems effectively.",
      price: 18,
      discount: 20,
      img: "https://placehold.co/300x400?text=Book+3",
    },
    {
      id: 4,
      title: "AI & Future",
      description: "Explore how AI is shaping the next generation.",
      price: 30,
      discount: 50,
      img: "https://placehold.co/300x400?text=Book+4",
    },
  ];

  return (
    <section className="relative w-full transition-colors duration-300 bg-gradient-to-r from-[#e0f9fa] via-white to-[#e0f9fa] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Title */}
      <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
        Featured Books
      </h2>
      <p className="mt-2 text-center text-gray-600 dark:text-gray-300">
        Discover our best-selling books with exclusive discounts
      </p>

      {/* Carousel */}
      <div className="mx-auto mt-10 max-w-7xl">
        <Swiper
          modules={[Pagination, Autoplay]}
          spaceBetween={25}
          slidesPerView={1}
          pagination={{ clickable: true }}
          loop={true}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          grabCursor={true}
          breakpoints={{
            640: {
              slidesPerView: 2,
            },
            1024: {
              slidesPerView: 4,
            },
          }}
          className="pb-12"
        >
          {books.map((b) => {
            const discountedPrice = (b.price * (1 - b.discount / 100)).toFixed(
              2
            );
            return (
              <SwiperSlide key={b.id}>
                <div className="flex flex-col h-full transition-transform duration-300 bg-white border border-gray-200 shadow-md rounded-2xl dark:bg-gray-800 dark:border-gray-700 hover:scale-105 hover:shadow-xl">
                  {/* Book Image */}
                  <div className="overflow-hidden h-44 rounded-t-2xl">
                    <img
                      src={b.img}
                      alt={b.title}
                      className="object-cover w-full h-56 transition-transform duration-300 hover:scale-110"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex flex-col flex-grow p-4 ">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {b.title}
                    </h4>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                      {b.description}
                    </p>

                    {/* Price Section */}
                    <div className="flex items-center justify-between mt-4">
                      <div>
                        <span className="text-lg font-bold text-primary">
                          ${discountedPrice}
                        </span>
                        <span className="ml-2 text-sm text-gray-400 line-through">
                          ${b.price}
                        </span>
                      </div>
                      <span className="px-2 py-1 text-xs font-semibold text-white rounded-lg bg-red-500/80">
                        -{b.discount}%
                      </span>
                    </div>

                    {/* Button */}
                    <button className="px-4 py-2 mt-4 text-sm font-medium text-white transition rounded-lg bg-primary hover:bg-primary/90">
                      Buy Now
                    </button>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </section>
  );
}

export default BooksCarousel;
