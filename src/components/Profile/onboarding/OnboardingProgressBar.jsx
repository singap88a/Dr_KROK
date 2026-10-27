import React from "react";

export default function OnboardingProgressBar({
  StepIcon,
  step,
  totalSteps,
  stepsConfig,
  t,
}) {
  return (
    <div className="px-6 pt-6 pb-4 bg-gradient-to-b from-primary/10 via-surface to-surface border-b border-border/50">
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-primary text-white flex items-center justify-center text-sm shadow-sm">
            <StepIcon />
          </span>
          <div>
            <span className="text-[11px] font-bold text-primary uppercase tracking-wider block">
              {t("profile.onboarding.setupBadge", "New Student Account Setup")}
            </span>
            <span className="text-xs font-semibold text-text-secondary">
              {t("profile.onboarding.stepCounter", "Step {{current}} of {{total}}", {
                current: step + 1,
                total: totalSteps,
              })}
            </span>
          </div>
        </div>

        {/* Step Pills */}
        <div className="flex items-center gap-1.5">
          {stepsConfig.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step
                  ? "w-6 bg-primary"
                  : i < step
                  ? "w-2 bg-primary/70"
                  : "w-2 bg-border"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-border/60 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-primary h-full transition-all duration-300"
          style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );
}
