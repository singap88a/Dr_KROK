import React from "react";
import { FiHeart, FiStar, FiActivity } from "react-icons/fi";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function MedicalToolCard({ item, isFavorite, onToggleFavorite, isLoadingFavorite, detailsRoute }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const price = parseFloat(item.price || 0);
  const discountPercent = parseFloat(item.discount || 0);
  const discountAmount = discountPercent > 0 ? (price * discountPercent / 100) : 0;
  const oldPrice = discountPercent > 0 ? price.toFixed(2) : null;
  const discountedPrice = discountPercent > 0 ? Math.max(0, price - discountAmount).toFixed(2) : price.toFixed(2);

  return (
    <div className="relative flex flex-col overflow-hidden transition-all duration-300 border-2 group rounded-xl bg-surface border-border hover:border-primary hover:shadow-xl">
      <div className="relative h-56 overflow-hidden bg-gray-100">
        {discountPercent > 0 && (
          <span className="absolute z-10 px-3 py-1 text-sm font-bold text-white bg-red-600 rounded-bl-xl top-0 right-0 shadow-sm">
            {discountPercent}% OFF
          </span>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(item.id); }}
          disabled={isLoadingFavorite}
          className="absolute z-20 p-2.5 transition-all duration-200 rounded-full shadow-md opacity-100 top-3 left-3 bg-white/80 hover:bg-white disabled:opacity-50"
        >
          <FiHeart className={`text-xl transition-colors ${isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-500 hover:text-red-500'}`} />
        </button>

        <img
          src={item.main_image || item.image || (item.images && (Object.values(item.images)[0]?.url || Object.values(item.images)[0]?.original_url))}
          alt={item.name}
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
          onError={(e) => { e.currentTarget.src = "/logo.png"; }}
        />

        {item.is_bestseller && (
          <div className="absolute z-10 bottom-3 right-3 flex items-center gap-1 px-2 py-1 text-xs font-bold text-white bg-yellow-500 rounded-lg shadow-sm">
            <FiStar className="text-xs" /> {t('books.bestseller', 'Bestseller')}
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 p-5 border-t border-border bg-gray-50/50 dark:bg-gray-800/50">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-lg font-bold text-gray-800 transition dark:text-gray-100 group-hover:text-primary">
            {item.name}
          </h3>
          <FiActivity className="text-xl text-primary opacity-70 shrink-0 mt-1" />
        </div>

        <div
          className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2 prose prose-sm dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: item.description }}
        />

        {/* Vendor / Instructor */}
        {item.instructor && (
          <Link
            to={`/merchants/${item.instructor.id}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2 mb-3 group/vendor"
          >
            <img
              src={item.instructor.image || "/user.png"}
              alt={item.instructor.name}
              className="w-8 h-8 rounded-full object-cover shrink-0"
              onError={(e) => { e.currentTarget.src = "/user.png"; }}
            />
            <span className="text-xs text-gray-500 dark:text-gray-400 group-hover/vendor:text-primary transition-colors truncate">{item.instructor.name}</span>
          </Link>
        )}

        <div className="flex items-center justify-between mt-auto pt-4">
          <div>
            {oldPrice && <div className="text-xs text-gray-400 line-through">₴{oldPrice}</div>}
            <div className="text-xl font-black text-primary">₴{discountedPrice}</div>
          </div>

          <button
            onClick={() => navigate(`${detailsRoute}/${item.slug}`)}
            className="px-5 py-2.5 text-sm font-semibold text-white transition rounded-full bg-primary hover:bg-primary-focus hover:-translate-y-0.5 active:translate-y-0"
          >
            {t('books.view_details', 'View Details')}
          </button>
        </div>
      </div>
    </div>
  );
}
