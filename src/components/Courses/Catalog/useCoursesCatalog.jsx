import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApi } from "../../../context/ApiContext";
import { useUser } from "../../../context/UserContext";
import { toast } from "react-toastify";

const PER_PAGE = 12;

export function useCoursesCatalog() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    getVideoCourses,
    getLiveCourses,
    getCenterCourses,
    filterCourses,
    getFavorites,
    toggleFavorite,
    request,
  } = useApi();
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

  // Filter Modal states
  const [specializations, setSpecializations] = useState([]);
  const [collegeYears, setCollegeYears] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [tempSpecialization, setTempSpecialization] = useState("");
  const [tempCollegeYear, setTempCollegeYear] = useState("");
  const [appliedSpecialization, setAppliedSpecialization] = useState("");
  const [appliedCollegeYear, setAppliedCollegeYear] = useState("");

  const isFilterActive = Boolean(appliedSpecialization || appliedCollegeYear);
  const activeFiltersCount = (appliedSpecialization ? 1 : 0) + (appliedCollegeYear ? 1 : 0);

  // Pagination state — separate for each tab
  const [videoPage, setVideoPage] = useState(1);
  const [videoTotalPages, setVideoTotalPages] = useState(1);
  const [livePage, setLivePage] = useState(1);
  const [liveTotalPages, setLiveTotalPages] = useState(1);
  const [centerPage, setCenterPage] = useState(1);
  const [centerTotalPages, setCenterTotalPages] = useState(1);

  // Fetch specializations and college years options
  useEffect(() => {
    let mounted = true;
    request("specializations?page=1&per_page=50", { useCache: true })
      .then((res) => {
        if (!mounted) return;
        if (res && res.data) {
          setSpecializations(Array.isArray(res.data) ? res.data : []);
        }
      })
      .catch(() => {});

    request("college-years", { useCache: true })
      .then((data) => {
        if (!mounted) return;
        if (Array.isArray(data)) {
          setCollegeYears(data);
        } else if (data && Array.isArray(data.data)) {
          setCollegeYears(data.data);
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, [request]);

  const fetchFilteredCourses = async (tab, page = 1, specId = appliedSpecialization, year = appliedCollegeYear) => {
    let mounted = true;
    setLoading(true);
    setError("");
    const type = tab === "video" ? "video_course" : tab === "live" ? "live_course" : "center_course";
    try {
      const res = await filterCourses({
        type,
        specialization_id: specId || undefined,
        college_year: year || undefined,
        page,
        per_page: PER_PAGE,
      });
      if (!mounted) return;

      if (tab === "video") {
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
          img: c.image && typeof c.image === "string" && c.image.length > 0 ? c.image : "/logo.png",
          specialization: c.specialization,
          college_year: c.college_year,
        }));
        setVideoCourses(mapped);
        if (res.pagination) {
          setVideoTotalPages(res.pagination.total_pages || 1);
          setVideoPage(res.pagination.current_page || page);
        }
      } else if (tab === "live") {
        const mapped = (res.data || []).map((c) => ({
          id: c.id,
          slug: c.slug,
          type: "live",
          title: c.title,
          description: c.description,
          category: typeof c.category === "object" ? c.category?.name : c.category,
          level: c.level,
          language: c.language,
          started_at: c.started_at,
          college_year: c.college_year,
          price: c.price ? Number(c.price) : 0,
          discount: c.discount ? Number(c.discount) : 0,
          rating: c.avg_rating ?? 0,
          is_bestseller: c.is_bestseller,
          img: c.image && typeof c.image === "string" && c.image.length > 0 ? c.image : "/logo.png",
          specialization: c.specialization,
        }));
        setLiveCourses(mapped);
        if (res.pagination) {
          setLiveTotalPages(res.pagination.total_pages || 1);
          setLivePage(res.pagination.current_page || page);
        }
      } else {
        const mapped = (res.data || []).map((c) => ({
          id: c.id,
          slug: c.slug,
          type: "center",
          title: c.title,
          description: c.description,
          category: typeof c.category === "object" ? c.category?.name : (c.category || c.category_name),
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
          specialization: c.specialization,
        }));
        setCenterCourses(mapped);
        if (res.pagination) {
          setCenterTotalPages(res.pagination.total_pages || 1);
          setCenterPage(res.pagination.current_page || page);
        }
      }
    } catch (err) {
      setError(err?.message || "Failed to load courses");
    } finally {
      if (mounted) setLoading(false);
    }
  };

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
        img: c.image && typeof c.image === "string" && c.image.length > 0 ? c.image : "/logo.png",
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
        category: typeof c.category === "object" ? c.category?.name : c.category,
        level: c.level,
        language: c.language,
        started_at: c.started_at,
        college_year: c.college_year,
        price: c.price ? Number(c.price) : 0,
        discount: c.discount ? Number(c.discount) : 0,
        rating: c.avg_rating ?? 0,
        is_bestseller: c.is_bestseller,
        img: c.image && typeof c.image === "string" && c.image.length > 0 ? c.image : "/logo.png",
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
      const res = await getCenterCourses({ page, per_page: 100 });
      if (!mounted) return;

      const mapped = (res.data || []).map((c) => ({
        id: c.id,
        slug: c.slug,
        type: "center",
        title: c.title,
        description: c.description,
        category: typeof c.category === "object" ? c.category?.name : (c.category || c.category_name),
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

  // Tab switch effects
  useEffect(() => {
    if (activeTab !== "video") return;
    if (isFilterActive) {
      fetchFilteredCourses("video", videoPage, appliedSpecialization, appliedCollegeYear);
    } else {
      fetchVideo(videoPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isFilterActive, appliedSpecialization, appliedCollegeYear, i18n.language]);

  useEffect(() => {
    if (activeTab !== "live") return;
    if (isFilterActive) {
      fetchFilteredCourses("live", livePage, appliedSpecialization, appliedCollegeYear);
    } else {
      fetchLive(livePage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isFilterActive, appliedSpecialization, appliedCollegeYear, i18n.language]);

  useEffect(() => {
    if (activeTab !== "center") return;
    if (isFilterActive) {
      fetchFilteredCourses("center", centerPage, appliedSpecialization, appliedCollegeYear);
    } else {
      fetchCenter(centerPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, centerFilter, isFilterActive, appliedSpecialization, appliedCollegeYear, i18n.language]);

  // Load favorites
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

  const visible = useMemo(() => {
    if (activeTab === "video") return videoCourses;
    if (activeTab === "live") return liveCourses;

    return centerCourses.filter((c) => {
      let isEnded = false;
      if (c.status === "expired" || c.status === "completed") {
        isEnded = true;
      } else if (c.started_at) {
        const now = new Date();
        const courseDate = new Date(c.started_at);
        const diffTime = courseDate.getTime() - now.getTime();
        const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
        if (diffHours < 0) isEnded = true;
      }

      if (centerFilter === "expired" || centerFilter === "completed") {
        return isEnded;
      } else if (centerFilter === "closest") {
        return !isEnded;
      }
      return true;
    });
  }, [activeTab, videoCourses, liveCourses, centerCourses, centerFilter]);

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
    if (activeTab === "video") setVideoPage(page);
    else if (activeTab === "live") setLivePage(page);
    else setCenterPage(page);

    if (isFilterActive) {
      fetchFilteredCourses(activeTab, page, appliedSpecialization, appliedCollegeYear);
    } else {
      if (activeTab === "video") fetchVideo(page);
      else if (activeTab === "live") fetchLive(page);
      else fetchCenter(page);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleApplyFilter = () => {
    setAppliedSpecialization(tempSpecialization);
    setAppliedCollegeYear(tempCollegeYear);
    setShowFilterModal(false);
    if (tempSpecialization || tempCollegeYear) {
      if (activeTab === "video") setVideoPage(1);
      else if (activeTab === "live") setLivePage(1);
      else setCenterPage(1);
      fetchFilteredCourses(activeTab, 1, tempSpecialization, tempCollegeYear);
    } else {
      if (activeTab === "video") fetchVideo(1);
      else if (activeTab === "live") fetchLive(1);
      else fetchCenter(1);
    }
  };

  const handleClearFilter = () => {
    setTempSpecialization("");
    setTempCollegeYear("");
    setAppliedSpecialization("");
    setAppliedCollegeYear("");
    setShowFilterModal(false);
    if (activeTab === "video") fetchVideo(1);
    else if (activeTab === "live") fetchLive(1);
    else fetchCenter(1);
  };

  const handleRemoveSpecializationFilter = () => {
    setAppliedSpecialization("");
    setTempSpecialization("");
    if (appliedCollegeYear) {
      fetchFilteredCourses(activeTab, 1, "", appliedCollegeYear);
    } else {
      if (activeTab === "video") fetchVideo(1);
      else if (activeTab === "live") fetchLive(1);
      else fetchCenter(1);
    }
  };

  const handleRemoveCollegeYearFilter = () => {
    setAppliedCollegeYear("");
    setTempCollegeYear("");
    if (appliedSpecialization) {
      fetchFilteredCourses(activeTab, 1, appliedSpecialization, "");
    } else {
      if (activeTab === "video") fetchVideo(1);
      else if (activeTab === "live") fetchLive(1);
      else fetchCenter(1);
    }
  };

  const selectedSpecObj = specializations.find((s) => String(s.id) === String(appliedSpecialization));
  const selectedSpecName = selectedSpecObj?.name || "";

  const selectedYearObj = collegeYears.find((y) => String(y.id) === String(appliedCollegeYear));
  const selectedYearName = selectedYearObj?.name || (appliedCollegeYear ? `${t("courses.collegeYear", "Year")} ${appliedCollegeYear}` : "");

  return {
    activeTab,
    setActiveTab,
    query,
    setQuery,
    showBestsellers,
    setShowBestsellers,
    centerFilter,
    setCenterFilter,
    setCenterPage,
    loading,
    error,
    filtered,
    visible,
    favoriteIds,
    onToggleFavorite,
    goToDetails,
    currentPage,
    totalPages,
    handlePageChange,
    // Filters
    specializations,
    collegeYears,
    showFilterModal,
    setShowFilterModal,
    tempSpecialization,
    setTempSpecialization,
    tempCollegeYear,
    setTempCollegeYear,
    appliedSpecialization,
    appliedCollegeYear,
    isFilterActive,
    activeFiltersCount,
    selectedSpecName,
    selectedYearName,
    handleApplyFilter,
    handleClearFilter,
    handleRemoveSpecializationFilter,
    handleRemoveCollegeYearFilter,
    isLoggedIn,
    navigate,
    t,
  };
}
