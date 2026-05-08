import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { FaCheckCircle, FaHome, FaArrowLeft } from "react-icons/fa";

const ApplicationSuccess = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen pt-32 pb-12 bg-gray-50 dark:bg-gray-900 flex items-center justify-center transition-colors duration-300">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white dark:bg-gray-800 rounded-[3.5rem] shadow-2xl p-12 md:p-20 text-center space-y-10 border border-border animate-scaleIn relative overflow-hidden">
          {/* Background Decorative Elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-full -ml-16 -mb-16 blur-2xl"></div>

          <div className="relative inline-block">
            <div className="absolute inset-0 bg-green-500/20 blur-3xl animate-pulse rounded-full"></div>
            <FaCheckCircle className="relative text-8xl md:text-9xl text-green-500 animate-bounce" />
          </div>
          
          <div className="space-y-4 relative z-10">
            <h1 className="text-4xl md:text-5xl font-black text-text leading-tight">
              {t("jobs.form.success.title")}
            </h1>
            <h2 className="text-xl md:text-2xl font-bold text-text-secondary opacity-80">
              {t("jobs.form.success.subtitle")}
            </h2>
          </div>

          <p className="text-lg text-text-secondary font-medium leading-relaxed max-w-md mx-auto opacity-70">
            {t("jobs.form.success.description")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10 relative z-10">
            <Link
              to="/"
              className="w-full sm:w-auto px-10 py-5 bg-primary text-white font-black rounded-[1.5rem] shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <FaHome className="text-lg" />
              {t("jobs.form.success.back")}
            </Link>
            <Link
              to="/jobs"
              className="w-full sm:w-auto px-10 py-5 bg-white dark:bg-gray-700 text-text font-black rounded-[1.5rem] border-2 border-border hover:bg-gray-50 dark:hover:bg-gray-600 transition-all flex items-center justify-center gap-3 shadow-lg shadow-black/5"
            >
              <FaArrowLeft className="text-lg" />
              {t("jobs.backToJobs", { defaultValue: "Back to Jobs" })}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationSuccess;
