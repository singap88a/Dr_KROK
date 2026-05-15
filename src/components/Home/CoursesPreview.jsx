import React, { useEffect, useMemo, useState } from "react";
import { FiClock, FiUsers, FiHeart, FiStar } from "react-icons/fi";
import { FaPlayCircle } from "react-icons/fa";
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
import RatingStars from "../Common/RatingStars";

export default function CoursesPreview({ courses }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { getVideoCourses, getFavorites, toggleFavorite } = useApi();
  const { isLoggedIn } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [apiCourses, setApiCourses] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  useEffect(() => {
    if (courses && courses.length) return;
    let isMounted = true;
    // Only show loading on initial load, not on language changes
    if (!initialLoadDone) {
      setLoading(true);
    }
    setError("");
    getVideoCourses({ per_page: 6, page: 1 })
      .then((res) => {
        if (!isMounted) return;
        setApiCourses(Array.isArray(res.data) ? res.data : []);
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
  }, [courses, getVideoCourses, t, initialLoadDone]);

  // Load favorites to reflect heart state
  useEffect(() => {
    let mounted = true;
    getFavorites()
      .then((res) => {
        if (!mounted) return;
        const favs = (res.data || [])
          .filter((f) => f.type === "video_course")
          .map((f) => `video_course_${f.table_id}`);
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
      const res = await toggleFavorite(courseId, "video_course");
      const favoriteKey = `video_course_${courseId}`;
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

  const list = useMemo(() => {
    const src = courses && courses.length ? courses : apiCourses;
    return src.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      hours: Math.max(1, Math.round((c.duration_minutes || 0) / 60)),
      lessons: c.lessons_count ?? 0,
      instructor: c.instructor || '',
      instructorImg: c.instructor_image || '/user.png',
      price: c.price ? Number(c.price) : 0,
      discount: c.discount ? Number(c.discount) : 0,
      rating: c.avg_rating ?? 0,
      is_bestseller: c.is_bestseller,
      img:
        c.image && typeof c.image === "string" && c.image.length > 0
          ? c.image
          : "/logo.png",
    }));
  }, [courses, apiCourses, t]);

  return (
    <section className="relative w-full py-10 bg-gradient-to-r from-[#e0f9fa] via-white to-[#e0f9fa] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="px-4 mx-auto max-w-7xl">
        <h2 className="mb-10 text-3xl font-bold tracking-tight text-center md:text-4xl">
          {t("courses.featuredVideoCourses", "Featured Video Courses")}
        </h2>

        {loading && <LoadingSpinner />}
        {!!error && (
          <div className="py-4 mb-6 text-center text-red-600">
            {t("common.error", "Error")}: {error}
          </div>
        )}

        <Swiper
          modules={[Pagination, Autoplay]}
          spaceBetween={24}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1200: { slidesPerView: 3 },
          }}
          pagination={{
            clickable: true,
            dynamicBullets: true,
            dynamicMainBullets: 4
          }}
          autoplay={{ delay: 4000, disableOnInteraction: false }}
          loop={true}
          grabCursor={true}
          style={{ paddingBottom: "40px" }}
        >
          {list.map((course) => {
            const hasDiscount = course.discount && course.discount > 0;
            const finalPrice = hasDiscount
              ? (course.price - (course.price * course.discount / 100)).toFixed(2)
              : course.price.toFixed(2);
            const discountPercent = hasDiscount
              ? Math.round(course.discount)
              : 0;
            return (
              <SwiperSlide key={course.id}>
                <div className="relative flex flex-col overflow-hidden transition-all duration-300 bg-white border border-gray-200 cursor-pointer rounded-2xl dark:bg-gray-800 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1 group">
                  <Link
                    to={`/courses/${course.id}`}
                    style={{ textDecoration: "none" }}
                    className="block"
                  >
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={course.img}
                        alt={course.title}
                        className="w-full h-full transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        width="400"
                        height="256"
                      />
              
                      <button
                        aria-label={favoriteIds.includes(`video_course_${course.id}`) ? t("favorites.remove", "Remove from favorites") : t("favorites.add", "Add to favorites")}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onToggleFavorite(course.id);
                        }}
                        className="absolute z-10 p-2 transition-all duration-200 bg-white rounded-full shadow top-3 right-3 hover:bg-white/90"
                      >
                        <FiHeart aria-hidden="true" className={`text-xl ${favoriteIds.includes(`video_course_${course.id}`) ? "text-red-500 fill-red-500" : "text-gray-500"}`} />
                      </button>
                      {hasDiscount && (
                        <span className="absolute px-2 py-1 text-xs font-bold text-white bg-red-600 rounded shadow top-3 left-3">
                          {discountPercent}%
                        </span>
                      )}
                      
                      {course.is_bestseller && (
                        <span className="absolute flex items-center gap-1 px-2 py-1 text-xs font-bold text-white bg-yellow-500 rounded shadow bottom-3 right-3">
                          <FiStar className="text-xs" /> {t("courses.bestseller", "Bestseller")}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col flex-1 px-6 pt-6">
                      <h3 className="mb-2 text-lg font-bold text-primary line-clamp-1">{course.title}</h3>
                      <div 
                        className="flex-1 mb-3 text-sm text-gray-600 dark:text-gray-300 line-clamp-3"
                        dangerouslySetInnerHTML={{ __html: course.description }}
                      />
                      <div className="mb-3 space-y-2 text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <img
                              src={course.instructorImg}
                              alt={course.instructor || "Instructor"}
                              className="w-8 h-8 rounded-full"
                              width="32"
                              height="32"
                              loading="lazy"
                            />
                            <span>{course.instructor}</span>
                          </div>
                          <span>{course.lessons} {t("courses.lessons")}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <RatingStars value={course.rating} size={12} />
                            <span>{course.rating.toFixed(1)}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-xl font-bold text-primary">₴{finalPrice}</span>
                            {hasDiscount && (
                              <span className="ml-2 text-sm text-gray-400 line-through">₴{course.price.toFixed(2)}</span>
                            )}
                          </div>
                        </div>
                      </div>
            
                    </div>
                  </Link>
                  <div className="px-6 pb-4">
                    <Link
                      to={`/courses/${course.id}`}
                      className="block w-full px-4 py-2 text-sm font-medium text-center text-white rounded-xl bg-primary hover:shadow-md hover:brightness-110"
                      aria-label={`${t("courses.details", "Details")} - ${course.title}`}
                    >
                      {t("courses.details", "تفاصيل")}
                    </Link>
                  </div>
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>

        <div className="mt-10 text-center">
          <Link
            to="/courses"
            className="inline-block px-8 py-3 font-medium text-white transition shadow rounded-xl bg-primary hover:shadow-xl"
          >
            {t("courses.browseCourses", "Browse Courses")}
          </Link>
        </div>
      </div>
    </section>
  );
}
