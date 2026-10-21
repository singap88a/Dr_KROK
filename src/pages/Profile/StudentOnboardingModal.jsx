import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  FaUser,
  FaPhone,
  FaCalendarAlt,
  FaVenusMars,
  FaGraduationCap,
  FaStethoscope,
  FaArrowRight,
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSearch,
  FaChevronDown,
  FaCheck,
  FaSpinner,
} from "react-icons/fa";
import { useApi } from "../../context/ApiContext";
import { toast } from "react-toastify";

export default function StudentOnboardingModal({
  isOpen,
  user,
  onComplete,
  onRedirectToProfile,
}) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar" || i18n.dir?.() === "rtl";
  const { request } = useApi();

  const [step, setStep] = useState(0);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    birth: user?.birth ? String(user.birth).split("T")[0] : "",
    gender: user?.gender || "",
    university_id: user?.university?.id || user?.university_id || "",
    college_year: user?.college_year || "",
    specialization_id: user?.specialization?.id || user?.specialization_id || "",
  });

  // Data lists
  const [universities, setUniversities] = useState([]);
  const [collegeYears, setCollegeYears] = useState([]);
  const [specializations, setSpecializations] = useState([]);
  const [uniSearch, setUniSearch] = useState("");
  const [specSearch, setSpecSearch] = useState("");
  const [uniDropdownOpen, setUniDropdownOpen] = useState(false);
  const [specDropdownOpen, setSpecDropdownOpen] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // Validation errors
  const [stepError, setStepError] = useState("");

  // Sync user if passed later
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || user.name || "",
        phone: prev.phone || user.phone || "",
        birth: prev.birth || (user.birth ? String(user.birth).split("T")[0] : ""),
        gender: prev.gender || user.gender || "",
        university_id: prev.university_id || user.university?.id || user.university_id || "",
        college_year: prev.college_year || user.college_year || "",
        specialization_id: prev.specialization_id || user.specialization?.id || user.specialization_id || "",
      }));
    }
  }, [user]);

  // Fetch dropdown data
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;

    const fetchAllData = async () => {
      try {
        setLoadingOptions(true);
        const [uniRes, yearsRes, specRes] = await Promise.allSettled([
          request("universities?page=1&per_page=100", { useCache: true }),
          request("college-years", { useCache: true }),
          request("specializations?page=1&per_page=100", { useCache: true }),
        ]);

        if (isMounted) {
          if (uniRes.status === "fulfilled" && uniRes.value?.data) {
            setUniversities(Array.isArray(uniRes.value.data) ? uniRes.value.data : []);
          }
          if (yearsRes.status === "fulfilled" && yearsRes.value) {
            const rawYears = yearsRes.value?.data || yearsRes.value;
            setCollegeYears(Array.isArray(rawYears) ? rawYears : []);
          }
          if (specRes.status === "fulfilled" && specRes.value?.data) {
            setSpecializations(Array.isArray(specRes.value.data) ? specRes.value.data : []);
          }
        }
      } catch (err) {
        console.warn("Failed to load onboarding options:", err);
      } finally {
        if (isMounted) setLoadingOptions(false);
      }
    };

    fetchAllData();
    return () => {
      isMounted = false;
    };
  }, [isOpen, request]);

  if (!isOpen) return null;

  // Steps Configuration
  const stepsConfig = [
    {
      id: "name",
      title: t("profile.onboarding.stepNameTitle", "What is your full name?"),
      subtitle: t(
        "profile.onboarding.stepNameSubtitle",
        "This name will appear on your certificates, progress reports, and profile."
      ),
      icon: FaUser,
    },
    {
      id: "phone",
      title: t("profile.onboarding.stepPhoneTitle", "Your Phone or WhatsApp Number"),
      subtitle: t(
        "profile.onboarding.stepPhoneSubtitle",
        "Required to verify your account and receive course updates and order details."
      ),
      icon: FaPhone,
    },
    {
      id: "birth",
      title: t("profile.onboarding.stepBirthTitle", "Date of Birth"),
      subtitle: t(
        "profile.onboarding.stepBirthSubtitle",
        "Select your birth date to configure and verify student details."
      ),
      icon: FaCalendarAlt,
    },
    {
      id: "gender",
      title: t("profile.onboarding.stepGenderTitle", "Gender"),
      subtitle: t(
        "profile.onboarding.stepGenderSubtitle",
        "Select your gender to customize your experience."
      ),
      icon: FaVenusMars,
    },
    {
      id: "university",
      title: t("profile.onboarding.stepUniTitle", "Which university do you study at?"),
      subtitle: t(
        "profile.onboarding.stepUniSubtitle",
        "Choose your university to connect the relevant curriculum and exams."
      ),
      icon: FaGraduationCap,
    },
    {
      id: "year",
      title: t("profile.onboarding.stepYearTitle", "Current Academic Year"),
      subtitle: t(
        "profile.onboarding.stepYearSubtitle",
        "Which academic stage or year are you currently in?"
      ),
      icon: FaCalendarAlt,
    },
    {
      id: "specialization",
      title: t("profile.onboarding.stepSpecTitle", "Medical Specialization (Optional)"),
      subtitle: t(
        "profile.onboarding.stepSpecSubtitle",
        "You can select your specialization now or skip and fill it later."
      ),
      icon: FaStethoscope,
      optional: true,
    },
  ];

  const totalSteps = stepsConfig.length;
  const currentStepConfig = stepsConfig[step] || stepsConfig[0];
  const StepIcon = currentStepConfig.icon;

  // Validation per step
  const validateCurrentStep = () => {
    setStepError("");
    const curId = currentStepConfig.id;

    if (curId === "name") {
      const val = formData.name.trim();
      if (!val) {
        setStepError(t("profile.validation.name_required", "Full name is required"));
        return false;
      }
      if (val.length < 3) {
        setStepError(t("profile.validation.name_short", "Full name must be at least 3 characters"));
        return false;
      }
    }

    if (curId === "phone") {
      const val = formData.phone.trim();
      if (!val) {
        setStepError(t("profile.validation.phone_required", "Phone number is required"));
        return false;
      }
      const digits = val.replace(/\D/g, "");
      if (digits.length < 8 || digits.length > 15) {
        setStepError(t("profile.validation.phone_length", "Phone number must be between 8 and 15 digits"));
        return false;
      }
    }

    if (curId === "birth") {
      const val = formData.birth;
      if (!val) {
        setStepError(t("profile.validation.birth_required", "Birth date is required"));
        return false;
      }
      const d = new Date(val);
      if (isNaN(d.getTime()) || d > new Date()) {
        setStepError(t("profile.validation.birth_future", "Birth date cannot be in the future"));
        return false;
      }
    }

    if (curId === "gender") {
      if (!formData.gender) {
        setStepError(t("profile.validation.gender_required", "Please select your gender"));
        return false;
      }
    }

    if (curId === "university") {
      if (!formData.university_id) {
        setStepError(t("profile.validation.university_required", "Please select your university"));
        return false;
      }
    }

    if (curId === "year") {
      if (!formData.college_year) {
        setStepError(t("profile.validation.college_year_required", "Please select your academic year"));
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    if (step < totalSteps - 1) {
      setStep((s) => s + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrev = () => {
    setStepError("");
    if (step > 0) {
      setStep((s) => s - 1);
    }
  };

  // Submit collected profile data
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setStepError("");

    try {
      const updateData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        birth: formData.birth,
        gender: formData.gender,
        university_id: parseInt(formData.university_id) || 0,
        college_year: formData.college_year,
      };

      if (formData.specialization_id) {
        updateData.specialization_id = parseInt(formData.specialization_id) || 0;
      }

      const res = await request("profile/update-my-profile", {
        method: "POST",
        auth: true,
        body: updateData,
        invalidateCacheOnSuccess: ["profile/get-my-profile", "profile/my-material"],
      });

      if (res?.success) {
        setIsSuccess(true);
        // Clear flags
        localStorage.removeItem("DR_KROK_show_completion_modal");
        localStorage.removeItem("DR_KROK_new_student_onboarding");

        const updatedUser = {
          ...(user || {}),
          ...res.data,
          university_id: res.data?.university?.id || res.data?.university_id || updateData.university_id,
        };

        toast.success(
          t("profile.onboarding.successToast", "🎉 Profile completed and account activated successfully!"),
          { position: "top-right", autoClose: 3500 }
        );

        setTimeout(() => {
          if (onComplete) onComplete(updatedUser);
        }, 1800);
      } else {
        setStepError(res?.message || t("profile.toast.update_fail", "Failed to update profile. Please check your data."));
      }
    } catch (err) {
      console.error("Onboarding submit error:", err);
      setStepError(err?.message || t("profile.toast.update_error", "An error occurred while saving details"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedUni = universities.find((u) => String(u.id) === String(formData.university_id));
  const selectedSpec = specializations.find((s) => String(s.id) === String(formData.specialization_id));

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-lg overflow-hidden bg-surface rounded-3xl shadow-2xl border border-border/80 flex flex-col max-h-[92vh]">
        {/* ─── Top Progress & Status Bar ───────────────────────────────── */}
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

        {/* ─── Main Modal Content / Step Body ─────────────────────────── */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
          {/* Success Screen */}
          {isSuccess ? (
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
          ) : showExitConfirm ? (
            /* Exit / Skip confirmation prompt */
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
                  onClick={() => setShowExitConfirm(false)}
                  className="flex-1 py-3 px-4 rounded-xl bg-primary text-white font-bold text-sm shadow-md hover:bg-primary/95 transition-all"
                >
                  {t("profile.onboarding.continueHere", "Continue with Quick Wizard (Recommended)")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowExitConfirm(false);
                    if (onRedirectToProfile) onRedirectToProfile();
                  }}
                  className="py-3 px-4 rounded-xl border border-border hover:bg-surface text-text font-semibold text-sm transition-all"
                >
                  {t("profile.onboarding.goToProfileNow", "Yes, Go to My Profile page")}
                </button>
              </div>
            </div>
          ) : (
            /* Step Questions */
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
                      placeholder={t("profile.onboarding.namePlaceholder", "e.g. Dr. John Doe / Olena Ivanenko")}
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
                    <span className="font-bold text-base text-text">
                      {t("profile.male", "Male")}
                    </span>
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
                    <span className="font-bold text-base text-text">
                      {t("profile.female", "Female")}
                    </span>
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
                      <span className={formData.university_id ? "font-semibold text-text" : "text-text-secondary"}>
                        {selectedUni ? selectedUni.name : t("profile.select_university", "Select University")}
                      </span>
                      <FaChevronDown className={`text-xs text-text-secondary transition-transform ${uniDropdownOpen ? "rotate-180" : ""}`} />
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
                            .filter((u) => !uniSearch || u.name.toLowerCase().includes(uniSearch.toLowerCase()))
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
                      <span className={formData.specialization_id ? "font-semibold text-text" : "text-text-secondary"}>
                        {selectedSpec ? selectedSpec.name : t("profile.select_specialization", "Select Specialization")}
                      </span>
                      <FaChevronDown className={`text-xs text-text-secondary transition-transform ${specDropdownOpen ? "rotate-180" : ""}`} />
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
                            .filter((s) => !specSearch || s.name.toLowerCase().includes(specSearch.toLowerCase()))
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
          )}
        </div>

        {/* ─── Footer Action Buttons ───────────────────────────────────── */}
        {!isSuccess && !showExitConfirm && (
          <div className="p-6 bg-surface border-t border-border/60 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              {step > 0 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="py-3.5 px-5 rounded-2xl border border-border hover:bg-background text-text font-bold text-sm transition-all"
                >
                  {t("common.back", "Back")}
                </button>
              )}

              <button
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
                className="flex-1 py-3.5 px-6 rounded-2xl bg-primary hover:bg-primary/95 text-white font-bold text-sm shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="animate-spin text-base" />
                    <span>{t("common.saving", "Saving...")}</span>
                  </>
                ) : step === totalSteps - 1 ? (
                  <>
                    <FaCheckCircle className="text-base" />
                    <span>{t("profile.onboarding.finishAndActivate", "Save & Activate Account")}</span>
                  </>
                ) : (
                  <>
                    <span>{t("common.next", "Next")}</span>
                    {isRtl ? <FaArrowLeft className="text-xs" /> : <FaArrowRight className="text-xs" />}
                  </>
                )}
              </button>
            </div>

            {/* Exit/Skip trigger button (shows warning) */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setShowExitConfirm(true)}
                className="text-xs text-text-secondary hover:text-primary transition-colors underline underline-offset-4"
              >
                {t(
                  "profile.onboarding.skipToProfileBtn",
                  "I want to complete my details later in My Profile"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
