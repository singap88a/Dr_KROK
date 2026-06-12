import React, { useState, useEffect } from "react";
import { FaStar, FaPlay, FaTimes } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useApi } from "../../context/ApiContext";
import Pagination from "../../components/Common/Pagination";

const PER_PAGE = 12;

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
        setTotalPages(1);
      }
    } catch (err) {
      console.error("Failed to fetch testimonials:", err);
      setError(t("testimonials.error", "Error loading testimonials"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestimonials(1);
    // window.scrollTo(0, 0);
  }, []);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchTestimonials(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openVideoModal = (videoUrl) => {
    setSelectedVideo(videoUrl);
    setShowVideoModal(true);
  };

  const closeVideoModal = () => {
    setShowVideoModal(false);
    setSelectedVideo(null);
  };

  if (loading && testimonials.length === 0) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 border-b-2 rounded-full animate-spin border-primary"></div>
          <p className="text-gray-500">{t("testimonials.loading", "Loading...")}</p>
        </div>
      </section>
    );
  }

  if (error && testimonials.length === 0) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4 text-red-500">{error}</p>
          <button
            onClick={() => fetchTestimonials(currentPage)}
            className="px-4 py-2 text-white transition-colors rounded-lg bg-primary hover:bg-primary/90"
          >
            {t("common.retry", "Retry")}
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="px-4 mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            {t("testimonials.all_reviews", "Customer Reviews")}
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            {t("testimonials.subtitle", "See what our students are saying about us.")}
          </p>
        </div>

        {testimonials.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">{t("testimonials.no_testimonials", "No testimonials available at the moment.")}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((item) => (
                <div key={item.id} className="flex flex-col justify-between h-full p-6 transition-transform duration-300 bg-white border border-gray-200 shadow-lg dark:bg-gray-800 rounded-2xl dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 min-h-[242px]">
                  {/* Avatar & Info */}
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="object-cover w-16 h-16 border-2 rounded-full border-primary"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/64x64?text=No+Image";
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
                      <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">{item.name}</h3>
                      {item.university && (
                        <span className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                          {item.university}
                        </span>
                      )}

                      {item.rating && (
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={i < item.rating ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="mt-4 text-sm leading-relaxed text-left text-gray-600 dark:text-gray-300 line-clamp-4">
                    {item.description}
                  </p>

                  {/* Video Button */}
                  {item.video && item.video.trim() !== "" && (
                    <div className="mt-4">
                      <button
                        onClick={() => openVideoModal(item.video)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-white transition-colors rounded-lg bg-primary hover:bg-primary/90"
                        title={t("testimonials.watch_video", "Watch Video")}
                      >
                        <FaPlay className="text-xs" />
                        {t("testimonials.watch_video", "Watch Video")}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-12">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                loading={loading}
              />
            </div>
          </>
        )}
      </div>

      {/* Video Modal */}
      {showVideoModal && selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl p-2 mx-auto bg-white rounded-xl dark:bg-gray-800">
            <button
              onClick={closeVideoModal}
              className="absolute z-10 flex items-center justify-center w-8 h-8 text-white bg-red-500 rounded-full shadow-lg -top-3 -right-3 hover:bg-red-600 focus:outline-none"
              title={t("testimonials.close_video", "Close")}
            >
              <FaTimes />
            </button>

            <div className="relative w-full overflow-hidden bg-black rounded-lg aspect-video">
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
    </section>
  );
}
