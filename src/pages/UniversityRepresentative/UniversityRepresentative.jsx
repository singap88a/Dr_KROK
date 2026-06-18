import React from "react";
import { useTranslation } from "react-i18next";
import { useApi } from "../../context/ApiContext";
import { useUser } from "../../context/UserContext";

// Sub-components
import RepApplicationForm from "../../components/UniversityRepresentative/RepApplicationForm";
import { FaInfoCircle } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function UniversityRepresentative() {
  const { t, i18n } = useTranslation();
  const { request } = useApi();
  const { isLoggedIn, userData } = useUser();
  const selectedRole = userData?.role || localStorage.getItem("DR_KROK_selected_role");

  if (selectedRole === "student") {
    return (
      <div className="container px-4 py-20 mx-auto max-w-2xl">
        <div className="p-8 text-center border border-blue-200 bg-blue-50 rounded-2xl shadow-sm dark:bg-blue-900/20 dark:border-blue-800">
          <div className="flex justify-center mb-4 text-blue-600 dark:text-blue-400">
            <FaInfoCircle className="text-5xl" />
          </div>
          <h2 className="text-2xl font-bold text-text">
            {t("universityRepresentative.studentAccessTitle", "University Representative Area")}
          </h2>
          <p className="mt-3 text-text-secondary leading-relaxed">
            {t(
              "universityRepresentative.studentAccessMessage",
              "This section is for university representatives only. If you are a student, you can continue using your profile and courses. If you want to request access as a representative, you need to create or switch to a representative account."
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
            <Link
              to="/profile"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition"
            >
              {t("profile.title", "My Profile")}
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg border border-border bg-surface text-text font-semibold hover:bg-surface/80 transition"
            >
              {t("auth.register.title", "Register")}
            </Link>
          </div>
        </div>
      </div>
    );
  }
  return (
    <RepApplicationForm
      t={t}
      request={request}
      isLoggedIn={isLoggedIn}
      userData={userData}
      onSubmitSuccess={() => {}}
    />
  );
}
