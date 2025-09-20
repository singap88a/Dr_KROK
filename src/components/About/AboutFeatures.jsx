import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import {
  FiPlayCircle,
  FiUsers,
  FiBookOpen,
} from "react-icons/fi";
import "swiper/css";
import "swiper/css/pagination";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApi } from "../../context/ApiContext";

export default function AboutFeatures({ features }) {
  const { t, i18n } = useTranslation();
  const { getSettings } = useApi();

  const [isDark, ] = useState(() => {
    if (typeof window === "undefined") return false;
    return document.documentElement.classList.contains("dark");
  });

  const [featuresData, setFeaturesData] = useState({
    videoCourses: "",
    liveCourses: "",
    books: ""
  });
  const [settingsLoading, setSettingsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setSettingsLoading(true);
        const response = await getSettings();
        if (response && response.data) {
          setFeaturesData({
            videoCourses: response.data.description_features_videos_course || "",
            liveCourses: response.data.description_features_live_courses || "",
            books: response.data.description_features_books || ""
          });
        }
      } catch (error) {
        console.error("Failed to fetch features settings:", error);
      } finally {
        setSettingsLoading(false);
      }
    };

    fetchSettings();
  }, [getSettings, i18n.language]);

  useEffect(() => {
    if (isDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [isDark]);

  const defaultFeatures = [
    {
      id: 1,
      title: t('features.videoCourses.title'),
      description: featuresData.videoCourses || t('features.videoCourses.description'),
      icon: <FiPlayCircle size={24} className="shrink-0" />,
    },
    {
      id: 2,
      title: t('features.liveCourses.title'),
      description: featuresData.liveCourses || t('features.liveCourses.description'),
      icon: <FiUsers size={24} className="shrink-0" />,
    },
    {
      id: 3,
      title: t('features.books.title'),
      description: featuresData.books || t('features.books.description'),
      icon: <FiBookOpen size={24} className="shrink-0" />,
    },
  ];

  const list = features && features.length ? features : defaultFeatures;

  return (
    <section className="relative w-full transition-colors duration-300 bg-gradient-to-r ">
      <div className="px-4">
        <div className="py-10 mx-auto max-w-7xl">
          {/* Title & Toggle */}
          <div className="flex flex-col items-center justify-between gap-6 mb-10 md:flex-row">
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                {t('features.title')}
              </h2>
              <p className="max-w-lg mt-2 text-base text-text-secondary">
                {t('features.subtitle')}
              </p>
            </div>
          </div>

          {/* Swiper Section */}
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={24}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 1 },
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            autoplay={{ delay: 2500, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            className="pb-12"
          >
            {list.map((item) => (
              <SwiperSlide key={item.id}>
                <article className="flex flex-col justify-between h-full min-h-[28px] p-6 transition-all duration-300 border group rounded-2xl bg-surface border-border hover:shadow-xl hover:-translate-y-1">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center p-4 transition-transform duration-200 rounded-xl bg-accent text-primary group-hover:scale-105">
                      {item.icon ?? <FiBookOpen size={24} />}
                    </div>

                    <div className="flex-1">
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                        {settingsLoading && !item.description ? (
                          <div className="space-y-2">
                            <div className="h-3 bg-gray-300 rounded animate-pulse"></div>
                            <div className="w-5/6 h-3 bg-gray-300 rounded animate-pulse"></div>
                            <div className="w-4/6 h-3 bg-gray-300 rounded animate-pulse"></div>
                          </div>
                        ) : (
                          item.description
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-6">
                    <Link to="/about">
                      <button className="px-4 py-2 text-sm transition border rounded-full border-border bg-primary/5 text-primary hover:bg-primary hover:text-white">
                        {t('features.learnMore')}
                      </button>
                    </Link>
                  </div>
                </article>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
