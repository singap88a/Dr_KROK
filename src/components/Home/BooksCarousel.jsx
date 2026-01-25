import React, { useState, useEffect } from "react";
import he from "he";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { FiHeart } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../context/ApiContext";
import { useUser } from "../../context/UserContext";
import { useTranslation } from 'react-i18next';
import { toast, ToastContainer } from 'react-toastify';
import "swiper/css";
import "swiper/css/pagination";
import 'react-toastify/dist/ReactToastify.css';

function BooksCarousel() {
  const navigate = useNavigate();
  const { request, getFavorites, toggleFavorite } = useApi();
  const { t, i18n } = useTranslation();
  const { isLoggedIn } = useUser();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await request("books");
        const decodedBooks = (response.data || []).map(b => ({
          ...b,
          description: b.description ? he.decode(b.description) : ""
        }));
        setBooks(decodedBooks);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchFavorites = async () => {
      try {
        const response = await getFavorites();
        const favoriteIds = (response.data || []).map(fav => fav.table_id);
        setFavorites(favoriteIds);
      } catch {
        console.error("Failed to fetch favorites");
      }
    };

    fetchBooks();
    fetchFavorites();
  }, [request, getFavorites, i18n.language]);

  const handleToggleFavorite = async (bookId) => {
    if (!isLoggedIn) {
      toast.info(t('auth.login_required') || 'Please login to use favorites');
      navigate('/Login');
      return;
    }
    setFavoritesLoading(true);
    try {
      const response = await toggleFavorite(bookId, 'book');
      setFavorites(prev =>
        response.message === "Added to favorites"
          ? [...prev, bookId]
          : prev.filter(id => id !== bookId)
      );
      toast.success(response.message);
    } catch (err) {
      toast.error("Failed to update favorites");
    } finally {
      setFavoritesLoading(false);
    }
  };

  if (loading) {
  return (
    <section className="relative py-12 w-full transition-colors duration-300 bg-gradient-to-r from-[#e0f9fa] via-white to-[#e0f9fa] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <ToastContainer />
        <div className="px-6 mx-auto text-center max-w-7xl">{t('books.loading_featured_books')}</div>
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
<div className="px-4">
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
          pagination={{
            clickable: true,
            dynamicBullets: true,
            dynamicMainBullets: 4
          }}
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
            const discountPercent = parseFloat(b.discount);
            const discountAmount = discountPercent > 0 ? (price * discountPercent / 100) : 0;
            const oldPrice = discountPercent > 0 ? price.toFixed(2) : null;
            const discountedPrice = discountPercent > 0 ? Math.max(0, price - discountAmount).toFixed(2) : price.toFixed(2);

            return (
              <SwiperSlide key={b.id}>
                <div className="flex flex-col h-full transition-transform duration-300 bg-white border border-gray-200 shadow-lg rounded-2xl dark:bg-gray-800 dark:border-gray-700 ">
                  {/* Book Image */}
                  <div className="relative overflow-hidden rounded-t-2xl">
                    {/* Discount Badge */}
                    {discountPercent > 0 && (
                      <span className="absolute z-10 px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-lg shadow-md top-3 right-3">
                        {discountPercent}%
                      </span>
                    )}

                    {/* Favorite Heart */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleFavorite(b.id);
                      }}
                      disabled={favoritesLoading}
                      className="absolute z-10 p-2 transition-all duration-200 rounded-full shadow-lg top-3 left-3 bg-white/90 hover:bg-white disabled:opacity-50"
                    >
                      <FiHeart className={`text-xl transition-colors ${favorites.includes(b.id) ? 'text-red-500 fill-red-500' : 'text-gray-400 hover:text-red-500'}`} />
                    </button>

                    <img
                      src={b.image}
                      alt={b.name}
                      className="object-cover w-full transition-transform duration-500 h-52 hover:scale-110"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex flex-col flex-grow p-5">
                    <h4 className="text-lg font-semibold text-gray-900 truncate dark:text-white">
                      {b.name}
                    </h4>
                    <div 
                      className="mt-1 text-sm text-gray-600 dark:text-gray-300 line-clamp-2 prose prose-sm dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: b.description }}
                    />



                    {/* Price Section */}
                    <div className="flex items-center justify-between mt-4">
                      <div>
                        <span className="text-lg font-bold text-primary">
                          ₴{discountedPrice}
                        </span>
                        {oldPrice && (
                          <span className="ml-2 text-sm text-gray-400 line-through">
                            ₴{oldPrice}
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
</div>

    </section>
  );
}

export default BooksCarousel;
