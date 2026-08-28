// CoursesPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  FaPlayCircle,
  FaVideo,
  FaStar,
  FaBuilding,
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
import CenterCourses from "../Center_courses/CenterCourses";
import SEO from "../../components/SEO/SEO";

const PER_PAGE = 12;

export default function Courses() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { getVideoCourses, getLiveCourses, getCenterCourses, getFavorites, toggleFavorite } = useApi();
  const { isLoggedIn } = useUser();
  const [activeTab, setActiveTab] = useState("video"); // video | live | center
  const [query, setQuery] = useState("");
  const [showBestsellers, setShowBestsellers] = useState(false);
  const [centerFilter, setCenterFilter] = useState("closest"); // closest | expired | completed
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [videoCourses, setVideoCourses] = useState([]);
  const [liveCourses, setLiveCourses] = useState([]);
  const [centerCourses, setCenterCourses] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState([]);

  // Pagination state — separate for each tab
  const [videoPage, setVideoPage] = useState(1);
  const [videoTotalPages, setVideoTotalPages] = useState(1);
  const [livePage, setLivePage] = useState(1);
  const [liveTotalPages, setLiveTotalPages] = useState(1);
  const [centerPage, setCenterPage] = useState(1);
  const [centerTotalPages, setCenterTotalPages] = useState(1);

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
        category: typeof c.category === 'object' ? c.category?.name : c.category,
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

  const fetchCenter = async (page = 1) => {
    let mounted = true;
    setLoading(true);
    setError("");
    try {
      const res = await getCenterCourses({ page, per_page: PER_PAGE, filter: centerFilter });
      if (!mounted) return;
      
      const mapped = (res.data || []).map((c) => ({
        id: c.id,
        slug: c.slug,
        type: "center",
        title: c.title,
        description: c.description,
        category: typeof c.category === 'object' ? c.category?.name : (c.category || c.category_name),
        started_at: c.start_date || c.started_at,
        address: c.address,
        max_students: c.max_students,
        seats_left: c.seats_left,
        is_full: c.is_full,
        status: c.status,
        price: c.price ? Number(c.price) : 0,
        discount: c.discount ? Number(c.discount) : 0,
        rating: c.avg_rating ?? 0,
        is_bestseller: c.is_bestseller,
        img: c.image && typeof c.image === "string" && c.image.length > 0 ? c.image : "/logo.png",
      }));
      setCenterCourses(mapped);
      if (res.pagination) {
        setCenterTotalPages(res.pagination.total_pages || 1);
        setCenterPage(res.pagination.current_page || page);
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

  // Load center courses on tab switch, language change, or filter change
  useEffect(() => {
    if (activeTab !== "center") return;
    fetchCenter(centerPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, centerFilter, i18n.language]);

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
        const centerFavs = (res.data || [])
          .filter((f) => f.type === "center_course")
          .map((f) => `center_course_${f.table_id}`);
        setFavoriteIds([...videoFavs, ...liveFavs, ...centerFavs]);
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
      if (courseType === "video_course" || courseType === "live_course" || courseType === "center_course") {
        type = courseType;
      } else {
        type = courseType === "video" ? "video_course" : courseType === "live" ? "live_course" : "center_course";
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

  const visible = activeTab === "video" ? videoCourses : activeTab === "live" ? liveCourses : centerCourses;
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
    } else if (activeTab === "center") {
      navigate(`/center-courses/${course.slug || course.id}`);
    } else {
      navigate(`/courses/${course.slug || course.id}`);
    }
  }

  const currentPage = activeTab === "video" ? videoPage : activeTab === "live" ? livePage : centerPage;
  const totalPages = activeTab === "video" ? videoTotalPages : activeTab === "live" ? liveTotalPages : centerTotalPages;

  const handlePageChange = (page) => {
    if (activeTab === "video") {
      setVideoPage(page);
      fetchVideo(page);
    } else if (activeTab === "live") {
      setLivePage(page);
      fetchLive(page);
    } else {
      setCenterPage(page);
      fetchCenter(page);
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
        <header className="flex flex-col gap-4 mb-6 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900 sm:text-3xl dark:text-white">{t("courses.allCourses", "All Courses")}</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {t("courses.chooseType", "Choose course type — Recorded Video Courses or Interactive Live Courses.")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className={`hidden sm:flex items-center p-1 bg-white rounded-full shadow-sm dark:bg-gray-800 border-2 transition-colors duration-300 ${
              activeTab === "video" ? "border-primary" : activeTab === "live" ? "border-red-600" : "border-teal-500"
            }`}>
              <button
                onClick={() => { setActiveTab("video"); setQuery(""); }}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${
                  activeTab === "video"
                    ? "bg-primary text-white"
                    : "text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <FaPlayCircle /> {t("courses.videoCourse", "Video Course")}
              </button>
              <button
                onClick={() => { setActiveTab("live"); setQuery(""); }}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${
                  activeTab === "live"
                    ? "bg-red-600 text-white"
                    : "text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <FaVideo /> {t("courses.liveCourse", "Live Course")}
              </button>
              <button
                onClick={() => { setActiveTab("center"); setQuery(""); }}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition whitespace-nowrap ${
                  activeTab === "center"
                    ? "bg-teal-500 text-white"
                    : "text-gray-600 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <FaBuilding /> {t("courses.centerCourse", "Center Course")}
              </button>
            </div>

            {/* Bestsellers Toggle */}
            <button
              onClick={() => setShowBestsellers(!showBestsellers)}
              className={`hidden sm:flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border whitespace-nowrap ${
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
            <div className="flex-1 min-w-[250px] flex items-center px-3 py-2 transition-all duration-200 bg-white border border-gray-300 rounded-full shadow-sm focus-within:border-blue-500 dark:bg-gray-800 dark:border-gray-600 dark:focus-within:border-blue-400">
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
        <div className="flex flex-wrap gap-2 mb-4 sm:hidden">
          <button
            onClick={() => { setActiveTab("video"); setQuery(""); }}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold ${
              activeTab === "video"
                ? "bg-primary text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
            }`}
          >
            <FaPlayCircle className="inline mr-1" /> Video
          </button>
          <button
            onClick={() => { setActiveTab("live"); setQuery(""); }}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold ${
              activeTab === "live"
                ? "bg-red-600 text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
            }`}
          >
            <FaVideo className="inline mr-1" /> Live
          </button>
          <button
            onClick={() => { setActiveTab("center"); setQuery(""); }}
            className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold ${
              activeTab === "center"
                ? "bg-teal-500 text-white"
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
            }`}
          >
            <FaBuilding className="inline mr-1" /> Center
          </button>
        </div>

        {/* Center Courses Sub-filters */}
        {activeTab === "center" && (
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
            {['closest', 'expired', 'completed'].map(filter => (
              <button
                key={filter}
                onClick={() => { setCenterFilter(filter); setCenterPage(1); }}
                className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
                  centerFilter === filter 
                    ? "bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-700" 
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                }`}
              >
                {t(`centerCourses.filter_${filter}`, filter.charAt(0).toUpperCase() + filter.slice(1))}
              </button>
            ))}
          </div>
        )}

        {/* Summary */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {t("courses.showing", "Showing")} {filtered.length} {t("courses.of", "of")} {visible.length} — {t("courses.type", "Type")}:{" "}
            <span className="font-medium">
              {activeTab === "video" ? t("courses.videoCourse", "Video Course") : activeTab === "live" ? t("courses.liveCourse", "Live Course") : t("courses.centerCourse", "Center Course")}
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
              ) : activeTab === "live" ? (
                <LiveCourses
                  courses={filtered}
                  favoriteIds={favoriteIds}
                  onToggleFavorite={onToggleFavorite}
                  goToDetails={goToDetails}
                  t={t}
                  isLoggedIn={isLoggedIn}
                  navigate={navigate}
                />
              ) : (
                <CenterCourses
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
