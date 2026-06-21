import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination as SwiperPagination, Autoplay } from "swiper/modules";
import { FaStar, FaPlay, FaTimes } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useApi } from "../../context/ApiContext";
import { Link } from "react-router-dom";
import "swiper/css";
import "swiper/css/pagination";

const PER_PAGE = 9;

export default function Testimonials() {
  const { t } = useTranslation();
  const { request } = useApi();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [selectedTestimonialForText, setSelectedTestimonialForText] = useState(null);

  const fetchTestimonials = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const response = await request(`testimonial?page=${page}&per_page=${PER_PAGE}`, {
        useCache: false,
      });
      setTestimonials(response.data || []);
      if (response.pagination) {
        setTotalPages(response.pagination.total_pages || 1);
        setCurrentPage(response.pagination.current_page || page);
      } else {
        // Fallback: no pagination in API — just show all
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Failed to fetch testimonials:", err);
      setError(t("testimonials.error"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchTestimonials(page);
    // Scroll to testimonials section
    const el = document.getElementById("testimonials-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const openVideoModal = (videoUrl) => {
    setSelectedVideo(videoUrl);
    setShowVideoModal(true);
  };

  const closeVideoModal = () => {
    setShowVideoModal(false);
    setSelectedVideo(null);
  };

  const openTextModal = (item) => setSelectedTestimonialForText(item);
  const closeTextModal = () => setSelectedTestimonialForText(null);

  if (loading) {
    return (
      <section id="testimonials-section" className="relative w-full transition-colors duration-300">
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
      <section id="testimonials-section" className="relative w-full transition-colors duration-300">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-12 text-3xl font-bold text-center">
            {t("testimonials.title")}
          </h2>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="mb-4 text-red-500">{error}</p>
              <button
                onClick={() => fetchTestimonials(currentPage)}
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
      <section id="testimonials-section" className="relative w-full transition-colors duration-300">
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
    <section id="testimonials-section" className="relative w-full py-16 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-12 text-3xl font-bold text-center">
          {t("testimonials.title")}
        </h2>

        <div className="relative">
          <Swiper
            className="pb-20"
            modules={[SwiperPagination, Autoplay]}
            pagination={{
              clickable: true,
              dynamicBullets: true,
              dynamicMainBullets: 4,
            }}
            autoplay={{ delay: 4000 }}
            spaceBetween={30}
            breakpoints={{
              640: { slidesPerView: 1 },
              1024: { slidesPerView: 3 },
            }}
          >
            {testimonials.map((item) => (
              <SwiperSlide key={item.id} className="h-auto">
                <div className="flex flex-col h-full p-6 mb-10 transition-shadow border shadow-sm bg-surface dark:bg-background rounded-2xl border-border hover:shadow-md">
                  {/* الصورة + البيانات */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="object-cover w-16 h-16 border-2 rounded-full border-primary"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/96x96?text=No+Image";
                          }}
                        />
                      ) : (
                        <div className="flex items-center justify-center w-16 h-16 bg-gray-200 border-2 rounded-full border-primary dark:bg-gray-700">
                          <span className="text-xl font-bold text-primary">
                            {item.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <h3 className="mb-1 text-lg font-semibold">{item.name}</h3>
                      {item.university && (
                        <span className="mb-2 text-xs text-text-muted">
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
                  <div className="flex-grow">
                    <p className="text-sm leading-relaxed text-left text-text-secondary line-clamp-3">
                      {item.description}
                    </p>
                    {item.description && item.description.length > 120 && (
                      <button
                        onClick={() => openTextModal(item)}
                        className="mt-2 text-sm font-medium text-primary hover:underline"
                      >
                        {t("testimonials.read_more", "عرض المزيد")}
                      </button>
                    )}
                  </div>

                  {/* Video Button */}
                  {item.video && item.video.trim() !== "" && (
                    <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-700">
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

        </div>

        <div className="flex justify-center mt-8">
          <Link
            to="/testimonials"
            className="px-8 py-3 text-sm font-semibold text-white transition-all rounded-xl bg-primary hover:shadow-lg hover:bg-primary/90"
          >
            {t("testimonials.view_all", "عرض المزيد")}
          </Link>
        </div>
      </div>

      {/* Video Modal */}
      {showVideoModal && selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
          <div className="relative w-full max-w-4xl p-2 mx-auto bg-white rounded-xl dark:bg-gray-800 shadow-2xl">
            <button
              onClick={closeVideoModal}
              className="absolute z-10 p-2 text-gray-500 top-2 right-2 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-white dark:bg-gray-800 rounded-full shadow-md"
              title={t("testimonials.close_video")}
            >
              <FaTimes className="text-xl" />
            </button>

            <div className="relative w-full rounded-lg overflow-hidden" style={{ paddingBottom: "56.25%" }}>
              <iframe
                src={selectedVideo}
                title="Testimonial Video"
                className="absolute top-0 left-0 w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* Text Modal */}
      {selectedTestimonialForText && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="relative w-full max-w-lg p-6 mx-auto bg-white rounded-2xl dark:bg-gray-800 shadow-xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeTextModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              <FaTimes className="text-xl" />
            </button>
            
            <div className="flex items-center gap-4 mb-6">
              {selectedTestimonialForText.image ? (
                <img
                  src={selectedTestimonialForText.image}
                  alt={selectedTestimonialForText.name}
                  className="w-16 h-16 rounded-full border-2 border-primary object-cover"
                />
              ) : (
                <div className="flex items-center justify-center w-16 h-16 bg-gray-200 border-2 rounded-full border-primary dark:bg-gray-700">
                  <span className="text-xl font-bold text-primary">
                    {selectedTestimonialForText.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold">{selectedTestimonialForText.name}</h3>
                {selectedTestimonialForText.rating && (
                  <div className="flex mt-1">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={i < selectedTestimonialForText.rating ? "text-yellow-400 text-sm" : "text-gray-300 text-sm"}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="prose dark:prose-invert">
              <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300 whitespace-pre-line">
                {selectedTestimonialForText.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
