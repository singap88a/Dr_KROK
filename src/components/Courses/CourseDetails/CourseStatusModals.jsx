import React from "react";
import { FaCertificate, FaLock } from "react-icons/fa";

export default function CourseStatusModals({
  showExpiredModal,
  setShowExpiredModal,
  showCompletedModal,
  setShowCompletedModal,
  t,
}) {
  return (
    <>
      {/* Expired Modal */}
      {showExpiredModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 overflow-hidden text-center bg-white shadow-2xl rounded-2xl dark:bg-surface">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full dark:bg-red-900/30">
              <FaLock className="text-3xl text-red-600 dark:text-red-400" />
            </div>
            <h3 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
              {t("courses.courseExpiredTitle", "Course Access Expired")}
            </h3>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              {t(
                "courses.courseExpiredMessage",
                "Your access period for this course has expired."
              )}
            </p>
            <button
              onClick={() => setShowExpiredModal(false)}
              className="w-full px-4 py-3 font-semibold text-white transition-colors bg-primary rounded-xl hover:bg-secondary"
            >
              {t("common.close", "إغلاق")}
            </button>
          </div>
        </div>
      )}

      {/* Completed Modal */}
      {showCompletedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 overflow-hidden text-center bg-white shadow-2xl rounded-2xl dark:bg-surface">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full dark:bg-green-900/30">
              <FaCertificate className="text-3xl text-green-600 dark:text-green-400" />
            </div>
            <h3 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white">
              {t("courses.courseCompletedTitle", "Course Successfully Passed!")}
            </h3>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              {t(
                "courses.courseCompletedMessage",
                "You have successfully completed the requirements for this course. We wish you continued success."
              )}
            </p>
            <button
              onClick={() => setShowCompletedModal(false)}
              className="w-full px-6 py-3 font-semibold text-white transition-all rounded-xl bg-primary hover:bg-secondary hover:scale-105"
            >
              {t("common.close", "إغلاق")}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
