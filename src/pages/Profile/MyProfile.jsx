import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { FaLock, FaEdit, FaSave, FaTimes } from "react-icons/fa";
import { useApi } from "../../context/ApiContext";
import ChangePasswordModal from "./ChangePasswordModal";

// Modular Sub-Components
import {
  FIELD_ORDER,
  validateField,
  validateProfileForm,
  extractBackendFieldErrors,
  translateBackendError,
  formatSocialUrl,
  formatDateForInput,
} from "../../components/Profile/profile/profileValidation";
import ProfileBanners from "../../components/Profile/profile/ProfileBanners";
import ProfileAvatarCard from "../../components/Profile/profile/ProfileAvatarCard";
import ProfileDetailsForm from "../../components/Profile/profile/ProfileDetailsForm";
import ProfilePointsSection from "../../components/Profile/profile/ProfilePointsSection";

export default function MyProfile({
  user,
  onProfileUpdate,
  initialIsEditing = false,
  onboardingSuccessNotice = false,
  onboardingIncompleteNotice = false,
}) {
  const { t } = useTranslation();
  const { request } = useApi();

  const [isEditing, setIsEditing] = useState(initialIsEditing);
  const [loading, setLoading] = useState(false);
  const [localUser, setLocalUser] = useState(user);

  // Password Modal
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Points & Referral States
  const [referralCode, setReferralCode] = useState("");
  const [referralLoading, setReferralLoading] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [codeAlreadyApplied, setCodeAlreadyApplied] = useState(() => {
    if (user?.code_add_invite_friend) return true;
    return localStorage.getItem(`DR_KROK_referral_applied_${user?.id}`) === "true";
  });

  // Form Data State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    birth: "",
    gender: "",
    university_id: "",
    college_year: "",
    specialization_id: "",
    image: null,
    facebook: "",
    instagram: "",
    telegram: "",
    whatsapp: "",
  });
  const [imagePreview, setImagePreview] = useState("");

  // Universities Dropdown State
  const [universities, setUniversities] = useState([]);
  const [uniPage, setUniPage] = useState(1);
  const [uniTotalPages, setUniTotalPages] = useState(1);
  const [uniLoading, setUniLoading] = useState(false);
  const [uniSearch, setUniSearch] = useState("");
  const [uniDropdownOpen, setUniDropdownOpen] = useState(false);
  const uniDropdownRef = useRef(null);

  // Specializations Dropdown State
  const [specializations, setSpecializations] = useState([]);
  const [specPage, setSpecPage] = useState(1);
  const [specTotalPages, setSpecTotalPages] = useState(1);
  const [specLoading, setSpecLoading] = useState(false);
  const [specSearch, setSpecSearch] = useState("");
  const [specDropdownOpen, setSpecDropdownOpen] = useState(false);
  const specDropdownRef = useRef(null);

  // College Years
  const [collegeYears, setCollegeYears] = useState([]);

  // Errors State
  const [errors, setErrors] = useState({});
  const errorFields = FIELD_ORDER.filter((f) => errors[f]);

  useEffect(() => {
    if (user?.code_add_invite_friend) {
      setCodeAlreadyApplied(true);
    }
  }, [user]);

  useEffect(() => {
    if (initialIsEditing) {
      setIsEditing(true);
    }
  }, [initialIsEditing]);

  // Click outside listener for custom dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (uniDropdownRef.current && !uniDropdownRef.current.contains(e.target)) {
        setUniDropdownOpen(false);
      }
      if (specDropdownRef.current && !specDropdownRef.current.contains(e.target)) {
        setSpecDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch dropdown options
  const fetchUniversities = async (page = 1, append = false) => {
    try {
      setUniLoading(true);
      const res = await request(`universities?page=${page}`, { method: "GET" });
      if (res?.data) {
        const list = res.data.data || res.data || [];
        setUniversities((prev) => (append ? [...prev, ...list] : list));
        setUniTotalPages(res.data.last_page || 1);
        setUniPage(page);
      }
    } catch (err) {
      console.warn("Failed to fetch universities:", err);
    } finally {
      setUniLoading(false);
    }
  };

  const fetchSpecializations = async (page = 1, append = false) => {
    try {
      setSpecLoading(true);
      const res = await request(`specializations?page=${page}`, { method: "GET" });
      if (res?.data) {
        const list = res.data.data || res.data || [];
        setSpecializations((prev) => (append ? [...prev, ...list] : list));
        setSpecTotalPages(res.data.last_page || 1);
        setSpecPage(page);
      }
    } catch (err) {
      console.warn("Failed to fetch specializations:", err);
    } finally {
      setSpecLoading(false);
    }
  };

  const fetchCollegeYears = async () => {
    try {
      const res = await request("college-years", { method: "GET" });
      if (res?.data) {
        setCollegeYears(res.data.data || res.data || []);
      }
    } catch (err) {
      console.warn("Failed to fetch college years:", err);
    }
  };

  useEffect(() => {
    fetchUniversities();
    fetchSpecializations();
    fetchCollegeYears();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync user prop to local state
  useEffect(() => {
    if (user) {
      setLocalUser(user);
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        birth: user.birth ? formatDateForInput(user.birth) : "",
        gender: user.gender || "",
        university_id: user.university?.id || user.university_id || "",
        college_year: user.college_year || "",
        specialization_id: user.specialization?.id || user.specialization_id || "",
        image: null,
        facebook: user.facebook || "",
        instagram: user.instagram || "",
        telegram: user.telegram || "",
        whatsapp: user.whatsapp || "",
      });

      if (user.imageprofile) {
        setImagePreview(user.imageprofile);
      } else {
        setImagePreview("/user.png");
      }
    }
  }, [user]);

  // Form label & classes helpers
  const fieldLabel = (field) =>
    ({
      name: t("profile.full_name"),
      email: t("profile.email_address"),
      phone: t("profile.phone_number"),
      birth: t("profile.birth_date"),
      gender: t("profile.gender"),
      university_id: t("profile.university"),
      college_year: t("profile.college_year"),
      specialization_id: t("profile.specialization"),
      facebook: "Facebook",
      instagram: "Instagram",
      telegram: "Telegram",
      whatsapp: "WhatsApp",
    }[field] || field);

  const fieldId = (field) => `profile-field-${field}`;
  const errorId = (field) => `profile-error-${field}`;

  const fieldClass = (field, base = "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2") =>
    `${base} transition-colors ${
      errors[field]
        ? "border-red-500 bg-red-50 dark:bg-red-900/10 focus:ring-red-400 text-red-900 dark:text-red-200"
        : "border-border bg-background focus:ring-primary"
    }`;

  const labelClass = (field, base = "block mb-2 text-sm font-bold") =>
    `${base} ${errors[field] ? "text-red-600 dark:text-red-400" : "text-text-primary"}`;

  const a11yProps = (field) => ({
    id: fieldId(field),
    "aria-invalid": !!errors[field],
    "aria-describedby": errors[field] ? errorId(field) : undefined,
  });

  const focusField = (field) => {
    setTimeout(() => {
      const el = document.getElementById(fieldId(field));
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.focus({ preventScroll: true });
      }
    }, 80);
  };

  const showValidationErrors = (errs) => {
    setErrors(errs);
    const fields = FIELD_ORDER.filter((f) => errs[f]);
    if (fields.length === 0) return;
    if (fields.length === 1) {
      toast.error(`${fieldLabel(fields[0])}: ${errs[fields[0]]}`);
    } else {
      toast.error(
        t("profile.validation.toast_multiple", {
          count: fields.length,
          fields: fields.map(fieldLabel).join(", "),
        })
      );
    }
    focusField(fields[0]);
  };

  const handleBackendError = (payload, message) => {
    const fieldErrors = extractBackendFieldErrors(payload, message, t);
    if (Object.keys(fieldErrors).length > 0) {
      setIsEditing(true);
      showValidationErrors(fieldErrors);
    } else {
      toast.error(translateBackendError(message || payload?.message || t("profile.toast.update_fail"), t));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      const msg = validateField(name, value, t);
      if (msg) next[name] = msg;
      else delete next[name];
      return next;
    });
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (!value || !String(value).trim()) return;
    const msg = validateField(name, value, t);
    setErrors((prev) => {
      const next = { ...prev };
      if (msg) next[name] = msg;
      else delete next[name];
      return next;
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error(t("profile.toast.image_type", "Please select an image file"));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(t("profile.toast.image_size", "Image size should be less than 5MB"));
        return;
      }
      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreview(ev.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!formData.image) return null;
    const imageFormData = new FormData();
    imageFormData.append("imageprofile", formData.image);
    try {
      const data = await request("profile/updateImage", {
        method: "POST",
        auth: true,
        isFormData: true,
        body: imageFormData,
      });
      if (data.success) {
        toast.success(t("profile.toast.image_uploaded"));
        return (
          data.data?.imageprofile ||
          data.imageprofile ||
          data.data?.image_url ||
          data.image_url ||
          imagePreview
        );
      } else {
        toast.error(data.message || t("profile.toast.image_upload_fail"));
        return null;
      }
    } catch (err) {
      console.error("Image upload error:", err);
      toast.error(t("profile.toast.image_upload_fail"));
      return null;
    }
  };

  const handleCopyCode = async () => {
    const code = user?.code_for_client;
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    } catch {
      const el = document.createElement("textarea");
      el.value = code;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  const handleApplyReferralCode = async () => {
    if (!referralCode.trim()) return;
    if (codeAlreadyApplied) {
      toast.info(t("points.code_already_applied"));
      return;
    }

    const validationErrors = validateProfileForm(formData, t);
    if (Object.keys(validationErrors).length > 0) {
      toast.info(t("profile.validation.complete_before_referral"));
      setIsEditing(true);
      showValidationErrors(validationErrors);
      return;
    }

    setReferralLoading(true);
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        birth: formData.birth,
        gender: formData.gender,
        university_id: formData.university_id,
        college_year: formData.college_year,
        specialization_id: formData.specialization_id || undefined,
        code_add_invite_friend: referralCode.trim(),
      };

      const res = await request("profile/update-my-profile", {
        method: "POST",
        auth: true,
        body: payload,
      });

      if (res.success) {
        toast.success(t("points.code_applied_success"));
        setCodeAlreadyApplied(true);
        localStorage.setItem(`DR_KROK_referral_applied_${user?.id}`, "true");
        if (res.data) {
          setLocalUser(res.data);
          if (onProfileUpdate) onProfileUpdate(res.data);
        }
        setReferralCode("");
      } else {
        handleBackendError(res, res.message || t("points.code_apply_failed"));
      }
    } catch (err) {
      console.error("Referral apply error:", err);
      handleBackendError(err?.data, err?.message || t("points.code_apply_failed"));
    } finally {
      setReferralLoading(false);
    }
  };

  const handleSave = async () => {
    const validationErrors = validateProfileForm(formData, t);
    if (Object.keys(validationErrors).length > 0) {
      showValidationErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      let imageUrl = null;
      if (formData.image) {
        imageUrl = await handleImageUpload();
        if (!imageUrl) {
          setLoading(false);
          return;
        }
      }

      const updateData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        birth: formData.birth,
        gender: formData.gender,
        university_id: formData.university_id,
        college_year: formData.college_year,
        specialization_id: formData.specialization_id || undefined,
        facebook: formatSocialUrl(formData.facebook, "facebook.com"),
        instagram: formatSocialUrl(formData.instagram, "instagram.com"),
        telegram: formatSocialUrl(formData.telegram, "t.me"),
        whatsapp: formatSocialUrl(formData.whatsapp, "wa.me"),
      };

      Object.keys(updateData).forEach((key) => {
        if (
          updateData[key] === null ||
          updateData[key] === undefined ||
          updateData[key] === "" ||
          (typeof updateData[key] === "number" && isNaN(updateData[key]))
        ) {
          delete updateData[key];
        }
      });

      const data = await request("profile/update-my-profile", {
        method: "POST",
        auth: true,
        body: updateData,
        invalidateCacheOnSuccess: ["profile/my-material", "profile/get-my-profile"],
      });

      if (data.success) {
        toast.success(t("profile.toast.updated"));
        const updatedUser = {
          ...data.data,
          university_id: data.data.university?.id || data.data.university_id,
        };

        setLocalUser(() => ({
          ...updatedUser,
          imageprofile: imageUrl || updatedUser.imageprofile,
        }));

        if (onProfileUpdate && typeof onProfileUpdate === "function") {
          onProfileUpdate(updatedUser);
        }

        setErrors({});
        setIsEditing(false);
      } else {
        handleBackendError(data, data.message || t("profile.toast.update_fail"));
      }
    } catch (error) {
      console.error("Profile update error:", error);
      handleBackendError(error?.data, error?.message || t("profile.toast.update_error"));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        birth: user.birth ? formatDateForInput(user.birth) : "",
        gender: user.gender || "",
        university_id: user.university?.id || user.university_id || "",
        college_year: user.college_year || "",
        specialization_id: user.specialization?.id || user.specialization_id || "",
        image: null,
        facebook: user.facebook || "",
        instagram: user.instagram || "",
        telegram: user.telegram || "",
        whatsapp: user.whatsapp || "",
      });

      if (user.imageprofile) {
        setImagePreview(user.imageprofile);
      } else {
        setImagePreview("/user.png");
      }
    }
    setErrors({});
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 rounded-full border-primary border-t-transparent animate-spin" />
          <p className="text-text-secondary">{t("profile.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-10 space-y-6">
      {/* Top Header & Edit/Save Buttons */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t("profile.title")}</h2>
        {!isEditing ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="flex items-center justify-center w-full gap-2 px-4 py-2 text-white transition-colors rounded-lg bg-primary hover:bg-secondary sm:w-auto"
            >
              <FaLock className="text-sm" />
              {t("profile.password.change")}
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center justify-center w-full gap-2 px-4 py-2 text-white transition-colors rounded-lg bg-primary hover:bg-secondary sm:w-auto"
            >
              <FaEdit className="text-sm" />
              {t("profile.edit")}
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center justify-center w-full gap-2 px-4 py-2 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 sm:w-auto"
            >
              <FaSave className="text-sm" />
              {loading ? t("profile.saving") : t("profile.save")}
            </button>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="flex items-center justify-center w-full gap-2 px-4 py-2 text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 sm:w-auto"
            >
              <FaTimes className="text-sm" />
              {t("profile.cancel")}
            </button>
          </div>
        )}
      </div>

      {/* Profile Banners (Onboarding, Referral, Validation Summary) */}
      <ProfileBanners
        onboardingSuccessNotice={onboardingSuccessNotice}
        onboardingIncompleteNotice={onboardingIncompleteNotice}
        user={user}
        codeAlreadyApplied={codeAlreadyApplied}
        referralCode={referralCode}
        setReferralCode={setReferralCode}
        handleApplyReferralCode={handleApplyReferralCode}
        referralLoading={referralLoading}
        isEditing={isEditing}
        errorFields={errorFields}
        errors={errors}
        fieldLabel={fieldLabel}
        focusField={focusField}
      />

      {/* Main Grid: Avatar/Social on Left, Details Form on Right */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <ProfileAvatarCard
          user={user}
          localUser={localUser}
          isEditing={isEditing}
          imagePreview={imagePreview}
          handleImageChange={handleImageChange}
          formData={formData}
          handleInputChange={handleInputChange}
          handleBlur={handleBlur}
          errors={errors}
          fieldClass={fieldClass}
          errorId={errorId}
          a11yProps={a11yProps}
        />

        <ProfileDetailsForm
          user={user}
          localUser={localUser}
          isEditing={isEditing}
          formData={formData}
          handleInputChange={handleInputChange}
          handleBlur={handleBlur}
          errors={errors}
          fieldClass={fieldClass}
          labelClass={labelClass}
          errorId={errorId}
          fieldId={fieldId}
          a11yProps={a11yProps}
          specializations={specializations}
          specDropdownOpen={specDropdownOpen}
          setSpecDropdownOpen={setSpecDropdownOpen}
          specDropdownRef={specDropdownRef}
          specSearch={specSearch}
          setSpecSearch={setSpecSearch}
          specPage={specPage}
          specTotalPages={specTotalPages}
          specLoading={specLoading}
          fetchSpecializations={fetchSpecializations}
          universities={universities}
          uniDropdownOpen={uniDropdownOpen}
          setUniDropdownOpen={setUniDropdownOpen}
          uniDropdownRef={uniDropdownRef}
          uniSearch={uniSearch}
          setUniSearch={setUniSearch}
          uniPage={uniPage}
          uniTotalPages={uniTotalPages}
          uniLoading={uniLoading}
          fetchUniversities={fetchUniversities}
          collegeYears={collegeYears}
        />
      </div>

      {/* Points & Referral Section */}
      <ProfilePointsSection
        user={user}
        codeCopied={codeCopied}
        handleCopyCode={handleCopyCode}
      />

      {/* Password Change Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
}
