import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useApi } from "../../context/ApiContext";
import {
  FaChalkboardTeacher,
  FaUserGraduate,
  FaBookOpen,
  FaVideo,
} from "react-icons/fa";

// StatsSection.jsx
export default function StatsSection() {
  const { t } = useTranslation();
  const { getSettings } = useApi();
  const [apiStats, setApiStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const settings = await getSettings();
        if (settings?.data) {
          setApiStats({
            instructors: Number(settings.data.total_instructors) || 0,
            students: Number(settings.data.total_clients) || 0,
            courses: (Number(settings.data.total_video_courses) || 0) + (Number(settings.data.total_live_courses) || 0),
            liveCourses: Number(settings.data.total_live_courses) || 0,
          });
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    };
    fetchStats();
  }, [getSettings]);

  const defaultStats = [
    { id: 1, label: t("stats.instructors"), value: 128, icon: <FaChalkboardTeacher /> },
    { id: 2, label: t("stats.students"), value: 4920, icon: <FaUserGraduate /> },
    { id: 3, label: t("stats.courses"), value: 86, icon: <FaBookOpen /> },
    { id: 4, label: t("stats.liveCourses"), value: 42, icon: <FaVideo /> },
  ];

  const data = apiStats ? [
    { id: 1, label: t("stats.instructors"), value: apiStats.instructors, icon: <FaChalkboardTeacher /> },
    { id: 2, label: t("stats.students"), value: apiStats.students, icon: <FaUserGraduate /> },
    { id: 3, label: t("stats.courses"), value: apiStats.courses, icon: <FaBookOpen /> },
    { id: 4, label: t("stats.liveCourses"), value: apiStats.liveCourses, icon: <FaVideo /> },
  ] : defaultStats;

  const sectionRef = useRef(null);
  const [triggerCount, setTriggerCount] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // كل مرة يدخل القسم يبدأ يعد من جديد
            setTriggerCount((prev) => !prev);
          }
        });
      },
      { threshold: 0.25 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full transition-colors duration-300 bg-gradient-to-r from-[#e0f9fa] via-white to-[#e0f9fa] dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
    >
      <div className="px-4">
              <div className="py-6 mx-auto text-center max-w-7xl">
        <h2 className="text-3xl font-extrabold text-gray-900 md:text-4xl dark:text-white">
          {t("stats.title")}
        </h2>
        <p className="max-w-xl mx-auto mt-4 text-gray-600 dark:text-gray-300">
          {t("stats.subtitle")}
        </p>

        <div className="grid grid-cols-1 gap-8 mt-16 sm:grid-cols-2 lg:grid-cols-4">
          {data.map((s) => (
            <StatCard
              key={s.id}
              label={s.label}
              value={s.value}
              trigger={triggerCount}
              icon={s.icon}
            />
          ))}
        </div>
      </div>
      </div>

    </section>
  );
}

function StatCard({ label, value, trigger, icon }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const duration = determineDuration(value);
    const startTime = performance.now();
    const from = 0;
    const to = Number(value);

    const step = (t) => {
      const progress = Math.min((t - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(from + (to - from) * eased);
      setDisplay(current);
      if (progress < 1) rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [trigger, value]); // مهم: rerun مع كل تغيير في trigger

  return (
    <div className="p-8 transition-all duration-300 border group rounded-2xl bg-white/70 backdrop-blur-md dark:bg-gray-800/60 dark:border-gray-700">
      <div className="flex flex-col items-center">
        <div className="mb-4 text-4xl transition-transform text-primary dark:text-primary group-hover:scale-110">
          {icon}
        </div>
        <div className="text-3xl font-extrabold text-gray-900 md:text-4xl dark:text-white">
          {formatNumber(display)}
        </div>
        <div className="mt-2 text-sm text-gray-600 md:text-base dark:text-gray-300">
          {label}
        </div>
      </div>
    </div>
  );
}

function determineDuration(value) {
  const v = Number(value);
  if (v < 100) return 700;
  if (v < 1000) return 1200;
  if (v < 5000) return 1600;
  return 2200;
}

function formatNumber(n) {
  if (n >= 1000) return n.toLocaleString();
  return String(n);
}
