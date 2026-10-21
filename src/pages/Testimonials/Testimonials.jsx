import React, { useState, useEffect } from "react";
import { FaStar, FaPlay, FaTimes, FaFire, FaBookOpen, FaUserGraduate } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useApi } from "../../context/ApiContext";
import Pagination from "../../components/Common/Pagination";

const PER_PAGE = 12;

// Helper to convert YouTube watch/short URLs or standard URLs to embed format
const getEmbedVideoUrl = (url) => {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!trimmed) return "";

  // Check if it's a YouTube URL
  const ytMatch = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i
  );
  if (ytMatch && ytMatch[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&rel=0`;
  }

  // Check for Vimeo URL
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?([0-9]+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  return trimmed;
};

// Check if string points to a raw video file (mp4, webm, etc.)
const isDirectVideoFile = (url) => {
  if (!url || typeof url !== "string") return false;
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
};

export default function Testimonials() {
  const { t } = useTranslation();
  const { request } = useApi();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedTestimonialForText, setSelectedTestimonialForText] = useState(null);

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

  const openTextModal = (item) => setSelectedTestimonialForText(item);
  const closeTextModal = () => setSelectedTestimonialForText(null);

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
    <section className="py-16 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <div className="px-4 mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-14 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {t("testimonials.all_reviews", "Students Reviews")}
          </h1>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t("testimonials.subtitle", "See what our students are saying about us.")}
          </p>
        </div>

        {testimonials.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">{t("testimonials.no_testimonials", "No testimonials available at the moment.")}</p>
          </div>
        ) : (
          <div>
            {/* Unified 3-column Grid for All Reviews */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {testimonials.map((item) => {
                const isTop = Boolean(item.is_top);
                const hasVideo = Boolean(item.video && item.video.trim() !== "");
                const embedUrl = hasVideo ? getEmbedVideoUrl(item.video) : "";
                const isDirect = hasVideo ? isDirectVideoFile(item.video) : false;

                return (
                  <div
                    key={item.id}
                    className={`relative flex flex-col h-full bg-white dark:bg-gray-800 rounded-2xl transition-all duration-300 hover:-translate-y-1 ${
                      isTop
                        ? "border-2 border-amber-400 dark:border-amber-500 shadow-xl ring-2 ring-amber-400/20"
                        : "border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-xl"
                    }`}
                  >
                    {/* Top Review Badge */}
                    {isTop && (
                      <div className="absolute -top-3.5 right-4 z-10">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-full shadow-md">
                          <FaFire className="text-[11px]" />
                          {t("testimonials.top_badge", "Top Review")}
                        </span>
                      </div>
                    )}

                    {/* Top Video embed if video exists */}
                    {isTop && hasVideo && (
                      <div className="relative w-full aspect-video bg-black rounded-t-2xl overflow-hidden flex-shrink-0">
                        {isDirect ? (
                          <video
                            src={item.video}
                            controls
                            preload="metadata"
                            poster={item.image || undefined}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <iframe
                            src={embedUrl}
                            title={`${item.name} - Testimonial Video`}
                            className="w-full h-full"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            loading="lazy"
                          />
                        )}
                      </div>
                    )}

                    {/* Card Content Area */}
                    <div className="flex flex-col flex-grow p-6">
                      {/* Avatar & Student Info */}
                      <div className="flex items-start gap-4 mb-4">
                        <div className="flex-shrink-0">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className={`object-cover w-14 h-14 rounded-full border-2 ${
                                isTop ? "border-amber-400" : "border-primary"
                              }`}
                              onError={(e) => {
                                e.target.src = "https://via.placeholder.com/64x64?text=Student";
                              }}
                            />
                          ) : (
                            <div
                              className={`flex items-center justify-center w-14 h-14 rounded-full border-2 font-bold text-xl ${
                                isTop
                                  ? "bg-amber-500/10 border-amber-400 text-amber-500"
                                  : "bg-gray-200 border-primary text-primary dark:bg-gray-700"
                              }`}
                            >
                              {item.name?.charAt(0)?.toUpperCase() || "S"}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col min-w-0 flex-1">
                          <h3 className="mb-0.5 text-lg font-bold text-gray-900 dark:text-white truncate">
                            {item.name}
                          </h3>
                          {item.university && (
                            <span className="mb-1 text-xs text-gray-500 dark:text-gray-400 truncate">
                              {item.university}
                            </span>
                          )}

                          {item.rating && (
                            <div className="flex items-center gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <FaStar
                                  key={i}
                                  className={`text-xs ${
                                    i < Number(item.rating)
                                      ? "text-yellow-400 fill-yellow-400"
                                      : "text-gray-300 dark:text-gray-600"
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Description Text */}
                      <div className="flex-grow">
                        <p className="text-sm leading-relaxed text-left text-gray-600 dark:text-gray-300 line-clamp-4">
                          {item.description}
                        </p>
                      </div>

                      {/* Footer Actions (Read More / Video Button) */}
                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between gap-3">
                        {item.description && (
                          <button
                            type="button"
                            onClick={() => openTextModal(item)}
                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                          >
                            <FaBookOpen className="text-xs" />
                            {isTop
                              ? t("testimonials.read_text_review", "Read Full Review")
                              : t("testimonials.read_more", "Read More")}
                          </button>
                        )}

                        {/* Video button for cards without embedded player */}
                        {(!isTop || !hasVideo) && hasVideo && (
                          <button
                            type="button"
                            onClick={() => openVideoModal(item.video)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary/90 transition-colors rounded-lg shadow-sm"
                            title={t("testimonials.watch_video", "Watch Video")}
                          >
                            <FaPlay className="text-[10px]" />
                            {t("testimonials.watch_video", "Watch Video")}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
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
          </div>
        )}
      </div>

      {/* Video Modal (Popup used for standard reviews or direct clicks) */}
      {showVideoModal && selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-4xl p-2 mx-auto bg-white rounded-xl dark:bg-gray-800 shadow-2xl">
            <button
              type="button"
              onClick={closeVideoModal}
              className="absolute z-10 flex items-center justify-center w-8 h-8 text-white bg-red-500 rounded-full shadow-lg -top-3 -right-3 hover:bg-red-600 focus:outline-none"
              title={t("testimonials.close_video", "Close")}
            >
              <FaTimes />
            </button>

            <div className="relative w-full overflow-hidden bg-black rounded-lg aspect-video">
              {isDirectVideoFile(selectedVideo) ? (
                <video src={selectedVideo} controls autoPlay className="w-full h-full object-cover" />
              ) : (
                <iframe
                  src={getEmbedVideoUrl(selectedVideo)}
                  title="Testimonial Video"
                  className="absolute top-0 left-0 w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Full Text Review Modal (Popup) */}
      {selectedTestimonialForText && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-xl p-6 sm:p-8 mx-auto bg-white shadow-2xl rounded-2xl dark:bg-gray-800 max-h-[85vh] flex flex-col">
            <button
              type="button"
              onClick={closeTextModal}
              className="absolute text-gray-400 top-4 right-4 hover:text-gray-900 dark:hover:text-white p-1 rounded-lg transition-colors"
              title={t("common.close", "Close")}
            >
              <FaTimes className="text-xl" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-4 pb-4 border-b border-gray-100 dark:border-gray-700">
              {selectedTestimonialForText.image ? (
                <img
                  src={selectedTestimonialForText.image}
                  alt={selectedTestimonialForText.name}
                  className="object-cover w-16 h-16 border-2 rounded-full border-primary shadow-sm"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/64x64?text=Student";
                  }}
                />
              ) : (
                <div className="flex items-center justify-center w-16 h-16 bg-primary/10 border-2 rounded-full border-primary text-primary font-bold text-xl">
                  {selectedTestimonialForText.name?.charAt(0)?.toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                    {selectedTestimonialForText.name}
                  </h3>
                  {selectedTestimonialForText.is_top && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold text-white bg-amber-500 rounded-full">
                      <FaFire className="text-[9px]" />
                      {t("testimonials.top_badge", "Top Review")}
                    </span>
                  )}
                </div>
                {selectedTestimonialForText.university && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedTestimonialForText.university}
                  </p>
                )}
                {selectedTestimonialForText.rating && (
                  <div className="flex items-center gap-0.5 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={`text-sm ${
                          i < Number(selectedTestimonialForText.rating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300 dark:text-gray-600"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Content - Scrollable Text */}
            <div className="mt-5 overflow-y-auto pr-2 custom-scrollbar flex-grow">
              <p className="text-base leading-relaxed text-gray-700 dark:text-gray-200 whitespace-pre-line text-left">
                {selectedTestimonialForText.description}
              </p>
            </div>

            {/* Modal Footer (with date if present) */}
            {selectedTestimonialForText.created_at && (
              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400 dark:text-gray-500 text-right">
                {selectedTestimonialForText.created_at}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

