import React, { useEffect, useState, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useApi } from "../../../context/ApiContext";
import { useUser } from "../../../context/UserContext";
import { FaStar } from "react-icons/fa";

import {
  buildOutlineKey,
  fetchOutline,
  getCachedOutline,
} from "./courseOutlineCache";

const NO_ACCESS = { userHasAccess: false, isExpired: false, isCompleted: false };
// Derived access per outline key, so a cached course renders with the right
// buttons on the first frame instead of flashing "Subscribe".
const accessMemo = new Map();

function deriveAccess(data, hasProfileAccess, isLoggedIn) {
  if (data?.enrollment_status) {
    const { is_enrolled, is_expired: expired, status } = data.enrollment_status;
    const completed = status === "completed";
    let actuallyExpired = expired === true || status === "expired";
    if (!actuallyExpired && !is_enrolled && hasProfileAccess && !completed) {
      actuallyExpired = true;
    }
    return {
      isCompleted: completed,
      isExpired: actuallyExpired,
      userHasAccess: is_enrolled === true && !actuallyExpired && !completed,
    };
  }
  if (!isLoggedIn) return NO_ACCESS;
  if (hasProfileAccess && typeof hasProfileAccess === "object") {
    const enrolled = hasProfileAccess.is_enrolled === true;
    const expired = hasProfileAccess.is_expired === true;
    const completed = hasProfileAccess.status === "completed";
    let actuallyExpired = expired;
    if (!actuallyExpired && !enrolled && !completed) actuallyExpired = true;
    return {
      isCompleted: completed,
      isExpired: actuallyExpired && !completed,
      userHasAccess: enrolled && !actuallyExpired && !completed,
    };
  }
  return { isCompleted: false, isExpired: false, userHasAccess: !!hasProfileAccess };
}

