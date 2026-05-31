import React from "react";
import { FaHourglassHalf } from "react-icons/fa";

export default function RepPendingStatus({ t, repId, onRefresh }) {
  return (
    <div className="container px-4 py-24 mx-auto max-w-xl animate-fadeIn">
      <div className="p-10 border border-border bg-surface rounded-2xl shadow-2xl text-center space-y-6">
        <div className="w-24 h-24 mx-auto bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center animate-pulse">
          <FaHourglassHalf className="text-4xl" />
        </div>
        <h2 className="text-3xl font-bold text-text">
          {t("universityRepresentative.pendingTitle", "Application Pending")}
        </h2>
        <p className="text-text-secondary leading-relaxed text-lg">
          {t(
            "universityRepresentative.pendingMessage",
            "Your request has been submitted successfully. We will review it shortly."
          )}
        </p>
        <div className="pt-6 border-t border-border flex justify-center">
          <button
            onClick={() => onRefresh(repId)}
            className="px-6 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary/95 transition"
          >
            {t("common.retry", "Refresh Status")}
          </button>
        </div>
      </div>
    </div>
  );
}
