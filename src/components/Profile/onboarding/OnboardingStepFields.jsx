import React from "react";
import {
  FaCheck,
  FaChevronDown,
  FaSearch,
  FaExclamationTriangle,
} from "react-icons/fa";

export default function OnboardingStepFields({
  currentStepConfig,
  formData,
  setFormData,
  stepError,
  setStepError,
  universities,
  collegeYears,
  specializations,
  uniSearch,
  setUniSearch,
  uniDropdownOpen,
  setUniDropdownOpen,
  specSearch,
  setSpecSearch,
  specDropdownOpen,
  setSpecDropdownOpen,
  handleNext,
  selectedUni,
  selectedSpec,
  t,
}) {
  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="space-y-1.5">
        <h2 className="text-xl sm:text-2xl font-bold text-text flex items-center gap-2">
          <span>{currentStepConfig.title}</span>
          {currentStepConfig.optional && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-normal">
              {t("common.optional", "Optional")}
            </span>
          )}
        </h2>
        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
          {currentStepConfig.subtitle}
        </p>
      </div>

      {/* Step 0: Name */}
      {currentStepConfig.id === "name" && (
        <div className="space-y-2">
          <div className="relative">
            <input
              type="text"
              autoFocus
              value={formData.name}
              onChange={(e) => {
                setFormData((p) => ({ ...p, name: e.target.value }));
                if (stepError) setStepError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleNext()}
              placeholder={t(
                "profile.onboarding.namePlaceholder",
                "e.g. Dr. John Doe / Olena Ivanenko"
              )}
              className="w-full px-4 py-3.5 rounded-2xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-base text-text outline-none transition-all"
            />
          </div>
        </div>
      )}

      {/* Step 1: Phone */}
      {currentStepConfig.id === "phone" && (
        <div className="space-y-2">
          <div className="relative">
            <input
              type="tel"
              autoFocus
              dir="ltr"
              value={formData.phone}
              onChange={(e) => {
                setFormData((p) => ({ ...p, phone: e.target.value }));
                if (stepError) setStepError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleNext()}
              placeholder="+380... / +20..."
              className="w-full px-4 py-3.5 rounded-2xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-base text-text outline-none transition-all text-left"
            />
          </div>
          <p className="text-[11px] text-text-secondary">
            {t("profile.onboarding.phoneHint", "Include your country code, e.g., +380 or +20")}
          </p>
        </div>
      )}

      {/* Step 2: Birth */}
      {currentStepConfig.id === "birth" && (
        <div className="space-y-2">
          <div className="relative">
            <input
              type="date"
              autoFocus
              value={formData.birth}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => {
                setFormData((p) => ({ ...p, birth: e.target.value }));
                if (stepError) setStepError("");
              }}
              className="w-full px-4 py-3.5 rounded-2xl bg-background border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 text-base text-text outline-none transition-all"
            />
          </div>
        </div>
      )}

      {/* Step 3: Gender */}
      {currentStepConfig.id === "gender" && (
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => {
              setFormData((p) => ({ ...p, gender: "male" }));
              if (stepError) setStepError("");
            }}
            className={`p-6 rounded-2xl border text-center transition-all flex flex-col items-center gap-3 ${
              formData.gender === "male"
                ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/30"
                : "border-border bg-background hover:border-primary/50"
            }`}
          >
            <span className="text-3xl">👨</span>
            <span className="font-bold text-base text-text">{t("profile.male", "Male")}</span>
            {formData.gender === "male" && (
              <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                <FaCheck />
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setFormData((p) => ({ ...p, gender: "female" }));
              if (stepError) setStepError("");
            }}
            className={`p-6 rounded-2xl border text-center transition-all flex flex-col items-center gap-3 ${
              formData.gender === "female"
                ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/30"
                : "border-border bg-background hover:border-primary/50"
            }`}
          >
            <span className="text-3xl">👩</span>
            <span className="font-bold text-base text-text">{t("profile.female", "Female")}</span>
            {formData.gender === "female" && (
              <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                <FaCheck />
              </span>
            )}
          </button>
        </div>
      )}

      {/* Step 4: University */}
      {currentStepConfig.id === "university" && (
        <div className="space-y-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setUniDropdownOpen((o) => !o)}
              className="w-full flex items-center justify-between px-4 py-3.5 border rounded-2xl bg-background border-border text-left"
            >
              <span
                className={formData.university_id ? "font-semibold text-text" : "text-text-secondary"}
              >
                {selectedUni ? selectedUni.name : t("profile.select_university", "Select University")}
              </span>
              <FaChevronDown
                className={`text-xs text-text-secondary transition-transform ${
                  uniDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {uniDropdownOpen && (
              <div className="absolute z-50 w-full mt-2 bg-surface border border-border rounded-2xl shadow-xl max-h-56 flex flex-col overflow-hidden">
                <div className="p-2 border-b border-border flex items-center gap-2 bg-background">
                  <FaSearch className="text-xs text-text-secondary shrink-0" />
                  <input
                    type="text"
                    value={uniSearch}
                    onChange={(e) => setUniSearch(e.target.value)}
                    placeholder={t("profile.search_university", "Search university...")}
                    className="flex-1 text-sm bg-transparent outline-none text-text"
                    autoFocus
                  />
                </div>
                <ul className="overflow-y-auto flex-1 divide-y divide-border/40">
                  {universities
                    .filter(
                      (u) =>
                        !uniSearch || u.name.toLowerCase().includes(uniSearch.toLowerCase())
                    )
                    .map((u) => (
                      <li key={u.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((p) => ({ ...p, university_id: u.id }));
                            setUniDropdownOpen(false);
                            setUniSearch("");
                            if (stepError) setStepError("");
                          }}
                          className={`w-full px-4 py-3 text-sm text-start transition-colors hover:bg-primary/10 ${
                            String(formData.university_id) === String(u.id)
                              ? "bg-primary/15 font-bold text-primary"
                              : "text-text"
                          }`}
                        >
                          {u.name}
                        </button>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 5: College Year */}
      {currentStepConfig.id === "year" && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {(collegeYears.length > 0
              ? collegeYears
              : [
                  { id: "1", name: t("profile.year1", "First Year") },
                  { id: "2", name: t("profile.year2", "Second Year") },
                  { id: "3", name: t("profile.year3", "Third Year") },
                  { id: "4", name: t("profile.year4", "Fourth Year") },
                  { id: "5", name: t("profile.year5", "Fifth Year") },
                  { id: "6", name: t("profile.year6", "Sixth Year") },
                ]
            ).map((y) => (
              <button
                key={y.id}
                type="button"
                onClick={() => {
                  setFormData((p) => ({ ...p, college_year: y.id }));
                  if (stepError) setStepError("");
                }}
                className={`p-4 rounded-2xl border text-center font-bold text-sm transition-all ${
                  String(formData.college_year) === String(y.id)
                    ? "border-primary bg-primary text-white shadow-md"
                    : "border-border bg-background text-text hover:border-primary/50"
                }`}
              >
                {y.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Step 6: Specialization (Optional) */}
      {currentStepConfig.id === "specialization" && (
        <div className="space-y-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setSpecDropdownOpen((o) => !o)}
              className="w-full flex items-center justify-between px-4 py-3.5 border rounded-2xl bg-background border-border text-left"
            >
              <span
                className={
                  formData.specialization_id ? "font-semibold text-text" : "text-text-secondary"
                }
              >
                {selectedSpec
                  ? selectedSpec.name
                  : t("profile.select_specialization", "Select Specialization")}
              </span>
              <FaChevronDown
                className={`text-xs text-text-secondary transition-transform ${
                  specDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {specDropdownOpen && (
              <div className="absolute z-50 w-full mt-2 bg-surface border border-border rounded-2xl shadow-xl max-h-56 flex flex-col overflow-hidden">
                <div className="p-2 border-b border-border flex items-center gap-2 bg-background">
                  <FaSearch className="text-xs text-text-secondary shrink-0" />
                  <input
                    type="text"
                    value={specSearch}
                    onChange={(e) => setSpecSearch(e.target.value)}
                    placeholder={t("profile.search_specialization", "Search specialization...")}
                    className="flex-1 text-sm bg-transparent outline-none text-text"
                    autoFocus
                  />
                </div>
                <ul className="overflow-y-auto flex-1 divide-y divide-border/40">
                  {specializations
                    .filter(
                      (s) =>
                        !specSearch || s.name.toLowerCase().includes(specSearch.toLowerCase())
                    )
                    .map((s) => (
                      <li key={s.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((p) => ({ ...p, specialization_id: s.id }));
                            setSpecDropdownOpen(false);
                            setSpecSearch("");
                          }}
                          className={`w-full px-4 py-3 text-sm text-start transition-colors hover:bg-primary/10 ${
                            String(formData.specialization_id) === String(s.id)
                              ? "bg-primary/15 font-bold text-primary"
                              : "text-text"
                          }`}
                        >
                          {s.name}
                        </button>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error Message if validation fails */}
      {stepError && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2 animate-shake">
          <FaExclamationTriangle className="shrink-0" />
          <span>{stepError}</span>
        </div>
      )}
    </div>
  );
}
