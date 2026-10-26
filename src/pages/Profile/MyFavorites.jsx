import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { FiHeart } from "react-icons/fi";
import { useApi } from "../../context/ApiContext";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import FavoriteItemCard from "./components/favorites/FavoriteItemCard";

export default function MyFavorites() {
  const {
    getFavorites,
    toggleFavorite,
    request,
    getVideoCourseById,
    getLiveCourseById,
    getCenterCourseById,
  } = useApi();
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

    i18n.on("languageChanged", handleLanguageChange);
    return () => {
      i18n.off("languageChanged", handleLanguageChange);
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
            if (favorite.type === "book" || favorite.type === "booklet") {
              const bookResponse = await request(`books/${favorite.table_id}`);
              return {
                ...favorite,
                bookData: bookResponse.data,
              };
            } else if (favorite.type === "medical_tool") {
              const toolResponse = await request(`medical-tools/${favorite.table_id}`);
              return {
                ...favorite,
                bookData: toolResponse.data,
              };
            } else if (favorite.type === "apparel") {
              const apparelResponse = await request(`apparels/${favorite.table_id}`);
              return {
                ...favorite,
                bookData: apparelResponse.data,
              };
            } else if (favorite.type === "video_course") {
              const course = await getVideoCourseById(favorite.table_id);
              return {
                ...favorite,
                courseData: course,
              };
            } else if (favorite.type === "live_course") {
              const liveCourse = await getLiveCourseById(favorite.table_id);
              return {
                ...favorite,
                courseData: liveCourse,
              };
            } else if (favorite.type === "center_course") {
              const centerCourse = await getCenterCourseById(favorite.table_id);
              return {
                ...favorite,
                courseData: centerCourse,
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
      console.error("Failed to fetch favorites");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (item) => {
    try {
      setRemovingId(item.id);
      await toggleFavorite(item.table_id, item.type);
      setFavorites((prev) => prev.filter((f) => f.id !== item.id));
      toast.success(t("favorites.removedSuccess"));
    } catch {
      toast.error(t("favorites.removeFailed"));
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 rounded-full border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-6 animate-fadeIn">
        <div className="flex items-center justify-center w-20 h-20 mb-4 rounded-full bg-primary/10">
          <FiHeart className="w-10 h-10 text-primary" />
        </div>
        <h2 className="mb-2 text-2xl font-bold">{t("favorites.emptyTitle")}</h2>
        <p className="max-w-md mb-6 text-text-secondary">{t("favorites.emptyDescription")}</p>
        <Link
          to="/courses"
          className="px-6 py-3 font-semibold text-white transition-colors rounded-xl bg-primary hover:bg-secondary"
        >
          {t("favorites.browseCourses")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Page Title & Filter Buttons */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-border">
        <div>
          <h2 className="text-2xl font-bold">{t("favorites.title")}</h2>
          <p className="text-sm text-text-secondary">
            {t("favorites.savedItemsCount", { count: favorites.length })}
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeFilter === "all"
                ? "bg-primary text-white"
                : "bg-surface border border-border hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            {t("favorites.filterAll")}
          </button>
          <button
            onClick={() => setActiveFilter("course")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeFilter === "course"
                ? "bg-primary text-white"
                : "bg-surface border border-border hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            {t("favorites.filterCourses")}
          </button>
          <button
            onClick={() => setActiveFilter("book")}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeFilter === "book"
                ? "bg-primary text-white"
                : "bg-surface border border-border hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            {t("favorites.filterBooks")}
          </button>
        </div>
      </div>

      {/* Favorites Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredFavorites.map((item) => (
          <FavoriteItemCard
            key={item.id}
            item={item}
            handleRemoveFavorite={handleRemoveFavorite}
            removingId={removingId}
          />
        ))}
      </div>
    </div>
  );
}