import React from "react";
import { FiChevronLeft, FiCreditCard } from "react-icons/fi";

export default function CheckoutProductSummary({
  item,
  mainImage,
  setMainImage,
  images,
  priceNumber,
  discountAmount,
  finalPrice,
  itemType,
  isExpanded,
  setIsExpanded,
  navigate,
  t,
}) {
  return (
    <aside className="order-2 lg:order-1">
      <div className="sticky space-y-6 top-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-4 text-text-secondary hover:text-primary"
        >
          <FiChevronLeft /> {t("books.back")}
        </button>

        <div className="overflow-hidden border shadow-sm rounded-2xl border-border bg-surface">
          {mainImage ? (
            <img
              src={mainImage}
              alt={item.name}
              className="object-cover w-full h-96"
            />
          ) : (
            <div className="flex items-center justify-center w-full text-gray-500 bg-gray-200 h-96">
              <div className="text-center">
                <FiCreditCard className="w-16 h-16 mx-auto mb-2" />
                <p>{t("books.no_image_available")}</p>
              </div>
            </div>
          )}
        </div>

        {images.length > 1 && (
          <div className="flex gap-3">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setMainImage(img.url || img.original_url)}
                className={`w-20 h-16 overflow-hidden rounded-lg border ${
                  mainImage === (img.url || img.original_url)
                    ? "border-primary ring-2 ring-primary"
                    : "border-border"
                }`}
              >
                <img
                  src={img.url || img.original_url}
                  className="object-cover w-full h-full"
                  alt={`thumb-${i}`}
                />
              </button>
            ))}
          </div>
        )}

        <div className="p-6 border rounded-2xl border-border bg-surface">
          <h1 className="text-2xl font-bold">{item.name}</h1>
          <p className="mt-1 text-sm text-text-secondary">by {item.author}</p>

          <div className="flex items-center justify-between mt-4">
            <div>
              <div className="flex items-center gap-2">
                {discountAmount > 0 && (
                  <span className="text-sm text-gray-400 line-through">
                    ₴{priceNumber.toFixed(2)}
                  </span>
                )}
                <span className="text-lg font-semibold text-primary">
                  ₴{finalPrice.toFixed(2)}
                </span>
              </div>
              <div className="text-xs text-text-secondary">
                {itemType === 1
                  ? t("books.delivery_included")
                  : t("books.pdf_download")}
              </div>
            </div>

            <div className="text-sm text-text-secondary">
              {item.pages_count} {t("books.pages")}
            </div>
          </div>

          <div className="mt-4 text-sm text-text-secondary">
            <p>
              <strong>{t("books.language")}:</strong> {item.language}
            </p>
            <p>
              <strong>{t("books.category")}:</strong> {item.category?.name}
            </p>
            <p>
              <strong>{t("books.type")}:</strong>{" "}
              {itemType === 1 ? t("books.delivery") : t("books.pdf_only")}
            </p>
          </div>

          <div
            className={`mt-4 leading-relaxed text-text-secondary ${
              !isExpanded ? "line-clamp-4" : ""
            }`}
            dangerouslySetInnerHTML={{ __html: item.description }}
          />
          {item.description && item.description.length > 200 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-2 font-medium underline text-primary hover:text-primary/80"
            >
              {isExpanded ? "Show Less" : "Read More"}
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