export function useCourseDetailsLogic({ id, isLive = false }) {
  const { t, i18n } = useTranslation();
  // Course Details uses the lightweight outline endpoint (~1s) instead of the
  // heavy show endpoint (13-60s). Ratings come from the paginated ratings
  // endpoint (CourseReviewsSection/useCourseRatings).
  const { getVideoCourseOutline, getLiveCourseOutline, getCourseAccess } = useApi();
  const { isLoggedIn, userData } = useUser();

  const courseType = isLive ? "live_course" : "video_course";
  const viewer = isLoggedIn ? `u${userData?.id ?? userData?.user_id ?? "auth"}` : "guest";
  const lang = (i18n?.language || "en").split("-")[0];
  const cacheKey = id ? buildOutlineKey({ courseType, idOrSlug: id, viewer, lang }) : null;

  const initialCached = cacheKey ? getCachedOutline(cacheKey) : null;
  const initialAccess = (cacheKey && accessMemo.get(cacheKey)) || NO_ACCESS;

  const [loading, setLoading] = useState(!initialCached);
  const [error, setError] = useState("");
  const [course, setCourse] = useState(initialCached?.data ?? null);
  const [userHasAccess, setUserHasAccess] = useState(initialAccess.userHasAccess);
  const [isExpired, setIsExpired] = useState(initialAccess.isExpired);
  const [isCompleted, setIsCompleted] = useState(initialAccess.isCompleted);
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isInstructorExpanded, setIsInstructorExpanded] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (!cacheKey) return undefined;
    let mounted = true;

    const applyAccess = (access) => {
      accessMemo.set(cacheKey, access);
      setUserHasAccess(access.userHasAccess);
      setIsExpired(access.isExpired);
      setIsCompleted(access.isCompleted);
    };

    const resolveAccess = async (data) => {
      let hasProfileAccess = false;
      if (isLoggedIn) {
        try {
          hasProfileAccess = await getCourseAccess(id, courseType);
        } catch {
          hasProfileAccess = data.price === 0 || data.price === "0";
        }
      }
      return deriveAccess(data, hasProfileAccess, isLoggedIn);
    };

    const load = () =>
      fetchOutline(
        cacheKey,
        () => (isLive ? getLiveCourseOutline(id, true) : getVideoCourseOutline(id, true)),
        { courseType, idOrSlug: id }
      );

    const run = async () => {
      const cached = getCachedOutline(cacheKey);

      if (cached) {
        // Serve instantly from cache; revalidate in the background if stale.
        setCourse(cached.data);
        setError("");
        setLoading(false);
        if (accessMemo.has(cacheKey)) applyAccess(accessMemo.get(cacheKey));

        const access = await resolveAccess(cached.data);
        if (mounted) applyAccess(access);

        if (cached.isStale) {
          try {
            const fresh = await load();
            if (!mounted) return;
            setCourse(fresh);
            const freshAccess = await resolveAccess(fresh);
            if (mounted) applyAccess(freshAccess);
          } catch (e) {
            // Keep showing the cached copy if background revalidation fails.
            console.warn("Course outline revalidation failed:", e);
          }
        }
        return;
      }

      try {
        setLoading(true);
        setError("");
        setCourse(null);
        const data = await load();
        if (!mounted) return;
        const access = await resolveAccess(data);
        if (!mounted) return;
        setCourse(data);
        applyAccess(access);
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || "Failed to load course details");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    run();

    return () => {
      mounted = false;
    };
  }, [cacheKey, id, isLive, courseType, isLoggedIn, getVideoCourseOutline, getLiveCourseOutline, getCourseAccess]);

  const renderStaticStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      return (
        <FaStar
          key={index}
          className={`w-4 h-4 ${
            starValue <= rating
              ? "text-yellow-400 fill-current"
              : starValue - 0.5 <= rating
              ? "text-yellow-400 fill-current opacity-50"
              : "text-gray-300 dark:text-gray-600"
          }`}
        />
      );
    });
  };

  const imageUrl = useMemo(() => {
    if (!course) return "/logo.png";
    const img = Array.isArray(course.image) ? course.image[0] : course.image;
    if (typeof img === "string" && img.length > 0) return img;
    return "/logo.png";
  }, [course]);

  const videoUrl = useMemo(() => {
    if (!course) return null;
    return course.video && typeof course.video === "string" && course.video.length > 0
      ? course.video
      : null;
  }, [course]);

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
  };

  const getLevelTranslation = (level) => {
    const levelMap = {
      beginner: t("courses.beginner", "Beginner"),
      intermediate: t("courses.intermediate", "Intermediate"),
      advanced: t("courses.advanced", "Advanced"),
    };
    return (level && levelMap[level]) || level || "";
  };

  const parseDate = (dateString) => {
    if (!dateString || typeof dateString !== "string") return null;
    try {
      const [datePart, timePart, ampm] = dateString.split(" ");
      if (!datePart) return new Date(dateString);
      const [day, month, year] = datePart.split("-");
      if (!year || !month || !day) return new Date(dateString);
      let hour = 0;
      let minute = 0;
      if (timePart) {
        const parts = timePart.split(":");
        hour = parseInt(parts[0], 10) || 0;
        minute = parseInt(parts[1], 10) || 0;
      }
      if (ampm === "PM" && hour !== 12) hour += 12;
      if (ampm === "AM" && hour === 12) hour = 0;
      return new Date(year, month - 1, day, hour, minute);
    } catch {
      return null;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const parts = String(dateString).split(" ");
      if (parts.length >= 2) {
        const datePart = parts[0];
        const timePart = parts[1];
        const ampm = parts[2];
        const [day, month, year] = datePart.split("-");
        const [hours, minutes] = timePart.split(":");
        let hour24 = parseInt(hours, 10) || 0;
        if (ampm === "PM" && hour24 !== 12) hour24 += 12;
        if (ampm === "AM" && hour24 === 12) hour24 = 0;
        const date = new Date(year, month - 1, day, hour24, parseInt(minutes, 10) || 0);
        return `${date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })} (Ukraine Time)`;
      }
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return String(dateString);
      return `${date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })} (Ukraine Time)`;
    } catch {
      return String(dateString);
    }
  };

  const getTimeStatus = (dateString) => {
    if (!dateString) return null;
    const now = new Date();
    const courseDate = new Date(dateString);
    if (isNaN(courseDate.getTime())) return null;
    const diffTime = courseDate.getTime() - now.getTime();
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));

    if (diffHours < 0) return null;
    if (diffHours <= 24) return { status: "liveToday", text: "LIVE TODAY", color: "bg-red-500" };
    if (diffHours <= 168) return { status: "comingSoon", text: "COMING SOON", color: "bg-orange-500" };
    return { status: "upcoming", text: "UPCOMING", color: "bg-blue-500" };
  };

  const timeStatus = useMemo(() => {
    return course?.started_at ? getTimeStatus(course.started_at) : null;
  }, [course]);

  const isUpcoming = useMemo(() => {
    if (!course?.started_at) return false;
    return new Date(course.started_at) > new Date();
  }, [course]);

  return {
    loading,
    error,
    course,
    userHasAccess,
    isExpired,
    isCompleted,
    showExpiredModal,
    setShowExpiredModal,
    showCompletedModal,
    setShowCompletedModal,
    isPlaying,
    setIsPlaying,
    isDescriptionExpanded,
    setIsDescriptionExpanded,
    isInstructorExpanded,
    setIsInstructorExpanded,
    videoRef,
    renderStaticStars,
    isLoggedIn,
    imageUrl,
    videoUrl,
    handlePlay,
    handleVideoEnd,
    getLevelTranslation,
    parseDate,
    formatDate,
    getTimeStatus,
    timeStatus,
    isUpcoming,
  };
}
