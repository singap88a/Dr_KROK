import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { FiHeart } from "react-icons/fi";
import "swiper/css";
import "swiper/css/pagination";

function BooksCarousel() {
  const allBooks = [
    {
      id: 1,
      title: "Human Anatomy Atlas",
      description:
        "Comprehensive guide to human anatomy with detailed illustrations.",
      price: 50,
      discount: 20, // %
      pages: 1200,
      language: "English",
      author: "Frank H. Netter",
      images: [
        "https://www.kenhub.com/thumbor/dy3RvPtDBA9vgcTJgsGUhjlf72w=/fit-in/800x1600/filters:watermark(/images/logo_url.png,-10,-10,0):background_color(FFFFFF):format(jpeg)/images/article/how-to-choose-the-best-anatomy-atlas/59oXLFGu4YXmcvD4h3Ehw_stacked-anatomy-atlases.jpg",
      ],
    },
    {
      id: 2,
      title: "Medical Physiology",
      description:
        "Learn how the human body functions at the cellular and organ level.",
      price: 40,
      discount: 25,
      pages: 950,
      language: "English",
      author: "Arthur C. Guyton",
      images: [
        "https://m.media-amazon.com/images/I/71wQlwKF9dL._UF1000,1000_QL80_.jpg",
      ],
    },
    {
      id: 3,
      title: "Pathology Made Simple",
      description: "A practical guide to understanding human diseases and pathology.",
      price: 30,
      discount: 15,
      pages: 620,
      language: "English",
      author: "Vinay Kumar",
      images: [
        "https://m.media-amazon.com/images/I/51FRvQRbvAL._UF1000,1000_QL80_.jpg",
      ],
    },
    {
      id: 4,
      title: "Gray's Anatomy for Students",
      description:
        "Classic anatomy reference book; many diagrams, clinically oriented.",
      price: 60,
      discount: 30,
      pages: 1400,
      language: "English",
      author: "Richard Drake",
      images: [
        "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1178682308i/821821.jpg",
      ],
    },
    {
      id: 5,
      title: "Gray's Anatomy for Students",
      description:
        "Classic anatomy reference book; many diagrams, clinically oriented.",
      price: 60,
      discount: 30,
      pages: 1400,
      language: "English",
      author: "Richard Drake",
      images: [
        "https://www.mea.elsevierhealth.com/media/wysiwyg/UKMEAEU/LP-Grays/Grays-inside.png",
      ],
    },
  ];

  const [favorites, setFavorites] = useState([]);

  return (
    <section className="relative py-12 w-full transition-colors duration-300 bg-gradient-to-r from-[#e0f9fa] via-white to-[#e0f9fa] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
{/* Title + Link */}
<div className="flex items-center justify-between mx-auto max-w-7xl">
  <div className="">
     <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
    Featured Books
  </h2>
<p className="mt-2 text-gray-600 dark:text-gray-300">
  Discover our best-selling books with exclusive discounts
</p> 
  </div>

  {/* Link to All Books */}
  <a
    href="/books"
    className="font-medium underline text-primary dark:text-primary-400"
  >
All Books  </a>
</div>




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
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 4 },
          }}
          className="pb-12"
        >
          {allBooks.map((b) => {
            const discountedPrice = (b.price * (1 - b.discount / 100)).toFixed(2);
            return (
              <SwiperSlide key={b.id}>
                <div className="flex flex-col h-full transition-transform duration-300 bg-white border border-gray-200 shadow-lg rounded-2xl dark:bg-gray-800 dark:border-gray-700 ">
                  {/* Book Image */}
                  <div className="relative overflow-hidden rounded-t-2xl">
                    {/* Discount Badge */}
                    <span className="absolute z-10 px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-lg shadow-md top-3 right-3">
                      -{b.discount}%
                    </span>

                    {/* Favorite Heart */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setFavorites(prev => prev.includes(b.id) ? prev.filter(id => id !== b.id) : [...prev, b.id]);
                      }}
                      className="absolute z-10 p-1 transition rounded-full shadow-md top-3 left-3 bg-white/80 hover:bg-white"
                    >
                      <FiHeart className={`text-xl ${favorites.includes(b.id) ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
                    </button>

                    <img
                      src={b.images[0]}
                      alt={b.title}
                      className="object-cover w-full transition-transform duration-500 h-52 hover:scale-110"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex flex-col flex-grow p-5">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {b.title}
                    </h4>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
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
                    </div>

                    {/* Button */}
                    <button className="px-4 py-2 mt-5 text-sm font-medium text-white transition rounded-lg bg-primary hover:bg-primary/90">
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
