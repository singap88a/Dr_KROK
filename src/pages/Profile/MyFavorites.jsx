import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiHeart, FiBook, FiUser, FiStar, FiGlobe, FiEye } from "react-icons/fi";
import { useApi } from "../../context/ApiContext";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

export default function MyFavorites() {
  const { getFavorites, toggleFavorite, request } = useApi();
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
            if (favorite.type === 'book') {
              const bookResponse = await request(`books/${favorite.table_id}`);
              return {
                ...favorite,
                bookData: bookResponse.data
              };
            } else if (favorite.type === 'course') {
              const courseResponse = await request(`courses/${favorite.table_id}`);
              return {
                ...favorite,
                courseData: courseResponse.data
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t("favorites.title")}</h2>
          <p className="text-text-secondary">
            {favorites.length === 1
              ? t("favorites.itemsCount_one", { count: favorites.length })
              : t("favorites.itemsCount_other", { count: favorites.length })
            }
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-2 rounded-lg text-sm font-medium ${activeFilter === "all" ? "bg-primary text-white" : "bg-surface text-text"}`}
            title={t("favorites.filterAll", "All")}
          >
            {t("favorites.filterAll", "All")}
          </button>
          <button
            onClick={() => setActiveFilter("book")}
            className={`px-3 py-2 rounded-lg text-sm font-medium ${activeFilter === "book" ? "bg-primary text-white" : "bg-surface text-text"}`}
            title={t("favorites.filterBooks", "Books")}
          >
            <FiBook className="inline mr-1" /> {t("favorites.filterBooks", "Books")}
          </button>
          <button
            onClick={() => setActiveFilter("course")}
            className={`px-3 py-2 rounded-lg text-sm font-medium ${activeFilter === "course" ? "bg-primary text-white" : "bg-surface text-text"}`}
            title={t("favorites.filterCourses", "Courses")}
          >
            <FiUser className="inline mr-1" /> {t("favorites.filterCourses", "Courses")}
          </button>
        </div>
      </div>

      {/* Favorites Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredFavorites.map((item) => {
          // If it's a course, use the course card components
          if (item.type === 'course') {
            const courseData = item.courseData || item;
            const courseCardData = {
              id: courseData.id || item.table_id,
              type: "video",
              title: courseData.title,
              description: courseData.description,
              instructor: courseData.instructor?.name || courseData.instructor || "",
              hours: Math.max(1, Math.round((courseData.duration_minutes || 0) / 60)),
              students: courseData.enrolled_count ?? 0,
              rating: courseData.avg_rating ?? 0,
              price: courseData.price ? Number(courseData.price) : 0,
              img:
                courseData.image && typeof courseData.image === "string" && courseData.image.length > 0
                  ? courseData.image
                  : "/logo.png",
            };

            return (
              <article
                key={item.id}
                onClick={() => navigate(`/courses/${item.table_id}`)}
                className="relative overflow-hidden transition transform bg-white shadow-md cursor-pointer group dark:bg-gray-800 rounded-2xl hover:-translate-y-2 hover:shadow-xl"
                role="button"
                tabIndex={0}
                aria-label={`Open details for ${courseCardData.title}`}
              >
                <div className="relative w-full h-44 sm:h-48 lg:h-40">
                  <img
                    src={courseCardData.img}
                    alt={courseCardData.title}
                    className="object-cover w-full h-full transition-transform group-hover:scale-105 duration-400"
                  />
                  <div className="absolute px-2 py-1 text-xs text-white rounded top-3 left-3 bg-black/40 backdrop-blur">
                    <svg xmlns="http://www.w3.org/2000/svg" className="inline mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{width: '1em', height: '1em'}}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-6.518-3.75A1 1 0 007 8.25v7.5a1 1 0 001.234.97l6.518-1.875a1 1 0 00.752-.97v-3.75a1 1 0 00-.752-.97z" />
                    </svg>
                    Video
                  </div>
                  <button
                    aria-label="toggle favorite"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemoveFavorite(item);
                    }}
                    className="absolute z-10 p-2 transition-all duration-200 bg-white rounded-full shadow top-3 right-3 hover:bg-white/90"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`text-xl ${true ? "text-red-500 fill-red-500" : "text-gray-500"}`} fill="currentColor" viewBox="0 0 24 24" stroke="none" style={{width: '1em', height: '1em'}}>
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 1.01 4.5 2.09C13.09 4.01 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </button>
                </div>
                <div className="p-4 sm:p-5">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {courseCardData.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                    {courseCardData.description}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{width: '1em', height: '1em'}}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>{courseCardData.instructor}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="inline" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{width: '1em', height: '1em'}}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{courseCardData.hours}h</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                        ${courseCardData.price}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {courseCardData.students} students
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {courseCardData.rating}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/courses/${item.table_id}`);
                      }}
                      className="px-3 py-1 text-sm text-white transition rounded-lg bg-primary"
                    >
                      View
                    </button>
                  </div>
                </div>
              </article>
            );
          } else {
            // If it's a book, use the existing generic card design
            const bookData = item.bookData || item;
            const images = bookData.images ? Object.values(bookData.images) : [];
            const mainImage = images.length > 0 ? images[0].original_url : bookData.image || "/user.png";

            return (
              <div
                key={item.id}
                className="relative overflow-hidden transition-all duration-300 border group rounded-2xl bg-surface border-border hover:shadow-xl hover:-translate-y-1"
              >
                {/* Item Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={mainImage}
                    alt={bookData.name || bookData.title}
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/user.png";
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

                  {/* Type Badge - Only show if not book */}
                  {item.type !== 'book' && (
                    <div className="absolute px-2 py-1 text-xs font-semibold text-white rounded-lg bottom-3 left-3 bg-primary/80">
                      {t("favorites.course")}
                    </div>
                  )}
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
                      onClick={() => navigate(item.type === 'book' ? `/book/${item.table_id}` : `/courses/${item.table_id}`)}
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