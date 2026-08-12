import React, { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../context/ApiContext";
import { useTranslation } from "react-i18next";
import { FiChevronLeft, FiChevronRight, FiClock, FiShoppingBag, FiBook, FiBookOpen, FiActivity, FiTag } from "react-icons/fi";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function FlashOffers() {
  const { request } = useApi();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState({}); // Stores ticking seconds by offer ID
  
  // Navigation element state bindings for Swiper
  const [prevEl, setPrevEl] = useState(null);
  const [nextEl, setNextEl] = useState(null);

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
        console.error("Failed to fetch flash offers:", err);
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

  // Helper to format countdown
  const formatCountdown = (totalSeconds) => {
    if (!totalSeconds || totalSeconds <= 0) return t("flashOffers.expired");
    const d = Math.floor(totalSeconds / (3600 * 24));
    const h = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    return `${d}${t("flashOffers.days")} ${h}${t("flashOffers.hours")} ${m}${t("flashOffers.minutes")} ${s}${t("flashOffers.seconds")}`;
  };

  // Checkout redirect pattern matching Dr KROK standard
  const handleBuyNow = (offer) => {
    // Map backend type to frontend store page product type
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

  // Helper to get Store Type Icon
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

  if (offers.length === 0 && !loading) {
    return null; // Don't show anything (even the skeleton or header) if there are no active offers
  }

  if (loading) {
    return (
      <section className="py-12 w-full transition-colors duration-300 bg-gradient-to-r from-[#e0f9fa] via-white to-[#e0f9fa] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container px-4 mx-auto max-w-7xl">
          <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg mb-8" />
          <div className="h-[28rem] bg-gray-200 dark:bg-gray-700 animate-pulse rounded-3xl" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 w-full transition-colors duration-300 bg-gradient-to-r from-[#e0f9fa] via-white to-[#e0f9fa] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container px-4 mx-auto max-w-7xl">
        
        {/* Header section */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white md:text-4xl flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
              {t("flashOffers.title")}
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-300">
              {t("flashOffers.subtitle")}
            </p>
          </div>

          {/* Header Top-Right Square Navigation Controls */}
          {offers.length > 1 && (
            <div className="flex gap-2">
              <button
                ref={(node) => setPrevEl(node)}
                className="p-3 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-md transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer"
                aria-label="Previous Offer"
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>
              <button
                ref={(node) => setNextEl(node)}
                className="p-3 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-md transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center cursor-pointer"
                aria-label="Next Offer"
              >
                <FiChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        {/* Offers Slider / Carousel */}
        <div className="relative group">
          <Swiper
            modules={[Autoplay, Navigation, Pagination]}
            spaceBetween={24}
            slidesPerView={1}
            loop={offers.length > 1}
            autoplay={{ delay: 6000, disableOnInteraction: false }}
            pagination={{ clickable: true, dynamicBullets: true }}
            navigation={{
              prevEl,
              nextEl,
            }}
            className="overflow-hidden rounded-3xl shadow-xl shadow-cyan-500/5"
          >
            {offers.map((offer) => {
              const currentRemaining = timeRemaining[offer.id] || 0;
              
              return (
                <SwiperSlide key={offer.id}>
                  <div className="relative h-[32rem] md:h-[28rem] w-full overflow-hidden flex items-end">
                    {/* Background Banner Image */}
                    <img
                      src={offer.banner_image}
                      alt={offer.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                    
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

                    {/* Content panel */}
                    <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-10 text-white z-10">
                      {/* Upper row: Badges */}
                      <div className="flex justify-between items-start">
                        <span className="bg-red-600 text-white text-xs md:text-sm font-extrabold px-4 py-1.5 rounded-full uppercase tracking-wider animate-pulse shadow-lg shadow-red-600/30">
                          {offer.discount_percentage}% {t("flashOffers.off")}
                        </span>

                        {/* Countdown Timer */}
                        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 text-sm font-semibold">
                          <FiClock className="text-primary animate-spin-slow" />
                          <span className="text-gray-300">{t("flashOffers.endsIn")}:</span>
                          <span className="text-white font-mono">{formatCountdown(currentRemaining)}</span>
                        </div>
                      </div>

                      {/* Lower row: Details and CTAs */}
                      <div className="max-w-3xl mt-auto space-y-4">
                        <div className="space-y-2">
                          {/* Store Type Badge with Icon and Background */}
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md border border-white/15 rounded-lg text-xs font-bold uppercase tracking-wider text-primary-400">
                            {getStoreTypeIcon(offer.store_type)}
                            <span>{offer.store_name}</span>
                          </div>
                          
                          <h3 className="text-2xl md:text-4xl font-extrabold line-clamp-2 leading-tight">
                            {offer.title}
                          </h3>
                          {offer.item && (
                            <p className="text-sm md:text-base text-gray-300 font-medium line-clamp-1">
                              {offer.item.name}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-6 pt-2">
                          {/* Price display */}
                          <div className="flex items-baseline gap-3">
                            <span className="text-3xl md:text-4xl font-black text-primary">
                              ₴{offer.offer_price}
                            </span>
                            <span className="text-base md:text-lg text-gray-400 line-through">
                              ₴{offer.original_price}
                            </span>
                          </div>

                          {/* CTA button */}
                          <button
                            onClick={() => handleBuyNow(offer)}
                            disabled={currentRemaining <= 0}
                            className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary hover:bg-primary/80 hover:scale-105 active:scale-95 text-white font-semibold rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-primary/45 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FiShoppingBag className="text-lg" />
                            {t("flashOffers.buyNow")}
                          </button>
                        </div>
                      </div>
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
