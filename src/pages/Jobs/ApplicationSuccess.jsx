import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { FaCheckCircle, FaHome, FaArrowLeft } from "react-icons/fa";

const ApplicationSuccess = () => {
  const { t } = useTranslation();

  return (
    <div className="h-[calc(100vh-80px)] min-h-[500px] bg-gray-50 dark:bg-gray-950 flex items-center justify-center transition-colors duration-300 p-4">
      <div className="w-full max-w-4xl">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-border/50 p-8 md:p-12 animate-scaleIn relative overflow-hidden flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Background Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full -ml-32 -mb-32 blur-3xl pointer-events-none"></div>

          <div className="relative flex-shrink-0">
            <div className="absolute inset-0 bg-green-500/20 blur-2xl animate-pulse rounded-full"></div>
            <div className="w-28 h-28 md:w-36 md:h-36 bg-green-50 dark:bg-green-500/10 rounded-full flex items-center justify-center relative z-10 border-4 border-white dark:border-gray-800 shadow-md">
              <FaCheckCircle className="text-6xl md:text-7xl text-green-500 animate-bounce" />
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-start space-y-6 relative z-10">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold text-text tracking-tight">
                {t("jobs.form.success.title")}
              </h1>
              <h2 className="text-lg md:text-xl font-medium text-text-secondary">
                {t("jobs.form.success.subtitle")}
              </h2>
            </div>

            <p className="text-sm text-text-secondary leading-relaxed opacity-80 max-w-lg mx-auto md:mx-0">
              {t("jobs.form.success.description")}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 pt-2">
              <Link
                to="/"
                className="w-full sm:w-auto px-6 py-3 bg-primary text-white text-sm font-semibold rounded-xl shadow-md shadow-primary/20 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <FaHome className="text-lg" />
                {t("jobs.form.success.back")}
              </Link>
              <Link
                to="/jobs"
                className="w-full sm:w-auto px-6 py-3 bg-gray-50 dark:bg-gray-800 text-text text-sm font-semibold rounded-xl border border-border hover:border-primary/40 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <FaArrowLeft className="text-lg" />
                {t("jobs.backToJobs", { defaultValue: "Back to Jobs" })}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationSuccess;
