import React from "react";
import { FaTimesCircle } from "react-icons/fa";

export default function RepRejectedStatus({ t, onReapply }) {
  return (
    <div className="container px-4 py-24 mx-auto max-w-xl animate-fadeIn">
      <div className="p-10 border border-red-500/20 bg-surface rounded-2xl shadow-2xl text-center space-y-6">
        <div className="w-24 h-24 mx-auto bg-red-500/10 text-red-500 rounded-full flex items-center justify-center">
          <FaTimesCircle className="text-5xl" />
        </div>
        <h2 className="text-3xl font-bold text-text">
          {t("universityRepresentative.rejectedTitle", "Application Rejected")}
        </h2>
        <p className="text-text-secondary leading-relaxed text-lg">
          {t(
            "universityRepresentative.rejectedMessage",
            "Representative request status is rejected. You can submit a new application with corrected details."
          )}
        </p>
        <div className="pt-6 border-t border-border">
          <button
            onClick={onReapply}
            className="px-8 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-lg transition-all"
          >
            {t("universityRepresentative.reapply", "Submit New Application")}
          </button>
        </div>
      </div>
    </div>
  );
}
