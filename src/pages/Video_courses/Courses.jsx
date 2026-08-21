// CoursesPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  FaPlayCircle,
  FaVideo,
  FaStar,
} from "react-icons/fa";
import { useApi } from "../../context/ApiContext";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUser } from "../../context/UserContext";
import { toast } from "react-toastify";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import Pagination from "../../components/Common/Pagination";
import VideoCourses from "./VideoCourses";
import LiveCourses from "../Live_courses/LiveCourses";
import SEO from "../../components/SEO/SEO";

const PER_PAGE = 12;

export default function Courses() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { getVideoCourses, getLiveCourses, getFavorites, toggleFavorite } = useApi();
  const { isLoggedIn } = useUser();
  const [activeTab, setActiveTab] = useState("video"); // video | live
  const [query, setQuery] = useState("");
  const [showBestsellers, setShowBestsellers] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [videoCourses, setVideoCourses] = useState([]);
  const [liveCourses, setLiveCourses] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);

  // Pagination state — separate for each tab
  const [videoPage, setVideoPage] = useState(1);
  const [videoTotalPages, setVideoTotalPages] = useState(1);
  const [livePage, setLivePage] = useState(1);
  const [liveTotalPages, setLiveTotalPages] = useState(1);

  const fetchVideo = async (page = 1) => {
    let mounted = true;
    setLoading(true);
    setError("");
    try {
      const res = await getVideoCourses({ page, per_page: PER_PAGE });
      if (!mounted) return;
      const mapped = (res.data || []).map((c) => ({
        id: c.id,
        slug: c.slug,
        type: "video",
        title: c.title,
        description: c.description,
        instructor: c.instructor?.name || c.instructor || "",
        instructorImg: c.instructor_image || "/user.png",
        hours: Math.max(1, Math.round((c.duration_minutes || 0) / 60)),
        lessons: c.lessons_count ?? 0,
        rating: c.avg_rating ?? 0,
        is_bestseller: c.is_bestseller,
        price: c.price ? Number(c.price) : 0,
        discount: c.discount ? Number(c.discount) : 0,
        img:
          c.image && typeof c.image === "string" && c.image.length > 0
            ? c.image
            : "/logo.png",
      }));
      setVideoCourses(mapped);
      if (res.pagination) {
        setVideoTotalPages(res.pagination.total_pages || 1);
        setVideoPage(res.pagination.current_page || page);
      }
    } catch (err) {
      setError(err?.message || "Failed to load courses");
    } finally {
      if (mounted) setLoading(false);
    }
  };

  const fetchLive = async (page = 1) => {
    let mounted = true;
    setLoading(true);
    setError("");
    try {
      const res = await getLiveCourses({ page, per_page: PER_PAGE });
      if (!mounted) return;
      const mapped = (res.data || []).map((c) => ({
        id: c.id,
        slug: c.slug,
        type: "live",
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
      setLiveCourses(mapped);
      if (res.pagination) {
        setLiveTotalPages(res.pagination.total_pages || 1);
        setLivePage(res.pagination.current_page || page);
      }
    } catch (err) {
      setError(err?.message || "Failed to load courses");
    } finally {
      if (mounted) setLoading(false);
    }
  };

  // Load video courses on tab switch or language change
  useEffect(() => {
    if (activeTab !== "video") return;
    fetchVideo(videoPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, i18n.language]);

  // Load live courses on tab switch or language change
  useEffect(() => {
    if (activeTab !== "live") return;
    fetchLive(livePage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, i18n.language]);

  // Load favorites to reflect heart state
  useEffect(() => {
    let mounted = true;
    getFavorites()
      .then((res) => {
        if (!mounted) return;
        const videoFavs = (res.data || [])
          .filter((f) => f.type === "video_course")
          .map((f) => `video_course_${f.table_id}`);
        const liveFavs = (res.data || [])
          .filter((f) => f.type === "live_course")
          .map((f) => `live_course_${f.table_id}`);
        setFavoriteIds([...videoFavs, ...liveFavs]);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [getFavorites]);

  const onToggleFavorite = async (courseId, courseType) => {
    if (!isLoggedIn) {
      toast.info(t("auth.login_required", "Please login to use favorites"));
      navigate("/login", { state: { from: location.pathname } });
      return;
    }
    try {
      let type;
      if (courseType === "video_course" || courseType === "live_course") {
        type = courseType;
      } else {
        type = courseType === "video" ? "video_course" : "live_course";
      }
      const res = await toggleFavorite(courseId, type);
      const favoriteKey = `${type}_${courseId}`;
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

  const visible = activeTab === "video" ? videoCourses : liveCourses;
  const filtered = useMemo(() => {
    return visible.filter((c) => {
      const text = `${c.title} ${c.instructor || ""} ${c.description || ""}`.toLowerCase();
      const matchesSearch = text.includes(query.toLowerCase());
      const matchesBestseller = showBestsellers ? c.is_bestseller === true : true;
      return matchesSearch && matchesBestseller;
    });
  }, [visible, query, showBestsellers]);

  function goToDetails(course) {
    if (!course?.id && !course?.slug) return;
    if (activeTab === "live") {
      navigate(`/live-courses/${course.slug || course.id}`);
    } else {
      navigate(`/courses/${course.slug || course.id}`);
    }
  }

  const currentPage = activeTab === "video" ? videoPage : livePage;
  const totalPages = activeTab === "video" ? videoTotalPages : liveTotalPages;

  const handlePageChange = (page) => {
    if (activeTab === "video") {
      setVideoPage(page);
      fetchVideo(page);
    } else {
      setLivePage(page);
      fetchLive(page);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen py-10 transition-colors duration-300 ">
      <SEO 
        title={activeTab === "video" ? "Video Courses" : "Live Courses"}
        description={`Explore our comprehensive ${activeTab === "video" ? "recorded video courses" : "interactive live courses"} for KROK preparation. Best study materials for medicine, dentistry, and pharmacy students.`}
        url={activeTab === "video" ? "/courses" : "/live-courses"}
      />
      <div className="px-4 mx-auto max-w-7xl sm:px-0">
        {/* Header */}
        <header className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl dark:text-white">{t("courses.allCourses", "All Courses")}</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {t("courses.chooseType", "Choose course type — Recorded Video Courses or Interactive Live Courses.")}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className={`items-center hidden p-1 bg-white rounded-full shadow-sm sm:flex dark:bg-gray-800 border-2 transition-colors duration-300 ${
              activeTab === "video" ? "border-primary" : "border-red-600"
            }`}>
              <button
                onClick={() => { setActiveTab("video"); setQuery(""); }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  activeTab === "video"
                    ? "bg-primary text-white"
                    : "text-gray-600 dark:text-gray-200"
                }`}
              >
                <FaPlayCircle className="inline mr-2" /> {t("courses.videoCourse", "Video Course")}
              </button>
              <button
                onClick={() => { setActiveTab("live"); setQuery(""); }}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  activeTab === "live"
                    ? "bg-red-600 text-white"
                    : "text-gray-600 dark:text-gray-200"
                }`}
              >
                <FaVideo className="inline mr-2" /> {t("courses.liveCourse", "Live Course")}
              </button>
            </div>

            {/* Bestsellers Toggle */}
            <button
              onClick={() => setShowBestsellers(!showBestsellers)}
              className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                showBestsellers 
                  ? "bg-yellow-500 text-white border-yellow-500 shadow-md" 
                  : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700"
              }`}
              aria-pressed={showBestsellers}
            >
              <FaStar className={showBestsellers ? "text-white" : "text-yellow-500"} /> 
              {t("courses.bestsellers", "Bestsellers")}
            </button>

            {/* Search */}
            <div className="flex items-center px-3 py-2 transition-all duration-200 bg-white border border-gray-300 rounded-full shadow-sm focus-within:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:focus-within:border-blue-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-gray-500 dark:text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1010.5 18.5a7.5 7.5 0 006.15-3.85z" />
              </svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-48 px-3 text-sm text-gray-700 placeholder-gray-400 bg-transparent outline-none sm:w-64 dark:text-gray-200 dark:placeholder-gray-500"
                placeholder={t("courses.searchPlaceholder", "Search for a course or instructor...")}
                aria-label="Search courses"
              />
            </div>
          </div>
        </header>

        {/* Mobile Toggle */}
        <div className="flex gap-3 mb-4 sm:hidden">
          <button
            onClick={() => { setActiveTab("video"); setQuery(""); }}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold ${
              activeTab === "video"
                ? "bg-primary text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
            }`}
          >
            <FaPlayCircle className="inline mr-2" /> Video Course
          </button>
          <button
            onClick={() => { setActiveTab("live"); setQuery(""); }}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold ${
              activeTab === "live"
                ? "bg-red-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
            }`}
          >
            <FaVideo className="inline mr-2" /> Live Course
          </button>
        </div>

        {/* Summary */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {t("courses.showing", "Showing")} {filtered.length} {t("courses.of", "of")} {visible.length} — {t("courses.type", "Type")}:{" "}
            <span className="font-medium">
              {activeTab === "video" ? t("courses.videoCourse", "Video Course") : t("courses.liveCourse", "Live Course")}
            </span>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {t("courses.layoutModern", "Layout: Modern Cards")}
          </div>
        </div>

        {/* Grid */}
        <section>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              {!!error && (
                <div className="p-6 mb-6 text-center text-red-600 bg-white shadow dark:bg-gray-800 rounded-2xl">
                  {t("common.error", "Error")}: {error}
                </div>
              )}
              {activeTab === "video" ? (
                <VideoCourses
                  courses={filtered}
                  favoriteIds={favoriteIds}
                  onToggleFavorite={onToggleFavorite}
                  goToDetails={goToDetails}
                  t={t}
                  isLoggedIn={isLoggedIn}
                  navigate={navigate}
                />
              ) : (
                <LiveCourses
                  courses={filtered}
                  favoriteIds={favoriteIds}
                  onToggleFavorite={onToggleFavorite}
                  goToDetails={goToDetails}
                  t={t}
                  isLoggedIn={isLoggedIn}
                  navigate={navigate}
                />
              )}

              {/* Pagination — only when not searching */}
              {!query && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  loading={loading}
                />
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
