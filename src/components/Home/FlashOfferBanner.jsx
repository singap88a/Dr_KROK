import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../context/ApiContext";
import { useTranslation } from "react-i18next";
import { FiClock, FiShoppingBag, FiBook, FiBookOpen, FiActivity, FiTag } from "react-icons/fi";
import "swiper/css";
import "swiper/css/pagination";

export default function FlashOfferBanner({ type }) {
  const { request } = useApi();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState({}); // Stores ticking seconds by offer ID

  // Map productType names if necessary
  const getBannerType = (storeType) => {
    if (storeType === "medical_clothes" || storeType === "apparel") return "apparel";
    return storeType; // book, booklet, medical_tool
  };

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const bannerType = getBannerType(type);
        
        // We will fetch from the main flash-offers endpoint to get all matching offers for this type
        const res = await request("flash-offers", { useCache: false });
        if (res && res.success && Array.isArray(res.data)) {
          // Filter by category type and verify not expired
          const typeOffers = res.data.filter(
            offer => offer.store_type === bannerType && !offer.is_expired
          );
          setOffers(typeOffers);

          // Initialize countdown values
          const countdowns = {};
          typeOffers.forEach(o => {
            countdowns[o.id] = Math.max(0, parseInt(o.remaining_seconds) || 0);
          });
          setTimeRemaining(countdowns);
        } else {
          setOffers([]);
        }
      } catch (err) {
        console.error(`Failed to fetch flash offer banners for ${type}:`, err);
        setOffers([]);
      } finally {
        setLoading(false);
      }
    };
    if (type) {
      fetchBanners();
    }
  }, [type, request, i18n.language]);

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

  // Format countdown
  const formatCountdown = (totalSeconds) => {
    if (!totalSeconds || totalSeconds <= 0) return t("flashOffers.expired");
    const d = Math.floor(totalSeconds / (3600 * 24));
    const h = Math.floor((totalSeconds % (3600 * 24)) / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    return `${d}${t("flashOffers.days")} ${h}${t("flashOffers.hours")} ${m}${t("flashOffers.minutes")} ${s}${t("flashOffers.seconds")}`;
  };

  const handleBuyNow = (offer) => {
    let productType = offer.store_type;
    if (offer.store_type === "apparel") {
      productType = "medical_clothes";
    }

    const checkoutItem = {
      ...offer.item,
      price: offer.original_price,
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

  const getStoreTypeIcon = (storeType) => {
    switch (storeType) {
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

  if (offers.length === 0 && !loading) return null; 

  if (loading) {
    return (
      <div className="w-full h-80 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-3xl mb-10" />
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-3xl shadow-xl shadow-cyan-500/5 mb-10">
      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={0}
        slidesPerView={1}
        loop={offers.length > 1}
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        pagination={{ clickable: true, dynamicBullets: true }}
        className="w-full"
      >
        {offers.map((offer) => {
          const currentRemaining = timeRemaining[offer.id] || 0;

          return (
            <SwiperSlide key={offer.id}>
              <div className="relative h-[30rem] md:h-[24rem] w-full flex items-end">
                {/* Background Banner Image */}
                <img
                  src={offer.banner_image}
                  alt={offer.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-103"
                />
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent"></div>

                {/* Content panel */}
                <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-8 text-white z-10">
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
                  <div className="max-w-3xl mt-auto space-y-4 pb-4">
                    <div className="space-y-2">
                      {/* Store Type Badge with Icon and Background */}
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md border border-white/15 rounded-lg text-xs font-bold uppercase tracking-wider text-primary-400">
                        {getStoreTypeIcon(offer.store_type)}
                        <span>{offer.store_name}</span>
                      </div>
                      
                      <h3 className="text-2xl md:text-3xl font-extrabold line-clamp-2 leading-tight">
                        {offer.title}
                      </h3>
                      {offer.item && (
                        <p className="text-sm md:text-base text-gray-300 font-medium line-clamp-1">
                          {offer.item.name}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-6 pt-1">
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
  );
}
