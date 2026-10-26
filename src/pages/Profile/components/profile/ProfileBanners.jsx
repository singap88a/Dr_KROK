import React from "react";
import { useTranslation } from "react-i18next";
import { FaCheck, FaExclamationTriangle, FaGem } from "react-icons/fa";

export default function ProfileBanners({
  onboardingSuccessNotice,
  onboardingIncompleteNotice,
  user,
  codeAlreadyApplied,
  referralCode,
  setReferralCode,
  handleApplyReferralCode,
  referralLoading,
  isEditing,
  errorFields,
  errors,
  fieldLabel,
  focusField,
}) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {/* Onboarding Success Banner */}
      {onboardingSuccessNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3.5 shadow-sm animate-scale-in">
          <div className="p-2 rounded-xl bg-emerald-500 text-white shrink-0 mt-0.5">
            <FaCheck className="text-base" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-emerald-800 dark:text-emerald-300">
              {t("profile.onboarding.successBannerTitle", "Your Account is Active!")}
            </h4>
            <p className="text-xs sm:text-sm text-emerald-700/90 dark:text-emerald-400/90 leading-relaxed">
              {t(
                "profile.onboarding.successBannerDesc",
                "All your profile details have been saved and verified. If you need to update any information in the future, you can edit and save it from this page at any time."
              )}
            </p>
          </div>
        </div>
      )}

      {/* Onboarding Incomplete Warning Banner */}
      {onboardingIncompleteNotice && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3.5 shadow-sm animate-scale-in">
          <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0 mt-0.5">
            <FaExclamationTriangle className="text-base" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-amber-800 dark:text-amber-300">
              {t("profile.onboarding.incompleteBannerTitle", "Mandatory Notice: Please complete and save your profile details")}
            </h4>
            <p className="text-xs sm:text-sm text-amber-700/90 dark:text-amber-400/90 leading-relaxed">
              {t(
                "profile.onboarding.incompleteBannerDesc",
                "Please fill in the required fields (Phone Number, University, and Academic Year) and click 'Save Changes' to activate your account and purchase courses without limitations."
              )}
            </p>
          </div>
        </div>
      )}

      {/* Compact Referral Code Input Banner */}
      {user && (
        <div className="p-4 border rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm bg-primary/5 border-primary/20">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full shadow-inner flex-shrink-0 bg-primary/10 text-primary">
              {codeAlreadyApplied ? <FaCheck className="text-xl" /> : <FaGem className="text-xl" />}
            </div>
            <div>
              <h3 className="font-bold text-base text-primary">
                {codeAlreadyApplied 
                  ? t("points.code_already_applied", "Referral code already applied")
                  : t("points.have_referral", "Have a friend's referral code?")}
              </h3>
            </div>
          </div>
          {!codeAlreadyApplied && (
            <div className="w-full md:w-auto md:min-w-[300px]">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  placeholder={t("points.code_placeholder", "Enter referral code...")}
                  className="flex-1 px-3 py-2 text-sm border rounded-lg bg-background border-border focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                  onKeyDown={(e) => e.key === "Enter" && handleApplyReferralCode()}
                />
                <button
                  onClick={handleApplyReferralCode}
                  disabled={referralLoading || !referralCode.trim()}
                  className="px-5 py-2 text-sm font-bold text-white transition-all rounded-lg bg-primary hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:scale-105 active:scale-95 whitespace-nowrap"
                >
                  {referralLoading ? t("points.applying", "Applying...") : t("points.apply_code", "Apply")}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Validation summary banner */}
      {isEditing && errorFields.length > 0 && (
        <div
          role="alert"
          aria-live="assertive"
          className="p-4 border border-red-300 rounded-xl bg-red-50 dark:bg-red-900/20 dark:border-red-800 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-2 font-bold text-red-700 dark:text-red-300">
            <FaExclamationTriangle />
            {t("profile.validation.summary_title", { count: errorFields.length })}
          </div>
          <ul className="space-y-1 text-sm text-red-700 dark:text-red-300 list-disc ps-6">
            {errorFields.map((field) => (
              <li key={field}>
                <button
                  type="button"
                  onClick={() => focusField(field)}
                  className="text-start hover:underline"
                >
                  <strong>{fieldLabel(field)}:</strong> {errors[field]}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
