import React, { useEffect, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { HiMoon, HiSun } from "react-icons/hi";
import { FaPlay } from "react-icons/fa";
import {
  Swiper,
  SwiperSlide
} from "swiper/react";
import { Autoplay, Navigation, Pagination, Keyboard, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

/**
 * HomeBanners.jsx
 * - جلب من https://dr-krok.hudurly.com/api/banner
 * - عرض كل بنر في Swiper
 * - dark / light mode toggle باستخدام .dark class
 * - فتح الفيديو في modal (iframe) عند الضغط على Watch/Play
 */

export default function HomeBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(
    typeof window !== "undefined" && document.documentElement.classList.contains("dark")
      ? "dark"
      : "light"
  );
  const [openVideoUrl, setOpenVideoUrl] = useState(null);

  useEffect(() => {
    // fetch banners
    const fetchBanners = async () => {
      try {
        const res = await fetch("https://dr-krok.hudurly.com/api/banner");
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setBanners(json.data);
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
  }, []);

  // toggle dark class on <html> (compatible with tailwind 'class' darkMode)
  const toggleTheme = () => {
    const root = document.documentElement;
    if (root.classList.contains("dark")) {
      root.classList.remove("dark");
      setTheme("light");
    } else {
      root.classList.add("dark");
      setTheme("dark");
    }
  };

  // Map a youtube/watch?v=.. or playlist to embed url
  const toEmbedUrl = (rawUrl) => {
    if (!rawUrl) return null;
    try {
      const url = new URL(rawUrl);
      // playlist
      if (url.searchParams.get("list")) {
        const list = url.searchParams.get("list");
        return `https://www.youtube.com/embed/videoseries?list=${list}`;
      }
      // watch?v=
      if (url.searchParams.get("v")) {
        return `https://www.youtube.com/embed/${url.searchParams.get("v")}`;
      }
      // short youtu.be/ID
      if (url.hostname.includes("youtu.be")) {
        const id = url.pathname.slice(1);
        return `https://www.youtube.com/embed/${id}`;
      }
      // fallback: return raw if it's already an embed or other video host
      return rawUrl;
    } catch (e) {
      // not a URL -> return raw
      return rawUrl;
    }
  };

  return (
    <section className="relative w-full transition-colors duration-300 bg-gradient-to-r from-[#e0f9fa] via-white to-[#e0f9fa] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container px-4 mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold md:text-3xl">Our Courses & Topics</h2>
            <p className="max-w-xl mt-1 text-text-secondary">
              Curated playlists and video resources — swipe to explore. Responsive, accessible and optimized for both light & dark themes.
            </p>
          </div>

 
        </div>

        {/* Swiper */}
        <div className="relative">
      <Swiper
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
                    <p className="text-text-secondary">Loading banners...</p>
                  </div>
                </div>
              </SwiperSlide>
            ) : banners.length === 0 ? (
              <SwiperSlide key="empty">
                <div className="flex items-center justify-center h-64 md:h-96 bg-accent rounded-2xl">
                  <p className="text-text-secondary">No banners available.</p>
                </div>
              </SwiperSlide>
            ) : (
              banners.map((b) => {
                const embed = toEmbedUrl(b.link);
                return (
                  <SwiperSlide key={b.id}>
                    <div className="relative h-72 md:h-96 lg:h-[520px] rounded-2xl overflow-hidden">
                      {/* Background image */}
                      <img
                        src={b.image}
                        alt={b.description || `Banner ${b.id}`}
                        className="object-cover w-full h-full transition-transform duration-700 scale-100 hover:scale-105"
                        loading="lazy"
                      />

                      {/* Dark gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-black/50 to-black/20 dark:from-black/60 dark:to-black/30"></div>

                      {/* Content box */}
                      <div className="absolute inset-0 flex items-center justify-center px-6">
                        <div className="max-w-4xl mx-auto text-center text-white">
                          <div className="p-6 border bg-black/30 dark:bg-black/40 backdrop-blur-sm rounded-2xl md:p-10 border-white/10">
                            <h3 className="mb-3 text-xl font-semibold md:text-2xl">
                              {/** show short title extracted from description or fallback */}
                              {b.description?.split(".")[0] || `Banner #${b.id}`}
                            </h3>
                            <p className="mb-5 text-sm md:text-base text-white/90 line-clamp-4">
                              {b.description}
                            </p>

                            <div className="flex items-center justify-center gap-3">
                              <a
                                href={b.link}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 transition border rounded-lg border-border bg-surface/80 hover:bg-primary hover:text-white"
                              >
                                Open Link
                              </a>

                              <button
                                onClick={() => setOpenVideoUrl(embed)}
                                className="inline-flex items-center gap-2 px-4 py-2 text-white transition rounded-lg bg-primary hover:shadow-lg"
                                aria-label={`Play banner ${b.id}`}
                              >
                                <FaPlay className="w-4 h-4" />
                                Watch
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                );
              })
            )}
          </Swiper>

          {/* Navigation buttons */}
          <button
            className="absolute z-20 p-2 -translate-y-1/2 border rounded-md banner-prev left-3 top-1/2 bg-surface border-border hover:shadow-md"
            aria-label="Previous banner"
          >
            <FiChevronLeft className="w-6 h-6" />
          </button>
          <button
            className="absolute z-20 p-2 -translate-y-1/2 border rounded-md banner-next right-3 top-1/2 bg-surface border-border hover:shadow-md"
            aria-label="Next banner"
          >
            <FiChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Video Modal */}
      {openVideoUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
          role="dialog"
          aria-modal="true"
        >
          <div className="relative w-full max-w-4xl bg-transparent rounded-xl">
            <button
              onClick={() => setOpenVideoUrl(null)}
              className="absolute p-2 border rounded-full shadow-lg -top-4 -right-4 bg-surface border-border"
              aria-label="Close video"
            >
              ✕
            </button>

            <div className="w-full overflow-hidden rounded-lg aspect-video">
              <iframe
                src={openVideoUrl}
                title="Video Player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>
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
