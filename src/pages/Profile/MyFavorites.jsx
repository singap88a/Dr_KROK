import React, { useState, useEffect } from "react";
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

      // Fetch detailed book data for each favorite
      const detailedFavorites = await Promise.all(
        favoritesData.map(async (favorite) => {
          try {
            if (favorite.type === 'book') {
              const bookResponse = await request(`books/${favorite.table_id}`);
              return {
                ...favorite,
                bookData: bookResponse.data
              };
            }
            return favorite;
          } catch {
            console.error(`Failed to fetch book ${favorite.table_id}`);
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
      </div>

      {/* Favorites Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {favorites.map((item) => {
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
                    onClick={() => navigate(item.type === 'book' ? `/book/${item.table_id}` : `/course/${item.table_id}`)}
                    className="flex items-center justify-center flex-1 gap-2 px-4 py-2 text-sm font-medium text-white transition-colors rounded-lg bg-primary hover:bg-secondary"
                  >
                    <FiEye />
                    {t("favorites.viewDetails")}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
