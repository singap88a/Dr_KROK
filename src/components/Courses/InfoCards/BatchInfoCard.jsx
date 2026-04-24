// LiveCourseLessons/BatchInfoCard.jsx
import React from "react";
import { FaUsers, FaGraduationCap, FaClock, FaUser, FaCalendarAlt, FaHourglassHalf, FaLanguage, FaTelegram } from "react-icons/fa";

export default function BatchInfoCard({ course, t }) {
  if (!course?.batch_info) return null;

  return (
    <div className="p-6 mb-6 transition-all duration-300 border shadow-sm rounded-xl bg-gradient-to-br from-primary/10 via-background to-secondary/5 border-primary/20 hover:shadow-md dark:bg-gradient-to-br dark:from-primary/5 dark:via-background dark:to-secondary/5 dark:border-primary/10">
      <div className="flex flex-col justify-between gap-4 mb-4 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg shadow-sm bg-gradient-to-r from-primary/20 to-secondary/20 dark:from-primary/10 dark:to-secondary/10">
            <FaUsers className="text-lg text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text dark:text-text">{t("liveCourses.batchInformation", "Batch Information")}</h3>
            <p className="text-sm text-text-muted dark:text-text-muted">{t("liveCourses.batchInformationDescription", "Details about your course batch")}</p>
          </div>
        </div>
        {course.batch_info.telegram_link && (
          <a
            href={course.batch_info.telegram_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white transition-all rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <FaTelegram className="text-base" />
            {t("liveCourses.joinTelegramGroup", "Join Telegram Group")}
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex items-center gap-3 p-3 transition-colors border rounded-lg bg-white/50 backdrop-blur-sm border-primary/10 hover:bg-primary/5 dark:bg-gray-800/50 dark:border-primary/5 dark:hover:bg-primary/10">
          <div className="p-2 rounded-md bg-primary/10 dark:bg-primary/5">
            <FaGraduationCap className="text-primary" />
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-medium tracking-wide uppercase text-text-muted dark:text-text-muted">{t("liveCourses.batchName", "Batch Name")}</div>
            <div className="font-semibold text-text dark:text-text">{course.batch_info.batch_name}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 transition-colors border rounded-lg bg-white/50 backdrop-blur-sm border-primary/10 hover:bg-primary/5 dark:bg-gray-800/50 dark:border-primary/5 dark:hover:bg-primary/10">
          <div className="p-2 rounded-md bg-primary/10 dark:bg-primary/5">
            <FaUsers className="text-primary" />
          </div>
          <div>
            <div className="text-xs font-medium tracking-wide uppercase text-text-muted dark:text-text-muted">{t("courses.students", "Students")}</div>
            <div className="font-semibold text-text dark:text-text">{course.batch_info.students_count}</div>
          </div>
        </div>

        {course.batch_info.status && (
          <div className="flex items-center gap-3 p-3 transition-colors border rounded-lg bg-white/50 backdrop-blur-sm border-primary/10 hover:bg-primary/5 dark:bg-gray-800/50 dark:border-primary/5 dark:hover:bg-primary/10">
            <div className="p-2 rounded-md bg-primary/10 dark:bg-primary/5">
              <FaClock className="text-primary" />
            </div>
            <div>
              <div className="text-xs font-medium tracking-wide uppercase text-text-muted dark:text-text-muted">{t("courses.status", "Status")}</div>
              <div className="flex items-center gap-1 font-semibold text-text dark:text-text">
                <span className={`inline-block w-2 h-2 rounded-full ${course.batch_info.status === 'Active' ? 'bg-green-500' : course.batch_info.status === 'Completed' ? 'bg-blue-500' : 'bg-yellow-500'}`}></span>
                {course.batch_info.status}
              </div>
            </div>
          </div>
        )}

        {course.batch_info.instructor && (
          <div className="flex items-center gap-3 p-3 transition-colors border rounded-lg bg-white/50 backdrop-blur-sm border-primary/10 hover:bg-primary/5 dark:bg-gray-800/50 dark:border-primary/5 dark:hover:bg-primary/10">
            <div className="p-2 rounded-md bg-primary/10 dark:bg-primary/5">
              <FaUser className="text-primary" />
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-medium tracking-wide uppercase text-text-muted dark:text-text-muted">{t("courses.instructor", "Instructor")}</div>
              <div className="font-semibold text-text dark:text-text">{course.batch_info.instructor?.name || t("liveCourses.unknownInstructor", "Unknown Instructor")}</div>
            </div>
          </div>
        )}
      </div>

      <div className="pt-4 mt-4 border-t border-primary/10 dark:border-primary/5">
        <div className="flex flex-wrap gap-2">
          {course.batch_info.start_date && (
            <div className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-full bg-primary/5 text-primary border border-primary/10 dark:bg-primary/10 dark:border-primary/5">
              <FaCalendarAlt className="text-xs" />
              <span>{t("liveCourses.starts", "Starts")}: {course.batch_info.start_date}</span>
            </div>
          )}
          {course.batch_info.duration && (
            <div className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-full bg-secondary/5 text-secondary border border-secondary/10 dark:bg-secondary/10 dark:border-secondary/5">
              <FaHourglassHalf className="text-xs" />
              <span>{t("liveCourses.duration", "Duration")}: {course.batch_info.duration}</span>
            </div>
          )}
          {course.batch_info.language && (
            <div className="flex items-center gap-2 px-3 py-1.5 text-xs rounded-full bg-green-500/5 text-green-600 border border-green-500/10 dark:bg-green-500/10 dark:border-green-500/5">
              <FaLanguage className="text-xs" />
              <span>{t("courses.language", "Language")}: {course.batch_info.language}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}