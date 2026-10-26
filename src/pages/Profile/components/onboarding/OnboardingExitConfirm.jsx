import React from "react";
import { FaExclamationTriangle } from "react-icons/fa";

export default function OnboardingExitConfirm({
  onContinue,
  onRedirectToProfile,
  t,
}) {
  return (
    <div className="py-4 text-center space-y-5 animate-scale-in">
      <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/15 text-amber-500 flex items-center justify-center text-3xl">
        <FaExclamationTriangle />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg sm:text-xl font-bold text-text">
          {t("profile.onboarding.exitWarningTitle", "Are you sure you want to complete this later?")}
        </h3>
        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-md mx-auto">
          {t(
            "profile.onboarding.exitWarningDesc",
            "Completing your details is required to activate your account and unlock courses and material purchases without restrictions. You can complete them now in seconds, or head straight to 'Edit Profile' to enter them there."
          )}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="button"
          onClick={onContinue}
          className="flex-1 py-3 px-4 rounded-xl bg-primary text-white font-bold text-sm shadow-md hover:bg-primary/95 transition-all"
        >
          {t("profile.onboarding.continueHere", "Continue with Quick Wizard (Recommended)")}
        </button>
        <button
          type="button"
          onClick={onRedirectToProfile}
          className="py-3 px-4 rounded-xl border border-border hover:bg-surface text-text font-semibold text-sm transition-all"
        >
          {t("profile.onboarding.goToProfileNow", "Yes, Go to My Profile page")}
        </button>
      </div>
    </div>
  );
}
