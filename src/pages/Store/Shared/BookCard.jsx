import React from "react";
import { FiHeart, FiStar } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function BookCard({ item, isFavorite, onToggleFavorite, isLoadingFavorite, detailsRoute }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const price = parseFloat(item.price || 0);
  const discountPercent = parseFloat(item.discount || 0);
  const discountAmount = discountPercent > 0 ? (price * discountPercent / 100) : 0;
  const oldPrice = discountPercent > 0 ? price.toFixed(2) : null;
  const discountedPrice = discountPercent > 0 ? Math.max(0, price - discountAmount).toFixed(2) : price.toFixed(2);

  return (
    <div className="relative flex flex-col overflow-hidden transition-all duration-500 border group rounded-2xl bg-surface border-border hover:shadow-2xl hover:-translate-y-2">
      <div className="relative h-56 overflow-hidden bg-gray-100">
        {discountPercent > 0 && (
          <span className="absolute z-10 px-2 py-1 text-xs font-semibold text-white bg-red-500 rounded-lg shadow-md top-3 right-3">
            {discountPercent}%
          </span>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(item.id); }}
          disabled={isLoadingFavorite}
          className="absolute z-20 p-2 transition-all duration-200 rounded-full shadow-lg opacity-100 top-3 left-3 bg-white/90 hover:bg-white disabled:opacity-50 group-hover:opacity-100"
        >
          <FiHeart className={`text-xl transition-colors ${isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-400 hover:text-red-500'}`} />
        </button>

        <img
          src={item.main_image || item.image || (item.images && (Object.values(item.images)[0]?.url || Object.values(item.images)[0]?.original_url))}
          alt={item.name}
          className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
          onError={(e) => { e.currentTarget.src = "/logo.png"; }}
        />

        {item.is_bestseller && (
          <div className="absolute z-10 bottom-3 right-3 flex items-center gap-1 px-2 py-1 text-xs font-bold text-white bg-yellow-500 rounded-lg shadow-md">
            <FiStar className="text-xs" /> {t('books.bestseller', 'Bestseller')}
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 p-5">
        <h3 className="mb-2 text-lg font-semibold transition group-hover:text-primary">
          {item.name}
        </h3>
        <div
          className="mt-1 text-sm text-gray-600 dark:text-gray-300 line-clamp-2 prose prose-sm dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: item.description }}
        />

        <div className="mt-4 mb-4">
          {oldPrice && <span className="mr-2 text-gray-400 line-through">₴{oldPrice}</span>}
          <span className="font-semibold text-primary">₴{discountedPrice}</span>
        </div>

        <button
          onClick={() => navigate(`${detailsRoute}/${item.product_type === 'booklet' ? (item.slug || item.id) : item.id}`)}
          className="px-4 py-2 mt-auto font-medium text-white transition rounded-lg bg-primary hover:shadow-lg hover:brightness-110"
        >
          {t('books.view_details', 'View Details')}
        </button>
      </div>
    </div>
  );
}
