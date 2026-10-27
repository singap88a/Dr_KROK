import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useStudyTracker } from "../../context/StudyTrackerContext";
import { useApi } from "../../context/ApiContext";

// Modular Dashboard Components
import DashboardHeroBanner from "../../components/Profile/dashboard/DashboardHeroBanner";
import DashboardStatsGrid from "../../components/Profile/dashboard/DashboardStatsGrid";
import DashboardCourseProgress from "../../components/Profile/dashboard/DashboardCourseProgress";
import DashboardLiveSchedule from "../../components/Profile/dashboard/DashboardLiveSchedule";
import DashboardStudyTracker from "../../components/Profile/dashboard/DashboardStudyTracker";
import DashboardQuickShortcuts from "../../components/Profile/dashboard/DashboardQuickShortcuts";

export default function StudentDashboard({ user, setActiveTab }) {
  const { i18n } = useTranslation();
  const { getMyCoursesProgress, getMyLiveSchedule } = useApi();
  const isRtl = i18n.language === "ar" || i18n.dir?.() === "rtl";
  const { streak, today, thisWeek, thisMonth } = useStudyTracker();

  // Courses Progress State
  const [coursesProgressData, setCoursesProgressData] = useState(null);
  const [loadingCoursesProgress, setLoadingCoursesProgress] = useState(false);

  // Live Lectures Schedule State (Update 10)
  const [liveScheduleCourses, setLiveScheduleCourses] = useState([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [selectedScheduleCourseId, setSelectedScheduleCourseId] = useState("all");
  const [scheduleFilterMode, setScheduleFilterMode] = useState("all"); // "all" | "active"

  // Fetch Courses Progress
  useEffect(() => {
    let isMounted = true;
    const fetchCoursesProgress = async () => {
      try {
        setLoadingCoursesProgress(true);
        if (getMyCoursesProgress) {
          const res = await getMyCoursesProgress({ per_page: 4 }, { useCache: true });
          if (isMounted && res?.data) {
            setCoursesProgressData(res.data);
          }
        }
      } catch (err) {
        console.warn("Could not fetch courses progress in StudentDashboard:", err);
      } finally {
        if (isMounted) setLoadingCoursesProgress(false);
      }
    };
    fetchCoursesProgress();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch Live Lessons Schedule (Update 10)
  useEffect(() => {
    let isMounted = true;
    const fetchLiveSchedule = async () => {
      try {
        setLoadingSchedule(true);
        if (getMyLiveSchedule) {
          const res = await getMyLiveSchedule({ only_lessons: 1 }, { useCache: true });
          if (isMounted && res?.data && Array.isArray(res.data)) {
            setLiveScheduleCourses(res.data);
          }
        }
      } catch (err) {
        console.warn("Could not fetch live schedule in StudentDashboard:", err);
      } finally {
        if (isMounted) setLoadingSchedule(false);
      }
    };
    fetchLiveSchedule();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute lessons list from live courses schedule (Update 10)
  const flattenedSchedule = useMemo(() => {
    if (!liveScheduleCourses || !Array.isArray(liveScheduleCourses) || liveScheduleCourses.length === 0) {
      return [];
    }

    let coursesToInclude = liveScheduleCourses;
    if (selectedScheduleCourseId !== "all") {
      coursesToInclude = liveScheduleCourses.filter(
        (c) => String(c.course_id) === String(selectedScheduleCourseId)
      );
    }

    const allLessons = [];
    coursesToInclude.forEach((c) => {
      const schedule = c.schedule || [];
      schedule.forEach((lesson) => {
        allLessons.push({
          ...lesson,
          course_id: c.course_id,
          course_title: c.course_title,
          course_slug: c.slug,
          course_image: c.image,
          batch: c.batch,
          instructor: c.batch?.instructor,
        });
      });
    });

    // Filter by active if requested ("ولو عاويزن نلفتر نرجع المواعيد الفعالة فقط")
    let result = allLessons;
    if (scheduleFilterMode === "active") {
      result = result.filter(
        (item) =>
          item.is_active === true &&
          (item.is_upcoming ||
            item.is_today ||
            item.timing_status === "started" ||
            item.timing_status === "upcoming" ||
            item.can_join)
      );
    }

    // Sort: live/upcoming first, then by date/time ascending
    return result.sort((a, b) => {
      const aLive = a.timing_status === "started" || (a.is_today && a.can_join);
      const bLive = b.timing_status === "started" || (b.is_today && b.can_join);
      if (aLive && !bLive) return -1;
      if (!aLive && bLive) return 1;

      if (a.is_upcoming && !b.is_upcoming) return -1;
      if (!a.is_upcoming && b.is_upcoming) return 1;

      const dateA = a.started_at || a.date || "";
      const dateB = b.started_at || b.date || "";
      if (dateA && dateB) return dateA.localeCompare(dateB);
      if (dateA) return -1;
      if (dateB) return 1;
      return 0;
    });
  }, [liveScheduleCourses, selectedScheduleCourseId, scheduleFilterMode]);

  const summary = coursesProgressData?.summary || null;
  const coursesProgressList =
    coursesProgressData?.all_courses?.data ||
    [
      ...(coursesProgressData?.video_courses?.data || []),
      ...(coursesProgressData?.live_courses?.data || []),
    ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* ─── Hero Welcome Banner ────────────────────────────────────────── */}
      <DashboardHeroBanner
        user={user}
        setActiveTab={setActiveTab}
        isRtl={isRtl}
      />

      {/* ─── Stats Overview Grid ────────────────────────────────────────── */}
      <DashboardStatsGrid
        user={user}
        summary={summary}
        setActiveTab={setActiveTab}
      />

      {/* ─── Course Progress & Rank Overview ────────────────────────────── */}
      <DashboardCourseProgress
        coursesProgressList={coursesProgressList}
        setActiveTab={setActiveTab}
      />

      {/* ─── Live Lectures Schedule ─────────────────────────────────────── */}
      <DashboardLiveSchedule
        liveScheduleCourses={liveScheduleCourses}
        flattenedSchedule={flattenedSchedule}
        loadingSchedule={loadingSchedule}
        selectedScheduleCourseId={selectedScheduleCourseId}
        setSelectedScheduleCourseId={setSelectedScheduleCourseId}
        scheduleFilterMode={scheduleFilterMode}
        setScheduleFilterMode={setScheduleFilterMode}
      />

      {/* ─── Study Tracker & Activity Section ───────────────────────────── */}
      <DashboardStudyTracker
        streak={streak}
        today={today}
        thisWeek={thisWeek}
        thisMonth={thisMonth}
        setActiveTab={setActiveTab}
        isRtl={isRtl}
      />

      {/* ─── Quick Shortcuts ────────────────────────────────────────────── */}
      <DashboardQuickShortcuts
        setActiveTab={setActiveTab}
      />
    </div>
  );
}
