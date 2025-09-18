import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { FiHeart } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../context/ApiContext";
import { useTranslation } from 'react-i18next';
import "swiper/css";
import "swiper/css/pagination";

function BooksCarousel() {
  const navigate = useNavigate();
  const { request } = useApi();
  const { t, i18n } = useTranslation();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await request("books");
        setBooks(response.data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBooks();
  }, [request, i18n.language]);

  if (loading) {
    return (
      <section className="relative py-12 w-full transition-colors duration-300 bg-gradient-to-r from-[#e0f9fa] via-white to-[#e0f9fa] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="mx-auto text-center max-w-7xl">{t('books.loading_featured_books')}</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="relative py-12 w-full transition-colors duration-300 bg-gradient-to-r from-[#e0f9fa] via-white to-[#e0f9fa] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="mx-auto text-center text-red-500 max-w-7xl">{t('books.error')}: {error}</div>
      </section>
    );
  }

  return (
    <section className="relative py-12 w-full transition-colors duration-300 bg-gradient-to-r from-[#e0f9fa] via-white to-[#e0f9fa] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
{/* Title + Link */}
<div className="flex items-center justify-between mx-auto max-w-7xl">
  <div className="">
     <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
    {t('books.featured_books')}
  </h2>
<p className="mt-2 text-gray-600 dark:text-gray-300">
  {t('books.discover_best_selling')}
</p> 
  </div>

  {/* Link to All Books */}
  <a
    href="/books"
    className="font-medium underline text-primary dark:text-primary-400"
  >
{t('books.all_books')}  </a>
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
          {books.slice(0, 5).map((b) => {
            const price = parseFloat(b.price);
            const discountAmount = parseFloat(b.discount);
            const discountedPrice = discountAmount > 0 ? price.toFixed(2) : price.toFixed(2);
            const oldPrice = discountAmount > 0 ? (price + discountAmount).toFixed(2) : null;
            const discountPercent = discountAmount > 0 ? Math.round((discountAmount / (price + discountAmount)) * 100) : 0;
            return (
              <SwiperSlide key={b.id}>
                <div className="flex flex-col h-full transition-transform duration-300 bg-white border border-gray-200 shadow-lg rounded-2xl dark:bg-gray-800 dark:border-gray-700 ">
                  {/* Book Image */}
                  <div className="relative overflow-hidden rounded-t-2xl">
                    {/* Discount Badge */}
                    {discountAmount > 0 && (
                      <span className="absolute z-10 px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-lg shadow-md top-3 right-3">
                        -{discountPercent}%
                      </span>
                    )}

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
                      src={b.image}
                      alt={b.name}
                      className="object-cover w-full transition-transform duration-500 h-52 hover:scale-110"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex flex-col flex-grow p-5">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {b.name}
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
                        {oldPrice && (
                          <span className="ml-2 text-sm text-gray-400 line-through">
                            ${oldPrice}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Button */}
                    <button
                      onClick={() => navigate(`/book/${b.id}`)}
                      className="px-4 py-2 mt-5 text-sm font-medium text-white transition rounded-lg bg-primary hover:bg-primary/90"
                    >
                      {t('books.view_details')}
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
