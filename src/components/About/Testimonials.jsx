import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import { FaStar, FaPlay, FaTimes } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useApi } from "../../context/ApiContext";
import "swiper/css";
import "swiper/css/pagination";

export default function Testimonials() {
  const { t } = useTranslation();
  const { request } = useApi();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        const response = await request("testimonial");
        setTestimonials(response.data || []);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch testimonials:", err);
        setError(t("testimonials.error"));
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, [request, t]);

  const openVideoModal = (videoUrl) => {
    setSelectedVideo(videoUrl);
    setShowVideoModal(true);
  };

  const closeVideoModal = () => {
    setShowVideoModal(false);
    setSelectedVideo(null);
  };

  if (loading) {
    return (
      <section className="relative w-full transition-colors duration-300">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-12 text-3xl font-bold text-center">
            {t("testimonials.title")}
          </h2>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 border-b-2 rounded-full animate-spin border-primary"></div>
              <p className="text-text-muted">{t("testimonials.loading")}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="relative w-full transition-colors duration-300">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-12 text-3xl font-bold text-center">
            {t("testimonials.title")}
          </h2>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="mb-4 text-red-500">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 text-white transition-colors rounded-lg bg-primary hover:bg-primary/90"
              >
                {t("common.retry", "Retry")}
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!testimonials || testimonials.length === 0) {
    return (
      <section className="relative w-full transition-colors duration-300">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-12 text-3xl font-bold text-center">
            {t("testimonials.title")}
          </h2>
          <div className="flex items-center justify-center h-64">
            <p className="text-text-muted">{t("testimonials.no_testimonials")}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full py-10 transition-colors duration-300">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-12 text-3xl font-bold text-center">
          {t("testimonials.title")}
        </h2>

        <Swiper
          modules={[Pagination, Autoplay]}
          pagination={{ clickable: true, el: ".custom-pagination" }}
          autoplay={{ delay: 4000 }}
          spaceBetween={30}
          breakpoints={{
            640: { slidesPerView: 1 },
            1024: { slidesPerView: 3 },
          }}
        >
          {testimonials.map((item) => (
            <SwiperSlide key={item.id}>
              <div className="flex flex-col justify-between h-full p-6 border shadow-lg bg-surface dark:bg-background rounded-2xl border-border min-h-[220px]  ">
                
                {/* الصورة + البيانات */}
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="object-cover w-20 h-20 border-4 rounded-full border-primary"
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/96x96?text=No+Image";
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center w-20 h-20 bg-gray-200 border-4 rounded-full border-primary dark:bg-gray-700">
                        <span className="text-xl font-bold text-primary">
                          {item.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col">
                    <h3 className="mb-1 text-lg font-semibold">{item.name}</h3>
                    {item.university && (
                      <span className="mb-2 text-sm text-text-muted">
                        {item.university}
                      </span>
                    )}

                    {item.rating && (
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={i < item.rating ? "text-yellow-400" : "text-gray-300"}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* الوصف */}
    <p className="mt-4 text-sm leading-relaxed text-left text-text-secondary line-clamp-2">
  {item.description}
</p>


                {/* Video Button */}
                {item.video && item.video.trim() !== "" && (
                  <div className="mt-4">
                    <button
                      onClick={() => openVideoModal(item.video)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-white transition-colors rounded-lg bg-primary hover:bg-primary/90"
                      title={t("testimonials.watch_video")}
                    >
                      <FaPlay className="text-xs" />
                      {t("testimonials.watch_video")}
                    </button>
                  </div>
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        <div className="flex justify-center mt-8 custom-pagination"></div>
      </div>

      {/* Video Modal */}
      {showVideoModal && selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative w-full max-w-4xl p-4 mx-4 bg-white rounded-lg dark:bg-gray-800">
            {/* Close Button */}
            <button
              onClick={closeVideoModal}
              className="absolute z-10 p-2 text-gray-500 top-2 right-2 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title={t("testimonials.close_video")}
            >
              <FaTimes className="text-xl" />
            </button>

            {/* Video Player */}
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              <iframe
                src={selectedVideo}
                title="Testimonial Video"
                className="absolute top-0 left-0 w-full h-full rounded-lg"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
