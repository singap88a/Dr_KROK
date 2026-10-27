import React, { useState, useEffect } from "react";
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
  FaSpinner,
} from "react-icons/fa";
import { useApi } from "../../context/ApiContext";
import { toast } from "react-toastify";
import OnboardingProgressBar from "../../components/Profile/onboarding/OnboardingProgressBar";
import OnboardingSuccessScreen from "../../components/Profile/onboarding/OnboardingSuccessScreen";
import OnboardingExitConfirm from "../../components/Profile/onboarding/OnboardingExitConfirm";
import OnboardingStepFields from "../../components/Profile/onboarding/OnboardingStepFields";

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
  const [, setLoadingOptions] = useState(true);

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
        <OnboardingProgressBar
          StepIcon={StepIcon}
          step={step}
          totalSteps={totalSteps}
          stepsConfig={stepsConfig}
          t={t}
        />

        {/* ─── Main Modal Content / Step Body ─────────────────────────── */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6">
          {/* Success Screen */}
          {isSuccess ? (
            <OnboardingSuccessScreen t={t} />
          ) : showExitConfirm ? (
            /* Exit / Skip confirmation prompt */
            <OnboardingExitConfirm
              onContinue={() => setShowExitConfirm(false)}
              onRedirectToProfile={() => {
                setShowExitConfirm(false);
                if (onRedirectToProfile) onRedirectToProfile();
              }}
              t={t}
            />
          ) : (
            /* Step Questions */
            <OnboardingStepFields
              currentStepConfig={currentStepConfig}
              formData={formData}
              setFormData={setFormData}
              stepError={stepError}
              setStepError={setStepError}
              universities={universities}
              collegeYears={collegeYears}
              specializations={specializations}
              uniSearch={uniSearch}
              setUniSearch={setUniSearch}
              uniDropdownOpen={uniDropdownOpen}
              setUniDropdownOpen={setUniDropdownOpen}
              specSearch={specSearch}
              setSpecSearch={setSpecSearch}
              specDropdownOpen={specDropdownOpen}
              setSpecDropdownOpen={setSpecDropdownOpen}
              handleNext={handleNext}
              selectedUni={selectedUni}
              selectedSpec={selectedSpec}
              t={t}
            />
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
