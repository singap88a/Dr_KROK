import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../context/ApiContext";
import { useTranslation } from "react-i18next";
import { FiClock, FiShoppingBag, FiBook, FiBookOpen, FiActivity, FiTag, FiArrowLeft } from "react-icons/fi";
import SEO from "../../components/SEO/SEO";
import LoadingSpinner from "../../components/Common/LoadingSpinner";

const CATEGORIES = [
  { id: "all", labelKey: "flashOffers.all" },
  { id: "book", labelKey: "flashOffers.books" },
  { id: "booklet", labelKey: "flashOffers.booklets" },
  { id: "medical_tool", labelKey: "flashOffers.medicalTools" },
  { id: "apparel", labelKey: "flashOffers.apparel" }
];

export default function FlashOffersPage() {
  const { request } = useApi();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [offers, setOffers] = useState([]);
  const [filteredOffers, setFilteredOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [timeRemaining, setTimeRemaining] = useState({}); // Stores ticking seconds by offer ID

  // Fetch offers
  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        const res = await request("flash-offers", { useCache: false });

        if (res && res.success && Array.isArray(res.data)) {
          // Filter out expired offers initially
          const activeOffers = res.data.filter(offer => !offer.is_expired);
          setOffers(activeOffers);
          
          // Initialize countdown values
          const countdowns = {};
          activeOffers.forEach(o => {
            countdowns[o.id] = Math.max(0, parseInt(o.remaining_seconds) || 0);
          });
          setTimeRemaining(countdowns);
        }
      } catch (err) {
        console.error("Failed to fetch flash offers page data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, [request, i18n.language]);

  // Live ticking countdown timer
  useEffect(() => {
    if (Object.keys(timeRemaining).length === 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        const updated = { ...prev };
        let hasChanges = false;
        Object.keys(updated).forEach(id => {
          if (updated[id] > 0) {
            updated[id] -= 1;
            hasChanges = true;
          }
        });
        return hasChanges ? updated : prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  // Handle filtering
  useEffect(() => {
    if (activeCategory === "all") {
      setFilteredOffers(offers);
    } else {
      setFilteredOffers(offers.filter(o => o.store_type === activeCategory));
    }
  }, [activeCategory, offers]);

  // Format countdown helper
  const formatCountdown = (totalSeconds) => {
    if (!totalSeconds || totalSeconds <= 0) return t("flashOffers.expired");
    const d = Math.floor(totalSeconds / (3600 * 24));
    const h = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    return `${d}${t("flashOffers.days")} ${h}${t("flashOffers.hours")} ${m}${t("flashOffers.minutes")} ${s}${t("flashOffers.seconds")}`;
  };

  // Buy now redirect logic
  const handleBuyNow = (offer) => {
    let productType = offer.store_type;
    if (offer.store_type === "apparel") {
      productType = "medical_clothes";
    }

    const checkoutItem = {
      ...offer.item,
      price: offer.original_price, // Will be discounted in checkout calculations
      discount: offer.discount_percentage,
      type: offer.store_type === "booklet" ? "PDF" : "delivery"
    };

    navigate("/store/checkout", {
      state: {
        item: checkoutItem,
        productType: productType,
        itemType: offer.store_type
      }
    });
  };

  const getStoreTypeIcon = (type) => {
    switch (type) {
      case "book":
        return <FiBook className="text-sm" />;
      case "booklet":
        return <FiBookOpen className="text-sm" />;
      case "medical_tool":
        return <FiActivity className="text-sm" />;
      default:
        return <FiTag className="text-sm" />;
    }
  };

  return (
    <section className="min-h-screen px-4 py-12 md:px-10 lg:px-20 bg-background text-text transition-colors duration-300">
      <SEO 
        title={t("flashOffers.title") || "Flash Offers"}
        description={t("flashOffers.subtitle") || "Limited-time deals"}
      />
      <div className="mx-auto max-w-7xl">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 text-text-secondary hover:text-primary transition duration-300 font-medium"
        >
          <FiArrowLeft /> {t("books.back")}
        </button>

        {/* Title and Controls Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white md:text-5xl flex items-center gap-3">
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-primary"></span>
              </span>
              {t("flashOffers.title")}
            </h1>
            <p className="mt-3 text-gray-600 dark:text-gray-300 text-base md:text-lg">
              {t("flashOffers.subtitle")}
            </p>
          </div>

          {/* Filtering Tabs */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-5 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 ${
                  activeCategory === cat.id
                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                    : "bg-surface text-gray-600 dark:text-gray-300 border border-border hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {t(cat.labelKey)}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[40vh]">
            <LoadingSpinner size="lg" className="text-primary" />
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="text-center py-20 bg-surface border border-border rounded-3xl p-8">
            <FiShoppingBag className="mx-auto mb-4 text-6xl text-text-muted opacity-25" />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{t("flashOffers.noOffers")}</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredOffers.map((offer) => {
              const currentRemaining = timeRemaining[offer.id] || 0;
              const hasExpired = currentRemaining <= 0;

              return (
                <div 
                  key={offer.id}
                  className="relative flex flex-col overflow-hidden transition-all duration-500 border group rounded-3xl bg-surface border-border hover:shadow-2xl hover:-translate-y-2"
                >
                  {/* Image and Badges */}
                  <div className="relative h-64 overflow-hidden bg-gray-100 dark:bg-gray-900">
                    {/* Discount Tag */}
                    <span className="absolute z-10 px-3 py-1 text-xs font-bold text-white bg-red-600 rounded-lg shadow-md top-4 right-4 animate-pulse">
                      {offer.discount_percentage}% {t("flashOffers.off")}
                    </span>

                    <img
                      src={offer.banner_image || (offer.item && (offer.item.image || "/logo.png"))}
                      alt={offer.title}
                      className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => { e.currentTarget.src = "/logo.png"; }}
                      loading="lazy"
                    />

                    {/* Countdown Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 text-xs font-semibold text-white">
                      <FiClock className={`text-primary ${!hasExpired && 'animate-spin-slow'}`} />
                      <span className="text-gray-300 font-medium">{t("flashOffers.endsIn")}:</span>
                      <span className="font-mono text-white tracking-wide ml-auto">{formatCountdown(currentRemaining)}</span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="flex flex-col flex-grow p-6">
                    <div className="flex items-center gap-2 mb-3">
                      {/* Store Category pill */}
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-primary/10 border border-primary/10 rounded-md text-xs font-bold uppercase tracking-wider text-primary">
                        {getStoreTypeIcon(offer.store_type)}
                        {offer.store_name}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2 leading-snug group-hover:text-primary transition-colors duration-300 min-h-[3.5rem]">
                      {offer.title}
                    </h3>
                    
                    {offer.item && (
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2 min-h-[2.5rem]">
                        {offer.item.name}
                      </p>
                    )}

                    {/* Price and Buy CTA */}
                    <div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-black text-primary">
                          ₴{offer.offer_price}
                        </div>
                        <div className="text-sm text-gray-400 line-through">
                          ₴{offer.original_price}
                        </div>
                      </div>

                      <button
                        onClick={() => handleBuyNow(offer)}
                        disabled={hasExpired}
                        className="inline-flex items-center gap-2 px-5 py-3 bg-primary hover:bg-primary/90 hover:scale-105 active:scale-95 text-white font-bold rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        <FiShoppingBag className="text-base" />
                        {t("flashOffers.buyNow")}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
