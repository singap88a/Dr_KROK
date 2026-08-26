import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiHeart, FiBook, FiUser, FiStar, FiGlobe, FiEye } from "react-icons/fi";
import { useApi } from "../../context/ApiContext";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

export default function MyFavorites() {
  const { getFavorites, toggleFavorite, request, getVideoCourseById, getLiveCourseById } = useApi();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all"); // all | book | course

  // Compute filtered list before any early returns to keep hooks order stable
  const filteredFavorites = useMemo(() => {
    if (activeFilter === "all") return favorites;
    return favorites.filter((f) => f.type === activeFilter);
  }, [favorites, activeFilter]);

  useEffect(() => {
    fetchFavorites();
  }, []);

  // Re-fetch favorites when language changes
  useEffect(() => {
    const handleLanguageChange = () => {
      if (favorites.length > 0) {
        fetchFavorites();
      }
    };

    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [favorites.length]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await getFavorites();
      const favoritesData = response.data || [];

      // Fetch detailed data for each favorite
      const detailedFavorites = await Promise.all(
        favoritesData.map(async (favorite) => {
          try {
            if (favorite.type === 'book' || favorite.type === 'booklet') {
              const bookResponse = await request(`books/${favorite.table_id}`);
              return {
                ...favorite,
                bookData: bookResponse.data
              };
            } else if (favorite.type === 'medical_tool') {
              const toolResponse = await request(`medical-tools/${favorite.table_id}`);
              return {
                ...favorite,
                bookData: toolResponse.data
              };
            } else if (favorite.type === 'apparel') {
              const apparelResponse = await request(`apparels/${favorite.table_id}`);
              return {
                ...favorite,
                bookData: apparelResponse.data
              };
            } else if (favorite.type === 'video_course') {
              // Use resilient course fetcher that handles multiple backend routes
              const course = await getVideoCourseById(favorite.table_id);
              return {
                ...favorite,
                courseData: course
              };
            } else if (favorite.type === 'live_course') {
              // Use resilient live course fetcher that handles multiple backend routes
              const liveCourse = await getLiveCourseById(favorite.table_id);
              return {
                ...favorite,
                courseData: liveCourse
              };
            }
            return favorite;
          } catch {
            console.error(`Failed to fetch ${favorite.type} ${favorite.table_id}`);
            return favorite;
          }
        })
      );

      setFavorites(detailedFavorites);
    } catch {
      toast.error(t("favorites.failedToLoad"));
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (item) => {
    setRemovingId(item.id);
    try {
      await toggleFavorite(item.table_id, item.type);
      setFavorites(prev => prev.filter(fav => fav.id !== item.id));
      toast.success(t("favorites.removedFromFavorites"));
    } catch {
      toast.error(t("favorites.failedToRemove"));
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 rounded-full border-primary border-t-transparent animate-spin"></div>
          <p className="text-text-secondary">{t("favorites.loading")}</p>
        </div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-4 text-gray-400">
            <FiHeart className="w-full h-full text-gray-400" />
          </div>
          <h3 className="mb-2 text-xl font-semibold">{t("favorites.noFavorites")}</h3>
          <p className="mb-6 text-text-secondary">
            {t("favorites.noFavoritesDescription")}
          </p>
          <Link
            to="/books"
            className="px-6 py-3 text-white transition-colors rounded-lg bg-primary hover:bg-secondary"
          >
            {t("favorites.browseBooks")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold sm:text-2xl">{t("favorites.title")}</h2>
          <p className="text-text-secondary">
            {favorites.length === 1
              ? t("favorites.itemsCount_one", { count: favorites.length })
              : t("favorites.itemsCount_other", { count: favorites.length })
            }
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center">
          <div className="relative">
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 text-sm font-semibold border rounded-xl bg-surface text-text border-border focus:outline-none focus:ring-2 focus:ring-primary shadow-sm cursor-pointer hover:border-primary transition-colors"
            >
              <option value="all">{t("favorites.filterAll", "All Items")}</option>
              <option value="book">{t("favorites.filterBooks", "Books & Booklets")}</option>
              <option value="medical_tool">{t("navbar.medicalTools", "Medical Tools")}</option>
              <option value="apparel">{t("navbar.medicalClothes", "Medical Clothes")}</option>
              <option value="video_course">{t("favorites.filterCourses", "Video Courses")}</option>
              <option value="live_course">{t("favorites.filterLiveCourses", "Live Courses")}</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-text-secondary">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Favorites Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredFavorites.map((item) => {
          // If it's a video course, render the same card style as books
          if (item.type === 'video_course' || item.type === 'live_course') {
            const c = item.courseData || item;
            const images = c.images ? Object.values(c.images) : [];
            const mainImage = images.length > 0 ? images[0].original_url : (c.image || "/logo.png");
            const price = c.price ? Number(c.price) : 0;
            const discount = c.discount ? Number(c.discount) : 0;
            const hasDiscount = discount > 0 && price > 0;
            const finalPrice = hasDiscount ? (price - (price * discount / 100)).toFixed(2) : price.toFixed(2);

            return (
              <div
                key={item.id}
                className="relative overflow-hidden transition-all duration-300 border group rounded-2xl bg-surface border-border hover:shadow-xl hover:-translate-y-1"
              >
                {/* Item Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={mainImage}
                    alt={c.title}
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/logo.png";
                    }}
                  />

                  {/* Remove from Favorites Button */}
                  <button
                    onClick={() => handleRemoveFavorite(item)}
                    disabled={removingId === item.id}
                    className="absolute z-20 p-2 transition-all duration-200 rounded-full shadow-lg top-3 right-3 bg-white/90 hover:bg-white disabled:opacity-50"
                  >
                    <FiHeart className="w-5 h-5 text-red-500 fill-red-500" />
                  </button>

                  {/* Type Badge */}
                  <div className="absolute px-3 py-1.5 text-[10px] sm:text-xs font-bold text-white uppercase tracking-wider rounded-full bottom-3 left-3 backdrop-blur-md bg-black/60 border border-white/20 shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
                    {item.type === 'live_course' ? t("favorites.filterLiveCourses", "Live Course") : t("favorites.filterCourses", "Video Course")}
                  </div>
                </div>

                {/* Item Content */}
                <div className="p-5">
                  <h3 className="mb-2 text-lg font-semibold transition group-hover:text-primary line-clamp-2">
                    {c.title}
                  </h3>

                  {c.description && (
                    <p className="mb-3 text-sm text-text-secondary line-clamp-2">
                      {c.description}
                    </p>
                  )}

                  {/* Price */}
                  <div className="mb-4">
                    <span className="text-xl font-semibold text-primary">
                      ₴{finalPrice}
                    </span>
                    {hasDiscount && (
                      <span className="ml-2 text-sm text-gray-400 line-through">
                        ₴{price.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(item.type === 'live_course' ? `/live-courses/${item.table_id}` : `/courses/${item.table_id}`)}
                      className="flex items-center justify-center flex-1 gap-2 px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-primary hover:bg-secondary"
                    >
                      <FiEye />
                      {t("favorites.viewDetails")}
                    </button>
                  </div>
                </div>
              </div>
            );
          } else {
            // If it's a book, use the existing generic card design
            const bookData = item.bookData || item;
            const images = bookData.images ? Object.values(bookData.images) : [];
            const mainImage = bookData.main_image || bookData.image || (images.length > 0 ? (images[0].original_url || images[0].url) : "/logo.png");

            return (
              <div
                key={item.id}
                className="relative overflow-hidden transition-all duration-300 border group rounded-2xl bg-surface border-border hover:shadow-xl hover:-translate-y-1"
              >
                {/* Item Image */}
                <div className="relative h-48 overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <img
                    src={mainImage}
                    alt={bookData.name || bookData.title}
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/logo.png";
                    }}
                  />

                  {/* Remove from Favorites Button */}
                  <button
                    onClick={() => handleRemoveFavorite(item)}
                    disabled={removingId === item.id}
                    className="absolute z-20 p-2 transition-all duration-200 rounded-full shadow-lg top-3 right-3 bg-white/90 hover:bg-white disabled:opacity-50"
                  >
                    <FiHeart className="w-5 h-5 text-red-500 fill-red-500" />
                  </button>

                  {/* Type Badge */}
                  <div className="absolute px-3 py-1.5 text-[10px] sm:text-xs font-bold text-white uppercase tracking-wider rounded-full bottom-3 left-3 backdrop-blur-md bg-black/60 border border-white/20 shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
                    {item.type === 'book' ? t("favorites.filterBooks", "Book / Booklet") : 
                     item.type === 'medical_tool' ? t("navbar.medicalTools", "Medical Tool") :
                     item.type === 'apparel' ? t("navbar.medicalClothes", "Medical Clothes") :
                     item.type}
                  </div>
                </div>

                {/* Item Content */}
                <div className="p-5">
                  <h3 className="mb-2 text-lg font-semibold transition group-hover:text-primary line-clamp-2">
                    {bookData.name || bookData.title}
                  </h3>

                  {/* Description with HTML formatting like PrivacyPolicy */}
                  {bookData.description && (
                    <div
                      className="mb-3 text-sm text-text-secondary line-clamp-2"
                      dangerouslySetInnerHTML={{
                        __html: bookData.description || bookData.short_description
                      }}
                    />
                  )}

                  {/* Price */}
                  {bookData.price && (
                    <div className="mb-4">
                      <span className="text-xl font-semibold text-primary">
                        ${parseFloat(bookData.price).toFixed(2)}
                      </span>
                      {bookData.discount > 0 && (
                        <span className="ml-2 text-sm text-gray-400 line-through">
                          ${(parseFloat(bookData.price) + parseFloat(bookData.discount)).toFixed(2)}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(
                        item.type === 'book' ? `/store/books/${item.table_id}` : 
                        item.type === 'booklet' ? `/store/booklets/${bookData.slug || item.table_id}` :
                        item.type === 'medical_tool' ? `/store/medical-tools/${bookData.slug || item.table_id}` :
                        item.type === 'apparel' ? `/store/medical-clothes/${bookData.slug || item.table_id}` :
                        `/courses/${item.table_id}`
                      )}
                      className="flex items-center justify-center flex-1 gap-2 px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-primary hover:bg-secondary"
                    >
                      <FiEye />
                      {t("favorites.viewDetails")}
                    </button>
                  </div>
                </div>
              </div>
            );
          }
        })}
      </div>
    </div>
  );
}