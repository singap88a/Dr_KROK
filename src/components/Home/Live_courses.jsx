import React, { useEffect, useMemo, useState } from "react";
import he from "he";
import { FiHeart, FiCalendar, FiClock, FiUsers, FiPlay, FiStar } from "react-icons/fi";
import { MdLiveTv } from "react-icons/md";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

import { Link, useNavigate } from "react-router-dom";
import { useApi } from "../../context/ApiContext";
import { useTranslation } from "react-i18next";
import { useUser } from "../../context/UserContext";
import { toast } from "react-toastify";
import LoadingSpinner from "../Common/LoadingSpinner";

export default function Live_courses({ courses }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { getLiveCourses, getFavorites, toggleFavorite } = useApi();
  const { isLoggedIn } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [apiCourses, setApiCourses] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  useEffect(() => {
    if (courses && courses.length) return;
    let isMounted = true;
    if (!initialLoadDone) {
      setLoading(true);
    }
    setError("");
    getLiveCourses({ per_page: 10, page: 1 })
      .then((res) => {
        if (!isMounted) return;
        const decoded = (Array.isArray(res.data) ? res.data : []).map(c => ({
          ...c,
          description: c.description ? he.decode(c.description) : ""
        }));
        setApiCourses(decoded);
        setInitialLoadDone(true);
      })
      .catch((e) => {
        if (!isMounted) return;
        setError(e?.message || "Failed to load courses");
      })
      .finally(() => {
        if (!isMounted) return;
        setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [courses, getLiveCourses, t, initialLoadDone]);

  // Load favorites to reflect heart state
  useEffect(() => {
    let mounted = true;
    getFavorites()
      .then((res) => {
        if (!mounted) return;
        const favs = (res.data || [])
          .filter((f) => f.type === "live_course")
          .map((f) => `live_course_${f.table_id}`);
        setFavoriteIds(favs);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [getFavorites]);

  const onToggleFavorite = async (courseId) => {
    if (!isLoggedIn) {
      toast.info(t("auth.login_required", "Please login to use favorites"));
      navigate("/login", { state: { from: window.location.pathname } });
      return;
    }
    try {
      const res = await toggleFavorite(courseId, "live_course");
      const favoriteKey = `live_course_${courseId}`;
      setFavoriteIds((prev) =>
        res.message === "Added to favorites"
          ? [...new Set([...prev, favoriteKey])]
          : prev.filter((key) => key !== favoriteKey)
      );
      toast.success(res.message);
    } catch {
      toast.error(t("favorites.failedToRemove", "Failed to remove from favorites"));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTimeStatus = (dateString) => {
    const now = new Date();
    const courseDate = new Date(dateString);
    const diffTime = courseDate.getTime() - now.getTime();
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));

    if (diffHours < 0) return { status: 'ended', text: 'ENDED', color: 'bg-gray-500' };
    if (diffHours <= 24) return { status: 'liveToday', text: 'LIVE TODAY', color: 'bg-red-500' };
    if (diffHours <= 168) return { status: 'comingSoon', text: 'COMING SOON', color: 'bg-orange-500' };
    return { status: 'upcoming', text: 'UPCOMING', color: 'bg-blue-500' };
  };

  const list = useMemo(() => {
    const src = courses && courses.length ? courses : apiCourses;
    return src.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      category: c.category,
      level: c.level,
      language: c.language,
      started_at: c.started_at,
      college_year: c.college_year,
      price: c.price ? Number(c.price) : 0,
      discount: c.discount ? Number(c.discount) : 0,
      rating: c.avg_rating ?? 0,
      is_bestseller: c.is_bestseller,
      img:
        c.image && typeof c.image === "string" && c.image.length > 0
          ? c.image
          : "/logo.png",
    }));
  }, [courses, apiCourses]);

  return (
    <section className="relative w-full py-16 bg-gradient-to-r from-[#e0f9fa] via-white to-[#e0f9fa] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="px-4 mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <h2 className="mb-10 text-3xl font-bold tracking-tight text-center md:text-4xl">
            {t("courses.featuredLiveCourses", "Featured Live Courses")}
          </h2>
        </div>

        {loading && <LoadingSpinner />}
        {!!error && (
          <div className="py-4 mb-6 text-center text-red-600">
            {t("common.error", "Error")}: {error}
          </div>
        )}

        <Swiper
          modules={[Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          pagination={{
            clickable: true,
            dynamicBullets: true,
            dynamicMainBullets: 4
          }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          loop={true}
          grabCursor={true}
          style={{ paddingBottom: "50px" }}
        >
          {list.map((course) => {
            const hasDiscount = course.discount && course.discount > 0;
            const finalPrice = hasDiscount
              ? (course.price - course.discount).toFixed(2)
              : course.price.toFixed(2);
            // const discountPercent = hasDiscount
            //   ? Math.round((course.discount / course.price) * 100)
            //   : 0;
            
            const timeStatus = getTimeStatus(course.started_at);
            const isUpcoming = new Date(course.started_at) > new Date();

            return (
              <SwiperSlide key={course.id} className="!h-auto">
                <div className="relative h-full cursor-pointer group">
                  {/* Main Card */}
                  <div className="relative flex flex-col h-full overflow-hidden transition-all duration-300 bg-white border border-gray-200 shadow-lg dark:bg-gray-800 rounded-2xl hover:shadow-xl dark:border-gray-700 group-hover:-translate-y-2">
                    
                    {/* Image Section */}
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={course.img}
                        alt={course.title}
                        className="  w-full h-full transition-transform duration-500 group-hover:scale-105"
                      />
                      
                      {/* Live Badge - Top Left */}
<div className="absolute z-10 top-4 left-4">
  <div className="flex items-center gap-1 px-3 py-1 text-white rounded-full shadow-lg bg-gradient-to-r from-[#E11D48] to-[#F97316]">
    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
    <span className="text-xs font-bold">{t("liveCourses.live", "LIVE")}</span>
  </div>
</div>

                      {/* Discount Badge - Top Right */}
                      {/* {hasDiscount && (
                        <div className="absolute z-10 top-4 right-4">
                          <div className="px-3 py-1 text-sm font-bold text-white bg-red-600 rounded-full shadow-lg">
                            {discountPercent}% 
                          </div>
                        </div>
                      )} */}
                                      {/* Favorite Button */}
                    <button
                      aria-label="toggle favorite"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onToggleFavorite(course.id);
                      }}
                      className="absolute z-20 p-2 transition-all duration-300 bg-white rounded-full shadow-lg top-2 right-4 hover:bg-white/90"
                    >
                      <FiHeart className={`text-lg ${favoriteIds.includes(`live_course_${course.id}`) ? "text-red-500 fill-red-500" : "text-gray-500"}`} />
                    </button>
                      {/* Time Status Badge - Bottom */}
                      <div className="absolute z-10 bottom-4 left-4 flex flex-col gap-2">
                        <div className={`px-3 py-1 w-max text-xs font-semibold text-white rounded-full shadow-lg ${timeStatus.color}`}>
                          {t(`liveCourses.${timeStatus.status}`, timeStatus.text)}
                        </div>
                        {course.is_bestseller && (
                          <div className="flex w-max items-center gap-1 px-2 py-1 text-xs font-bold text-white bg-yellow-500 rounded-full shadow-lg">
                            <FiStar /> {t("courses.bestseller", "Bestseller")}
                          </div>
                        )}
                      </div>

                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                    
    
                    
                    {/* Content Section */}
                    <div className="flex flex-col flex-grow p-6">
                      {/* Course Meta */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-1 text-xs font-medium rounded text-primary bg-blue-50 dark:bg-blue-900/30">
                          {course.category}
                        </span>
                        <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded dark:bg-gray-700 dark:text-gray-300">
                          {course.level}
                        </span>
                      </div>
                      
                      {/* Title */}
                      <h3 className="mb-3 text-lg font-bold text-gray-900 dark:text-white line-clamp-2">
                        {course.title}
                      </h3>
                      
                      {/* Description */}
                      <div 
                        className="mb-4 text-sm text-gray-600 dark:text-gray-300 line-clamp-2 prose prose-sm dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: course.description }}
                      />
                      
                      {/* Live Session Info */}
                      <div className="p-3 mb-4 mt-auto border border-blue-100 rounded-lg bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <FiCalendar className="text-primary" />
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {formatDate(course.started_at)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <FiClock className="text-primary" />
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {formatTime(course.started_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
      
                      
                      {/* Price & CTA Section */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-600">
                        <div className="flex items-center gap-2">
                          <span className="text-xl font-bold text-primary">
                            ₴{finalPrice}
                          </span>
                          {hasDiscount && (
                            <span className="text-sm text-gray-400 line-through">
                              ₴{course.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                        
                        <Link
                          to={`/live-courses/${course.id}`}
                          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-all duration-200 rounded-xl bg-primary hover:shadow-md hover:brightness-110"
                        >
                          <FiPlay className="text-sm" />
                          {isUpcoming ? t("liveCourses.joinLive", "Join Live") : t("liveCourses.viewDetails", "View Details")}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>

        {/* View All Button */}
        <div className="mt-12 text-center">
          <Link
            to="/live-courses"
            className="inline-flex items-center gap-2 px-8 py-3 font-medium text-white transition shadow rounded-xl bg-primary hover:shadow-xl"
          >
            <MdLiveTv className="text-lg" />
            {t("courses.browseAllLive", "Browse All Live Courses")}
          </Link>
        </div>
      </div>
    </section>
  );
}