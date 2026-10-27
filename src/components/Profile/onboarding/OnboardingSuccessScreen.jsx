import React from "react";
import { FaCheckCircle, FaSpinner } from "react-icons/fa";

export default function OnboardingSuccessScreen({ t }) {
  return (
    <div className="py-8 text-center space-y-4 animate-scale-in">
      <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-4xl shadow-inner animate-bounce">
        <FaCheckCircle />
      </div>
      <h3 className="text-2xl font-bold text-text">
        {t("profile.onboarding.allDoneTitle", "🎉 Account Activated Successfully!")}
      </h3>
      <p className="text-sm text-text-secondary max-w-sm mx-auto leading-relaxed">
        {t(
          "profile.onboarding.allDoneSubtitle",
          "All your information has been saved and your account is now fully active. Redirecting you to your profile..."
        )}
      </p>
      <div className="pt-4 flex justify-center">
        <div className="inline-flex items-center gap-2 text-primary text-sm font-semibold">
          <FaSpinner className="animate-spin" />
          <span>{t("common.loading", "Loading...")}</span>
        </div>
      </div>
    </div>
  );
}
