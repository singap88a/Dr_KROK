import React, { useEffect, useState, useRef } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { HiMoon, HiSun } from "react-icons/hi";
import {
  Swiper,
  SwiperSlide
} from "swiper/react";
import { Autoplay, Navigation, Pagination, Keyboard, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";
import { useTranslation } from "react-i18next";
import { useApi } from "../../context/ApiContext";

/**
 * HomeBanners.jsx
 * - جلب من https://dr-krok.hudurly.com/api/banner
 * - عرض كل بنر في Swiper
 * - dark / light mode toggle باستخدام .dark class
 * - فتح الفيديو في modal (iframe) عند الضغط على Watch/Play
 * - تعديل: استبدال زر الفيديو بزر تفاصيل مع عرض الوصف في بوبب
 */

export default function HomeBanners() {
  const { t, i18n } = useTranslation();
  const { request } = useApi();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openPopup, setOpenPopup] = useState(null);
  const swiperRef = useRef(null);

  useEffect(() => {
    // fetch banners using ApiContext to include Accept-Language header
    const fetchBanners = async () => {
      try {
        const data = await request('banner');
        if (data.success && Array.isArray(data.data)) {
          setBanners(data.data);
        } else {
          setBanners([]);
        }
      } catch (err) {
        console.error("Failed to fetch banners:", err);
        setBanners([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, [request, i18n.language]);

  // Stop swiper autoplay and open popup with description
  const handleDetailsClick = (banner) => {
    if (swiperRef.current && swiperRef.current.autoplay) {
      swiperRef.current.autoplay.stop();
    }
    setOpenPopup(banner);
  };

  // Close popup and resume swiper autoplay
  const closePopup = () => {
    setOpenPopup(null);
    if (swiperRef.current && swiperRef.current.autoplay) {
      swiperRef.current.autoplay.start();
    }
  };

  return (
    <section className="relative w-full transition-colors duration-300 bg-gradient-to-r from-[#e0f9fa] via-white to-[#e0f9fa] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container px-4 mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold md:text-3xl">{t('homeBanners.title')}</h2>
 
          </div>
        </div>

        {/* Swiper */}
        <div className="relative">
          <Swiper
            onSwiper={(swiper) => (swiperRef.current = swiper)}
            modules={[Autoplay, Navigation, Pagination, Keyboard, EffectFade]}
            spaceBetween={20}
            slidesPerView={1}
            loop={true}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            navigation={{
              nextEl: ".banner-next",
              prevEl: ".banner-prev",
            }}
            pagination={{ clickable: true }}
            keyboard={{ enabled: true }}
            effect="fade"
            a11y={{ enabled: true }}
            className="overflow-hidden rounded-2xl"
          >
            {loading ? (
              <SwiperSlide key="loading">
                <div className="flex items-center justify-center h-64 md:h-96 bg-accent rounded-2xl">
                  <div className="text-center">
                    <div className="w-12 h-12 mb-4 ease-linear border-4 border-t-4 rounded-full loader border-primary animate-spin"></div>
                    <p className="text-text-secondary">{t('homeBanners.loading')}</p>
                  </div>
                </div>
              </SwiperSlide>
            ) : banners.length === 0 ? (
              <SwiperSlide key="empty">
                <div className="flex items-center justify-center h-64 md:h-96 bg-accent rounded-2xl">
                  <p className="text-text-secondary">{t('homeBanners.noBanners')}</p>
                </div>
              </SwiperSlide>
            ) : (
              banners.map((b) => (
                <SwiperSlide key={b.id}>
                  <div className="relative h-64 overflow-hidden md:h-80 lg:h-96 rounded-2xl">
                    {/* Background image */}
                    <img
                      src={b.image}
                      alt={b.description || `Banner ${b.id}`}
                      className="object-cover w-full h-full transition-transform duration-700 scale-100 hover:scale-105"
                      loading="lazy"
                    />

                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-black/10 dark:from-black/50 dark:to-black/20"></div>

                    {/* Content box */}
                    <div className="absolute inset-0 flex items-center justify-center px-6">
                      <div className="max-w-4xl mx-auto text-center text-white">
                        <div className="p-4 border bg-black/30 dark:bg-black/40 backdrop-blur-sm rounded-2xl md:p-6 border-white/10">
                          <h3 className="mb-3 text-lg font-semibold md:text-xl">
                            {b.description?.split(".")[0] || `Banner #${b.id}`}
                          </h3>

                          {/* Remove description from here */}
                          {/* <p className="mb-5 text-sm md:text-base text-white/90 line-clamp-4">
                            {b.description}
                          </p> */}

                          <div className="flex items-center justify-center gap-3">
                            <a
                              href={b.link}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-2 text-sm transition border rounded-lg border-border bg-surface/80 hover:bg-primary hover:text-white"
                            >
                              {t('homeBanners.openLink')}
                            </a>

                            <button
                              onClick={() => handleDetailsClick(b)}
                              className="inline-flex items-center gap-2 px-3 py-2 text-sm text-white transition rounded-lg bg-primary hover:shadow-lg"
                              aria-label={`Details banner ${b.id}`}
                            >
                              {t('homeBanners.details')}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))
            )}
          </Swiper>

          {/* Navigation buttons */}
          <button
            className="absolute z-20 p-2 -translate-y-1/2 border rounded-md banner-prev left-3 top-1/2 bg-surface border-border hover:shadow-md"
            aria-label={t('homeBanners.previousBanner')}
          >
            <FiChevronLeft className="w-6 h-6" />
          </button>
          <button
            className="absolute z-20 p-2 -translate-y-1/2 border rounded-md banner-next right-3 top-1/2 bg-surface border-border hover:shadow-md"
            aria-label={t('homeBanners.nextBanner')}
          >
            <FiChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Details Popup */}
      {openPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-4xl p-6 bg-background rounded-xl">
            <button
              onClick={closePopup}
              className="absolute p-2 border rounded-full shadow-lg -top-4 -right-4 bg-surface border-border"
              aria-label={t('homeBanners.closeDetails')}
            >
              ✕
            </button>
            <h3 className="mb-4 text-xl font-semibold">{openPopup.description?.split(".")[0]}</h3>
            <p className="text-base">{openPopup.description}</p>
          </div>
        </div>
      )}

      {/* tiny loader style for demo */}
      <style>{`
        .loader { border-top-color: rgba(8,145,178,1); }
        .line-clamp-4 { display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }
      `}</style>
    </section>
  );
}
