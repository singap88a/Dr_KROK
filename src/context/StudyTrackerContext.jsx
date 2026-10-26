import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useUser } from "./UserContext";
import { useApi } from "./ApiContext";

const StudyTrackerContext = createContext(null);

export const useStudyTracker = () => {
  const context = useContext(StudyTrackerContext);
  if (!context) {
    throw new Error("useStudyTracker must be used within a StudyTrackerProvider");
  }
  return context;
};

// Activity idle timeout: 3 minutes of no user interaction pauses tracking
const IDLE_TIMEOUT_MS = 3 * 60 * 1000;
// Heartbeat interval: send time every 120 seconds (2 minutes)
const HEARTBEAT_INTERVAL_SEC = 120;
// Minimum seconds to send in a heartbeat or flush
const MIN_SEND_SECONDS = 15;

export const StudyTrackerProvider = ({ children }) => {
  const { isLoggedIn, userData } = useUser();
  const { logStudyTime, getStudySummary } = useApi();
  const location = useLocation();

  const [summary, setSummary] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [activeSeconds, setActiveSeconds] = useState(0);

  // Explicit activity context set by specific pages (like video player / quiz runner)
  const [customActivityContext, setCustomActivityContext] = useState(null);

  // Internal refs to avoid stale closures in intervals/listeners
  const accumulatedSecondsRef = useRef(0);
  const lastActiveTimeRef = useRef(Date.now());
  const isLoggingRef = useRef(false);
  const customContextRef = useRef(null);
  customContextRef.current = customActivityContext;

  // Derive default activity context from route if not explicitly set
  const resolveCurrentActivity = useCallback(() => {
    if (customContextRef.current) {
      return customContextRef.current;
    }

    const path = location.pathname;

    // Match /courses/:id/test or /live-courses/:id/test
    if (path.includes("/test/") || path === "/test") {
      const match = path.match(/\/(courses|live-courses)\/(\d+)/);
      return {
        activity_type: "quiz",
        course_id: match ? parseInt(match[2], 10) : null,
        course_type: match ? (match[1] === "courses" ? "video" : "live") : null,
      };
    }

    // Match /courses/:id/lessons or /courses/:id
    const videoMatch = path.match(/^\/courses\/(\d+)/);
    if (videoMatch) {
      return {
        activity_type: "video",
        course_id: parseInt(videoMatch[1], 10),
        course_type: "video",
      };
    }

    // Match /live-courses/:id
    const liveMatch = path.match(/^\/live-courses\/(\d+)/);
    if (liveMatch) {
      return {
        activity_type: "live",
        course_id: parseInt(liveMatch[1], 10),
        course_type: "live",
      };
    }

    // Match articles/reading
    if (path.startsWith("/articles")) {
      return {
        activity_type: "reading",
        course_id: null,
        course_type: null,
      };
    }

    // General platform browsing/studying
    return {
      activity_type: "general",
      course_id: null,
      course_type: null,
    };
  }, [location.pathname]);

  // Fetch summary from API
  const refreshSummary = useCallback(async () => {
    if (!isLoggedIn) return null;
    try {
      setLoadingSummary(true);
      const res = await getStudySummary();
      if (res?.success && res?.data) {
        setSummary(res.data);
        return res.data;
      }
    } catch (err) {
      console.warn("Failed to fetch study tracker summary:", err?.message || err);
    } finally {
      setLoadingSummary(false);
    }
    return null;
  }, [isLoggedIn, getStudySummary]);

  // Initial load of summary upon login
  useEffect(() => {
    if (isLoggedIn) {
      refreshSummary();
    } else {
      setSummary(null);
      accumulatedSecondsRef.current = 0;
      setActiveSeconds(0);
    }
  }, [isLoggedIn, refreshSummary]);

  // Activity listeners to track real interaction
  useEffect(() => {
    const handleUserActivity = () => {
      lastActiveTimeRef.current = Date.now();
    };

    const events = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
    events.forEach((evt) => window.addEventListener(evt, handleUserActivity, { passive: true }));

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleUserActivity));
    };
  }, []);

  // Flush accumulated time to backend
  const flushTime = useCallback(async () => {
    const secondsToLog = accumulatedSecondsRef.current;
    if (secondsToLog < MIN_SEND_SECONDS || isLoggingRef.current || !isLoggedIn) {
      return;
    }

    isLoggingRef.current = true;
    const currentActivity = resolveCurrentActivity();

    try {
      const res = await logStudyTime({
        duration_seconds: secondsToLog,
        activity_type: currentActivity.activity_type || "general",
        course_id: currentActivity.course_id || null,
        course_type: currentActivity.course_type || null,
        lesson_id: currentActivity.lesson_id || null,
      });

      if (res?.success) {
        // Subtract sent seconds cleanly
        accumulatedSecondsRef.current = Math.max(0, accumulatedSecondsRef.current - secondsToLog);
        setActiveSeconds(accumulatedSecondsRef.current);

        // Update local summary state immediately with returned data
        if (res.data?.today_study || res.data?.streak) {
          setSummary((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              streak: {
                ...prev.streak,
                ...(res.data.streak || {}),
              },
              today: {
                ...prev.today,
                ...(res.data.today_study || {}),
                is_active: true,
              },
            };
          });
        }
      }
    } catch (err) {
      console.warn("Error logging study time:", err?.message || err);
      // Keep accumulated seconds for next try if network fails
    } finally {
      isLoggingRef.current = false;
    }
  }, [isLoggedIn, logStudyTime, resolveCurrentActivity]);

  // Timer interval: tick every 1s when user is active & document is visible
  useEffect(() => {
    if (!isLoggedIn) return;

    const interval = setInterval(() => {
      // Check if page is visible and user was active in last 3 minutes
      const isVisible = document.visibilityState === "visible";
      const isUserActive = Date.now() - lastActiveTimeRef.current < IDLE_TIMEOUT_MS;

      if (isVisible && isUserActive) {
        accumulatedSecondsRef.current += 1;
        setActiveSeconds(accumulatedSecondsRef.current);

        // Trigger heartbeat if threshold reached
        if (accumulatedSecondsRef.current >= HEARTBEAT_INTERVAL_SEC) {
          flushTime();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoggedIn, flushTime]);

  // Flush on tab hide or window unload
  useEffect(() => {
    if (!isLoggedIn) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flushTime();
      }
    };

    const handleBeforeUnload = () => {
      if (accumulatedSecondsRef.current >= MIN_SEND_SECONDS) {
        flushTime();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isLoggedIn, flushTime]);

  // Derived values for components
  const streak = summary?.streak || {
    current_streak: 0,
    longest_streak: 0,
    total_active_days: 0,
    is_studied_today: false,
    streak_message: "",
  };

  const today = summary?.today || {
    total_seconds: 0,
    hours: 0,
    formatted_time: "0m",
    is_active: false,
  };

  const thisWeek = summary?.this_week || {
    total_seconds: 0,
    total_hours: 0,
    formatted_time: "0m",
    active_days: 0,
    days: [],
  };

  const thisMonth = summary?.this_month || {
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    active_study_days: 0,
    commitment_percentage: 0,
    total_seconds: 0,
    total_hours: 0,
    formatted_time: "0m",
  };

  const value = {
    summary,
    streak,
    today,
    thisWeek,
    thisMonth,
    loadingSummary,
    refreshSummary,
    activeSeconds,
    flushTime,
    setActivityContext: setCustomActivityContext,
    currentActivity: resolveCurrentActivity(),
  };

  return (
    <StudyTrackerContext.Provider value={value}>
      {children}
    </StudyTrackerContext.Provider>
  );
};
