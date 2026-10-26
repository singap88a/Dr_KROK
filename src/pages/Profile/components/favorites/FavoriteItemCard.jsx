import React from "react";
import { FiEye, FiHeart } from "react-icons/fi";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export default function FavoriteItemCard({ item, handleRemoveFavorite, removingId }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const isCourse = ["video_course", "live_course", "center_course"].includes(item.type);

  if (isCourse) {
    const c = item.courseData || item;
    const images = c.images ? Object.values(c.images) : [];
    const mainImage =
      c.image ||
      c.main_image ||
      (images.length > 0 ? images[0].original_url || images[0].url : "/logo.png");

    const price = c.price ? Number(c.price) : 0;
    const discount = c.discount ? Number(c.discount) : 0;
    const hasDiscount = discount > 0 && price > 0;
    const finalPrice = hasDiscount
      ? (price - (price * discount) / 100).toFixed(2)
      : price.toFixed(2);

    return (
      <div className="relative overflow-hidden transition-all duration-300 border group rounded-2xl bg-surface border-border hover:shadow-xl hover:-translate-y-1">
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
            {item.type === "live_course"
              ? t("favorites.filterLiveCourses", "Live Course")
              : item.type === "center_course"
              ? t("favorites.filterCenterCourses", "Center Course")
              : t("favorites.filterCourses", "Video Course")}
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
            <span className="text-xl font-semibold text-primary">₴{finalPrice}</span>
            {hasDiscount && (
              <span className="ml-2 text-sm text-gray-400 line-through">
                ₴{price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() =>
                navigate(
                  item.type === "live_course"
                    ? `/live-courses/${item.table_id}`
                    : item.type === "center_course"
                    ? `/center-courses/${item.table_id}`
                    : `/courses/${item.table_id}`
                )
              }
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

  // Store/book item
  const bookData = item.bookData || item;
  const images = bookData.images ? Object.values(bookData.images) : [];
  const mainImage =
    bookData.main_image ||
    bookData.image ||
    (images.length > 0 ? images[0].original_url || images[0].url : "/logo.png");

  return (
    <div className="relative overflow-hidden transition-all duration-300 border group rounded-2xl bg-surface border-border hover:shadow-xl hover:-translate-y-1">
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
          {item.type === "book"
            ? t("favorites.filterBooks", "Book / Booklet")
            : item.type === "medical_tool"
            ? t("navbar.medicalTools", "Medical Tool")
            : item.type === "apparel"
            ? t("navbar.medicalClothes", "Medical Clothes")
            : item.type}
        </div>
      </div>

      {/* Item Content */}
      <div className="p-5">
        <h3 className="mb-2 text-lg font-semibold transition group-hover:text-primary line-clamp-2">
          {bookData.name || bookData.title}
        </h3>

        {bookData.description && (
          <div
            className="mb-3 text-sm text-text-secondary line-clamp-2"
            dangerouslySetInnerHTML={{
              __html: bookData.description || bookData.short_description,
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
            onClick={() =>
              navigate(
                item.type === "book"
                  ? `/store/books/${item.table_id}`
                  : item.type === "booklet"
                  ? `/store/booklets/${bookData.slug || item.table_id}`
                  : item.type === "medical_tool"
                  ? `/store/medical-tools/${bookData.slug || item.table_id}`
                  : item.type === "apparel"
                  ? `/store/medical-clothes/${bookData.slug || item.table_id}`
                  : `/courses/${item.table_id}`
              )
            }
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
