import React, { useEffect, useRef, useState } from "react";
import {
  FaChalkboardTeacher,
  FaUserGraduate,
  FaBookOpen,
  FaUniversity,
} from "react-icons/fa";

// StatsSection.jsx
export default function StatsSection({ stats } = { stats: null }) {
  const defaultStats = [
    { id: 1, label: "Instructors", value: 128, icon: <FaChalkboardTeacher /> },
    { id: 2, label: "Students", value: 4920, icon: <FaUserGraduate /> },
    { id: 3, label: "Courses", value: 86, icon: <FaBookOpen /> },
    { id: 4, label: "Departments", value: 12, icon: <FaUniversity /> },
  ];

  const data = stats || defaultStats;

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
      <div className="py-6 mx-auto text-center max-w-7xl">
        <h2 className="text-3xl font-extrabold text-gray-900 md:text-4xl dark:text-white">
          Our Impact in Numbers
        </h2>
        <p className="max-w-xl mx-auto mt-4 text-gray-600 dark:text-gray-300">
          Discover how our platform is growing every single day.
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
