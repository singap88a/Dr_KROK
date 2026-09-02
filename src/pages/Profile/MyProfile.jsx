import React, { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaEdit,
  FaCamera,
  FaSave,
  FaTimes,
  FaCalendarAlt,
  FaVenusMars,
  FaGraduationCap,
  FaLock,
  FaFacebook,
  FaInstagram,
  FaTelegram,
  FaWhatsapp,
  FaSearch,
  FaChevronDown,
  FaBook,
  FaStethoscope,
  FaCopy,
  FaCoins,
  FaStore,
  FaCheck,
  FaGem,
  FaTag,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { useApi } from "../../context/ApiContext";
import { useTranslation } from "react-i18next";
import ChangePasswordModal from "./ChangePasswordModal";

// Helper function to format date for display as YYYY-MM-DD
const formatDateForDisplay = (dateString) => {
  if (!dateString) return "Not provided";

  // Handle different date formats from API
  const dateParts = dateString.split('-');
  if (dateParts.length === 3) {
    // If date is in format "dd-MM-yyyy" or "MM-dd-yyyy"
    if (dateParts[0].length === 2 && dateParts[1].length === 2) {
      // Assume format is "dd-MM-yyyy"
      return `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
    }
    // If date is in format "yyyy-MM-dd"
    return dateString;
  }

  // Fallback: try to parse as Date object
  const date = new Date(dateString);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0];
  }

  // If all parsing fails, return the original string
  return dateString;
};

const MyProfile = ({ user, onProfileUpdate, initialIsEditing = false }) => {
  const [isEditing, setIsEditing] = useState(initialIsEditing);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Points & referral states
  const [referralCode, setReferralCode] = useState("");
  const [referralLoading, setReferralLoading] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [codeAlreadyApplied, setCodeAlreadyApplied] = useState(() => {
    return localStorage.getItem("DR_KROK_referral_applied") === "true";
  });

  useEffect(() => {
    if (initialIsEditing) {
      setIsEditing(true);
    }
  }, [initialIsEditing]);
  const [universities, setUniversities] = useState([]);
  const [uniPage, setUniPage] = useState(1);
  const [uniTotalPages, setUniTotalPages] = useState(1);
  const [uniLoading, setUniLoading] = useState(false);
  const [uniSearch, setUniSearch] = useState("");
  const [uniDropdownOpen, setUniDropdownOpen] = useState(false);
  const uniDropdownRef = useRef(null);
  const [collegeYears, setCollegeYears] = useState([]);
  const [localUser, setLocalUser] = useState(user);
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



  const [specializations, setSpecializations] = useState([]);
  const [specPage, setSpecPage] = useState(1);
  const [specTotalPages, setSpecTotalPages] = useState(1);
  const [specLoading, setSpecLoading] = useState(false);
  const [specSearch, setSpecSearch] = useState("");
  const [specDropdownOpen, setSpecDropdownOpen] = useState(false);
  const specDropdownRef = useRef(null);
  const [imagePreview, setImagePreview] = useState("");
  const { t, i18n } = useTranslation();

  const { request, getAuthToken } = useApi();

  // State for password change modal
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Copy referral code to clipboard
  const handleCopyCode = async () => {
    const code = user?.code_for_client;
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    } catch {
      // fallback
      const el = document.createElement('textarea');
      el.value = code;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  // Apply friend's referral code
  const handleApplyReferralCode = async () => {
    if (!referralCode.trim()) return;
    if (codeAlreadyApplied) {
      toast.info(t('points.code_already_applied'));
      return;
    }
    
    // Since we are using the update-profile API, we MUST ensure all required fields are present
    if (!formData.name || !formData.email || !formData.phone || !formData.birth || !formData.gender) {
      toast.error(t('profile.toast.all_fields_required', 'All primary profile fields (like birth date) are required before applying the code!'));
      return;
    }
    
    if (!formData.university_id) {
      toast.error(t('profile.toast.select_university'));
      return;
    }
    
    if (!formData.college_year) {
      toast.error(t('profile.toast.select_college_year'));
      return;
    }

    setReferralLoading(true);
    try {
      // Build the same updateData payload used by the normal save function
      // because the backend requires all fields to be present.
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || "",
        birth: formData.birth || "",
        gender: formData.gender || "",
        university_id: parseInt(formData.university_id) || 0,
        college_year: formData.college_year,
        specialization_id: parseInt(formData.specialization_id) || 0,
        facebook: formData.facebook || "",
        instagram: formData.instagram || "",
        telegram: formData.telegram || "",
        whatsapp: formData.whatsapp || "",
        // The specific field name required by the API for the referral code
        code_add_invite_friend: referralCode.trim(),
      };

      // Remove empty fields to avoid validation issues
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === null || updateData[key] === undefined || updateData[key] === "" || (typeof updateData[key] === 'number' && isNaN(updateData[key]))) {
          delete updateData[key];
        }
      });

      // Send referral code via the update profile API
      const result = await request('profile/update-my-profile', {
        method: "POST",
        auth: true,
        body: updateData,
        invalidateCacheOnSuccess: ["profile/get-my-profile", "profile/my-material"]
      });

      if (result?.success) {
        toast.success(t('points.code_applied'));
        setCodeAlreadyApplied(true);
        localStorage.setItem("DR_KROK_referral_applied", "true");
        setReferralCode("");
      } else {
        toast.error(result?.message || t('points.code_error'));
      }
    } catch (err) {
      toast.error(err?.message || t('points.code_error'));
    } finally {
      setReferralLoading(false);
    }
  };

  // Fetch universities with pagination
  const fetchUniversities = useCallback(async (page = 1, append = false) => {
    try {
      setUniLoading(true);
      const data = await request(`universities?page=${page}&per_page=15`, { useCache: true });
      if (data.success) {
        const newUnis = data.data || [];
        setUniversities(prev => append ? [...prev, ...newUnis] : newUnis);
        if (data.pagination) {
          setUniTotalPages(data.pagination.total_pages || 1);
          setUniPage(data.pagination.current_page || page);
        } else {
          // No pagination info = all loaded
          setUniTotalPages(1);
        }
      }
    } catch (error) {
      console.error("Error fetching universities:", error);
    } finally {
      setUniLoading(false);
    }
  }, [request]);



  // Fetch specializations with pagination
  const fetchSpecializations = useCallback(async (page = 1, append = false) => {
    try {
      setSpecLoading(true);
      const data = await request(`specializations?page=${page}&per_page=15`, { useCache: true });
      if (data.success) {
        const newSpecs = data.data || [];
        setSpecializations(prev => append ? [...prev, ...newSpecs] : newSpecs);
        if (data.pagination) {
          setSpecTotalPages(data.pagination.total_pages || 1);
          setSpecPage(data.pagination.current_page || page);
        } else {
          setSpecTotalPages(1);
        }
      }
    } catch (error) {
      console.error("Error fetching specializations:", error);
    } finally {
      setSpecLoading(false);
    }
  }, [request]);

  // Close dropdown on outside click
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

  // Fetch universities and college years on component mount
  useEffect(() => {
    fetchUniversities(1, false);

    fetchSpecializations(1, false);

    const fetchCollegeYears = async () => {
      try {
        const data = await request('college-years');
        if (data) {
          setCollegeYears(data);
        } else {
          toast.error(t('profile.toast.update_fail'));
        }
      } catch (error) {
        console.error("Error fetching college years:", error);
        toast.error(t('profile.toast.update_fail'));
      }
    };

    fetchCollegeYears();
  }, [fetchUniversities, request, i18n.language, t]);

  // Update form data and local user when user changes (only when not editing)
  useEffect(() => {
    if (user && !isEditing) {
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

      // Set image preview
      if (user.imageprofile) {
        setImagePreview(user.imageprofile);
      } else {
        setImagePreview("/user.png");
      }
    }
  }, [user, isEditing]);

  // Helper function to format date for input[type=date]
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    
    // Handle different date formats from API
    const dateParts = dateString.split('-');
    if (dateParts.length === 3) {
      // If date is in format "dd-MM-yyyy" or "MM-dd-yyyy"
      if (dateParts[0].length === 2 && dateParts[1].length === 2) {
        // Assume format is "dd-MM-yyyy"
        return `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
      }
      // If date is in format "yyyy-MM-dd"
      return dateString;
    }
    
    // Fallback: try to parse as Date object
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    
    return "";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error("Image size should be less than 5MB");
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!formData.image) return null;

    const imageFormData = new FormData();
    // Backend expects the field name to be `imageprofile`
    imageFormData.append("imageprofile", formData.image);

    try {
      const data = await request('profile/updateImage', {
        method: "POST",
        auth: true,
        isFormData: true,
        body: imageFormData,
      });
      if (data.success) {
        toast.success(t('profile.toast.image_uploaded'));
        // Handle different response structures
        return data.data?.imageprofile || data.imageprofile || data.data?.image_url || data.image_url || imagePreview;
      } else {
        toast.error(data.message || t('profile.toast.image_upload_fail'));
        return null;
      }
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error(t('profile.toast.image_upload_fail'));
      return null;
    }
  };

  const handleSave = async () => {
    // Basic validation
    if (!formData.name || !formData.email || !formData.phone || !formData.birth || !formData.gender) {
      toast.error(t('profile.toast.all_fields_required', 'All primary profile fields are required!'));
      return;
    }
    
    if (!formData.university_id) {
      toast.error(t('profile.toast.select_university'));
      return;
    }
    
    if (!formData.college_year) {
      toast.error(t('profile.toast.select_college_year'));
      return;
    }


    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        toast.error(t('profile.toast.auth_missing'));
        setLoading(false);
        return;
      }

      // Upload image first if there's a new one
      let imageUrl = null;
      if (formData.image) {
        imageUrl = await handleImageUpload();
        if (!imageUrl) {
          setLoading(false);
          return;
        }
      }

      // Prepare data for API - ensure proper formatting
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || "",
        birth: formData.birth || "",
        gender: formData.gender || "",
        university_id: parseInt(formData.university_id) || 0,
        college_year: formData.college_year,

        specialization_id: parseInt(formData.specialization_id) || 0,
        facebook: formData.facebook || "",
        instagram: formData.instagram || "",
        telegram: formData.telegram || "",
        whatsapp: formData.whatsapp || "",
        // Do NOT send imageprofile here unless we actually uploaded a new one to the image endpoint
      };

      // Remove empty fields to avoid validation issues
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === null || updateData[key] === undefined || updateData[key] === "" || (typeof updateData[key] === 'number' && isNaN(updateData[key]))) {
          delete updateData[key];
        }
      });

      const data = await request('profile/update-my-profile', {
        method: "POST",
        auth: true,
        body: updateData,
        invalidateCacheOnSuccess: ["profile/my-material", "profile/get-my-profile"]
      });

      if (data.success) {
        toast.success(t('profile.toast.updated'));

        // Normalize the updated user data
        const updatedUser = {
          ...data.data,
          university_id: data.data.university?.id || data.data.university_id,
        };

        // Update local user state for immediate display
        setLocalUser(() => ({
          ...updatedUser,
          // If we uploaded a new image, prefer it
          imageprofile: imageUrl || updatedUser.imageprofile
        }));

        // Update parent component with new data
        if (onProfileUpdate && typeof onProfileUpdate === "function") {
          onProfileUpdate(updatedUser);
        }

        setIsEditing(false);
      } else {
        console.error("API Error:", data);
        toast.error(data.message || t('profile.toast.update_fail'));
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(t('profile.toast.update_error'));
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

      // Reset image preview
      if (user.imageprofile) {
        setImagePreview(user.imageprofile);
      } else {
        setImagePreview("/user.png");
      }
    }
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 rounded-full border-primary border-t-transparent animate-spin"></div>
          <p className="text-text-secondary">{t('profile.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-10 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t('profile.title')}</h2>
        {!isEditing ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="flex items-center justify-center w-full gap-2 px-4 py-2 text-white transition-colors rounded-lg bg-primary hover:bg-secondary sm:w-auto"
            >
              <FaLock className="text-sm" />
              {t('profile.password.change')}
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center justify-center w-full gap-2 px-4 py-2 text-white transition-colors rounded-lg bg-primary hover:bg-secondary sm:w-auto"
            >
              <FaEdit className="text-sm" />
              {t('profile.edit')}
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
              {loading ? t('profile.saving') : t('profile.save')}
            </button>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="flex items-center justify-center w-full gap-2 px-4 py-2 text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 sm:w-auto"
            >
              <FaTimes className="text-sm" />
              {t('profile.cancel')}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Picture Section */}
        <div className="p-6 text-center border bg-surface border-border rounded-xl h-fit lg:sticky lg:top-24">
          <div className="relative w-32 h-32 mx-auto mb-4">
            <img
              src={imagePreview || "/user.png"}
              alt={localUser.name}
              className="object-cover w-full h-full rounded-full shadow-lg bg-primary"
              onError={(e) => {
                e.currentTarget.onerror = null;
                if (!e.currentTarget.src.includes('/user.png')) {
                  e.currentTarget.src = '/user.png';
                }
              }}
            />
            {isEditing && (
              <>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="absolute bottom-0 right-0 p-2 text-white transition-colors rounded-full cursor-pointer bg-primary hover:bg-secondary"
                >
                  <FaCamera className="text-sm" />
                </label>
              </>
            )}
          </div>
          <h3 className="text-lg font-semibold">{localUser.name}</h3>
          <p className="text-text-secondary">{localUser.email}</p>
          {formData.image && (
            <p className="mt-2 text-sm text-green-600">New image selected</p>
          )}

          {/* Social Media Section (Relocated) */}
          <div className="mt-8 pt-8 border-t border-border">
            <h4 className="mb-4 text-sm font-bold text-left uppercase tracking-wider opacity-60 flex items-center gap-2">
              <FaChevronDown className="text-[10px]" /> {t('profile.social_media')}
            </h4>
            <div className="space-y-3">
              {/* Facebook */}
              <div>
                {isEditing ? (
                  <div className="space-y-1 text-left">
                    <label className="text-[11px] font-bold text-text-secondary uppercase px-1">
                      <FaFacebook className="inline mr-1 text-blue-600" /> Facebook <span className="text-[9px] font-normal lowercase opacity-70">(Optional)</span>
                    </label>
                    <input
                      type="url"
                      name="facebook"
                      value={formData.facebook}
                      onChange={handleInputChange}
                      placeholder="https://facebook.com/..."
                      className="w-full px-3 py-2 text-sm border rounded-lg bg-background border-border focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                ) : (
                  <a 
                    href={user.facebook || "#"} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                      user.facebook ? 'border-border hover:border-primary/50 bg-gray-50/50 dark:bg-gray-800/50' : 'border-dashed border-border opacity-50 cursor-default'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded bg-blue-100 dark:bg-blue-900/30">
                        <FaFacebook className="text-blue-600 text-xs" />
                      </div>
                      <span className="text-xs font-medium">Facebook</span>
                    </div>
                    <span className="text-[10px] text-text-muted">
                      {user.facebook ? "View" : "None"}
                    </span>
                  </a>
                )}
              </div>

              {/* Instagram */}
              <div>
                {isEditing ? (
                  <div className="space-y-1 text-left">
                    <label className="text-[11px] font-bold text-text-secondary uppercase px-1">
                      <FaInstagram className="inline mr-1 text-pink-600" /> Instagram <span className="text-[9px] font-normal lowercase opacity-70">(Optional)</span>
                    </label>
                    <input
                      type="url"
                      name="instagram"
                      value={formData.instagram}
                      onChange={handleInputChange}
                      placeholder="https://instagram.com/..."
                      className="w-full px-3 py-2 text-sm border rounded-lg bg-background border-border focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                ) : (
                  <a 
                    href={user.instagram || "#"} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                      user.instagram ? 'border-border hover:border-primary/50 bg-gray-50/50 dark:bg-gray-800/50' : 'border-dashed border-border opacity-50 cursor-default'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded bg-pink-100 dark:bg-pink-900/30">
                        <FaInstagram className="text-pink-600 text-xs" />
                      </div>
                      <span className="text-xs font-medium">Instagram</span>
                    </div>
                    <span className="text-[10px] text-text-muted">
                      {user.instagram ? "View" : "None"}
                    </span>
                  </a>
                )}
              </div>

              {/* Telegram */}
              <div>
                {isEditing ? (
                  <div className="space-y-1 text-left">
                    <label className="text-[11px] font-bold text-text-secondary uppercase px-1">
                      <FaTelegram className="inline mr-1 text-blue-500" /> Telegram <span className="text-[9px] font-normal lowercase opacity-70">(Optional)</span>
                    </label>
                    <input
                      type="url"
                      name="telegram"
                      value={formData.telegram}
                      onChange={handleInputChange}
                      placeholder="https://t.me/..."
                      className="w-full px-3 py-2 text-sm border rounded-lg bg-background border-border focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                ) : (
                  <a 
                    href={user.telegram || "#"} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                      user.telegram ? 'border-border hover:border-primary/50 bg-gray-50/50 dark:bg-gray-800/50' : 'border-dashed border-border opacity-50 cursor-default'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded bg-blue-50 dark:bg-blue-900/20">
                        <FaTelegram className="text-blue-500 text-xs" />
                      </div>
                      <span className="text-xs font-medium">Telegram</span>
                    </div>
                    <span className="text-[10px] text-text-muted">
                      {user.telegram ? "View" : "None"}
                    </span>
                  </a>
                )}
              </div>

              {/* WhatsApp */}
              <div>
                {isEditing ? (
                  <div className="space-y-1 text-left">
                    <label className="text-[11px] font-bold text-text-secondary uppercase px-1">
                      <FaWhatsapp className="inline mr-1 text-green-600" /> WhatsApp <span className="text-[9px] font-normal lowercase opacity-70">(Optional)</span>
                    </label>
                    <input
                      type="tel"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleInputChange}
                      placeholder="Wa.me/..."
                      className="w-full px-3 py-2 text-sm border rounded-lg bg-background border-border focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                ) : (
                  <a 
                    href={user.whatsapp ? (user.whatsapp.includes('http') ? user.whatsapp : `https://wa.me/${user.whatsapp}`) : "#"} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                      user.whatsapp ? 'border-border hover:border-primary/50 bg-gray-50/50 dark:bg-gray-800/50' : 'border-dashed border-border opacity-50 cursor-default'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded bg-green-100 dark:bg-green-900/30">
                        <FaWhatsapp className="text-green-600 text-xs" />
                      </div>
                      <span className="text-xs font-medium">WhatsApp</span>
                    </div>
                    <span className="text-[10px] text-text-muted">
                      {user.whatsapp ? "Chat" : "None"}
                    </span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-6 border lg:col-span-2 bg-surface border-border rounded-xl">
          <h3 className="mb-6 text-lg font-semibold">{t('profile.info')}</h3>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block mb-2 text-sm font-bold text-text-primary">
                  {t('profile.full_name')} <span className="text-[11px] font-normal text-text-secondary opacity-70 ml-1">* (Required)</span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg bg-background border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                ) : (
                  <div className="flex items-center gap-3 p-3 border rounded-lg border-border bg-gray-50/30 dark:bg-gray-800/30">
                    <div className="p-2 bg-white dark:bg-gray-700 rounded-md shadow-sm border border-border">
                      <FaUser className="text-primary text-sm" />
                    </div>
                    <span className="font-medium">{user.name}</span>
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block mb-2 text-sm font-bold text-text-primary">
                  {t('profile.email_address')} <span className="text-[11px] font-normal text-text-secondary opacity-70 ml-1">* (Required)</span>
                </label>
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg bg-background border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                ) : (
                  <div className="flex items-center gap-3 p-3 border rounded-lg border-border bg-gray-50/30 dark:bg-gray-800/30">
                    <div className="p-2 bg-white dark:bg-gray-700 rounded-md shadow-sm border border-border">
                      <FaEnvelope className="text-primary text-sm" />
                    </div>
                    <span className="font-medium">{user.email}</span>
                  </div>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block mb-2 text-sm font-bold text-text-primary">
                  {t('profile.phone_number')} <span className="text-[11px] font-normal text-text-secondary opacity-70 ml-1">* (Required)</span>
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg bg-background border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                ) : (
                  <div className="flex items-center gap-3 p-3 border rounded-lg border-border bg-gray-50/30 dark:bg-gray-800/30">
                    <div className="p-2 bg-white dark:bg-gray-700 rounded-md shadow-sm border border-border">
                      <FaPhone className="text-primary text-sm" />
                    </div>
                    <span className="font-medium">{user.phone || t('profile.not_provided')}</span>
                  </div>
                )}
              </div>

              {/* Specialization */}
              <div>
                <label className="block mb-2 text-sm font-bold text-text-primary">
                  {t('profile.specialization')} <span className="text-[11px] font-normal text-text-secondary opacity-70 ml-1">(Optional)</span>
                </label>
                {isEditing ? (
                  <div className="relative" ref={specDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setSpecDropdownOpen(o => !o)}
                      className="w-full flex items-center justify-between px-3 py-2 border rounded-lg bg-background border-border focus:outline-none focus:ring-2 focus:ring-primary text-left"
                    >
                      <span className={formData.specialization_id ? "" : "text-gray-400"}>
                        {formData.specialization_id
                          ? specializations.find(s => String(s.id) === String(formData.specialization_id))?.name || t('profile.select_specialization')
                          : t('profile.select_specialization')}
                      </span>
                      <FaChevronDown className={`text-xs transition-transform ${specDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {specDropdownOpen && (
                      <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-xl dark:bg-gray-800 border-border max-h-64 flex flex-col">
                        <div className="flex items-center gap-2 p-2 border-b border-border">
                          <FaSearch className="text-xs text-gray-400 shrink-0" />
                          <input
                            type="text"
                            value={specSearch}
                            onChange={e => setSpecSearch(e.target.value)}
                            placeholder={t('profile.search_specialization', 'Search specialization...')}
                            className="flex-1 text-sm bg-transparent outline-none dark:text-white"
                            autoFocus
                          />
                        </div>
                        <ul className="overflow-y-auto flex-1">
                          <li>
                            <button
                              type="button"
                              onClick={() => {
                                handleInputChange({ target: { name: 'specialization_id', value: '' } });
                                setSpecDropdownOpen(false);
                                setSpecSearch("");
                              }}
                              className="w-full px-3 py-2 text-sm text-left text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              {t('profile.select_specialization')}
                            </button>
                          </li>
                          {specializations
                            .filter(s => !specSearch || s.name.toLowerCase().includes(specSearch.toLowerCase()))
                            .map(specialization => (
                              <li key={specialization.id}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleInputChange({ target: { name: 'specialization_id', value: specialization.id } });
                                    setSpecDropdownOpen(false);
                                    setSpecSearch("");
                                  }}
                                  className={`w-full px-3 py-2 text-sm text-left transition-colors hover:bg-primary/10 dark:hover:bg-primary/20 ${
                                    String(formData.specialization_id) === String(specialization.id)
                                      ? 'bg-primary/10 dark:bg-primary/20 font-medium text-primary'
                                      : 'dark:text-white'
                                  }`}
                                >
                                  {specialization.name}
                                </button>
                              </li>
                            ))}
                        </ul>
                        {specPage < specTotalPages && !specSearch && (
                          <div className="p-2 border-t border-border">
                            <button
                              type="button"
                              onClick={() => fetchSpecializations(specPage + 1, true)}
                              disabled={specLoading}
                              className="w-full py-1.5 text-xs text-center text-primary hover:underline disabled:opacity-50"
                            >
                              {specLoading ? t('common.loading', 'Loading...') : t('profile.load_more_specializations', 'Load more specializations')}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 border rounded-lg border-border bg-gray-50/30 dark:bg-gray-800/30">
                    <div className="p-2 bg-white dark:bg-gray-700 rounded-md shadow-sm border border-border">
                      <FaStethoscope className="text-primary text-sm" />
                    </div>
                    <span className="font-medium">{localUser.specialization?.name || specializations.find((s) => s.id == localUser.specialization_id)?.name || t('profile.not_selected')}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {/* Birth Date */}
              <div>
                <label className="block mb-2 text-sm font-bold text-text-primary">
                  {t('profile.birth_date')} <span className="text-[11px] font-normal text-text-secondary opacity-70 ml-1">* (Required)</span>
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    name="birth"
                    value={formData.birth}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg bg-background border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                ) : (
                  <div className="flex items-center gap-3 p-3 border rounded-lg border-border bg-gray-50/30 dark:bg-gray-800/30">
                    <div className="p-2 bg-white dark:bg-gray-700 rounded-md shadow-sm border border-border">
                      <FaCalendarAlt className="text-primary text-sm" />
                    </div>
                    <span className="font-medium">{user.birth ? formatDateForDisplay(user.birth) : t('profile.not_provided')}</span>
                  </div>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="block mb-2 text-sm font-bold text-text-primary">
                  {t('profile.gender')} <span className="text-[11px] font-normal text-text-secondary opacity-70 ml-1">* (Required)</span>
                </label>
                {isEditing ? (
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg bg-background border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="">{t('profile.select_gender')}</option>
                    <option value="male">{t('profile.male')}</option>
                    <option value="female">{t('profile.female')}</option>
                    <option value="other">{t('profile.other')}</option>
                  </select>
                ) : (
                  <div className="flex items-center gap-3 p-3 border rounded-lg border-border bg-gray-50/30 dark:bg-gray-800/30">
                    <div className="p-2 bg-white dark:bg-gray-700 rounded-md shadow-sm border border-border">
                      <FaVenusMars className="text-primary text-sm" />
                    </div>
                    <span className="capitalize font-medium">{user.gender || t('profile.not_provided')}</span>
                  </div>
                )}
              </div>

              {/* University */}
              <div>
                <label className="block mb-2 text-sm font-bold text-text-primary">
                  {t('profile.university')} <span className="text-[11px] font-normal text-text-secondary opacity-70 ml-1">* (Required)</span>
                </label>
                {isEditing ? (
                  <div className="relative" ref={uniDropdownRef}>
                    {/* Trigger button */}
                    <button
                      type="button"
                      onClick={() => setUniDropdownOpen(o => !o)}
                      className="w-full flex items-center justify-between px-3 py-2 border rounded-lg bg-background border-border focus:outline-none focus:ring-2 focus:ring-primary text-left"
                    >
                      <span className={formData.university_id ? "" : "text-gray-400"}>
                        {formData.university_id
                          ? universities.find(u => String(u.id) === String(formData.university_id))?.name || t('profile.select_university')
                          : t('profile.select_university')}
                      </span>
                      <FaChevronDown className={`text-xs transition-transform ${uniDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown panel */}
                    {uniDropdownOpen && (
                      <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-xl dark:bg-gray-800 border-border max-h-64 flex flex-col">
                        {/* Search */}
                        <div className="flex items-center gap-2 p-2 border-b border-border">
                          <FaSearch className="text-xs text-gray-400 shrink-0" />
                          <input
                            type="text"
                            value={uniSearch}
                            onChange={e => setUniSearch(e.target.value)}
                            placeholder={t('profile.search_university', 'Search university...')}
                            className="flex-1 text-sm bg-transparent outline-none dark:text-white"
                            autoFocus
                          />
                        </div>

                        {/* List */}
                        <ul className="overflow-y-auto flex-1">
                          <li>
                            <button
                              type="button"
                              onClick={() => {
                                handleInputChange({ target: { name: 'university_id', value: '' } });
                                setUniDropdownOpen(false);
                                setUniSearch("");
                              }}
                              className="w-full px-3 py-2 text-sm text-left text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              {t('profile.select_university')}
                            </button>
                          </li>
                          {universities
                            .filter(u => !uniSearch || u.name.toLowerCase().includes(uniSearch.toLowerCase()))
                            .map(university => (
                              <li key={university.id}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleInputChange({ target: { name: 'university_id', value: university.id } });
                                    setUniDropdownOpen(false);
                                    setUniSearch("");
                                  }}
                                  className={`w-full px-3 py-2 text-sm text-left transition-colors hover:bg-primary/10 dark:hover:bg-primary/20 ${
                                    String(formData.university_id) === String(university.id)
                                      ? 'bg-primary/10 dark:bg-primary/20 font-medium text-primary'
                                      : 'dark:text-white'
                                  }`}
                                >
                                  {university.name}
                                </button>
                              </li>
                            ))}
                        </ul>

                        {/* Load more */}
                        {uniPage < uniTotalPages && !uniSearch && (
                          <div className="p-2 border-t border-border">
                            <button
                              type="button"
                              onClick={() => fetchUniversities(uniPage + 1, true)}
                              disabled={uniLoading}
                              className="w-full py-1.5 text-xs text-center text-primary hover:underline disabled:opacity-50"
                            >
                              {uniLoading ? t('common.loading', 'Loading...') : t('profile.load_more_universities', 'Load more universities')}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 border rounded-lg border-border bg-gray-50/30 dark:bg-gray-800/30">
                    <div className="p-2 bg-white dark:bg-gray-700 rounded-md shadow-sm border border-border">
                      <FaGraduationCap className="text-primary text-sm" />
                    </div>
                    <span className="font-medium">{localUser.university?.name || universities.find((u) => u.id == localUser.university_id)?.name || t('profile.not_selected')}</span>
                  </div>
                )}
              </div>

              {/* College Year */}
              <div>
                <label className="block mb-2 text-sm font-bold text-text-primary">
                  {t('profile.college_year')} <span className="text-[11px] font-normal text-text-secondary opacity-70 ml-1">* (Required)</span>
                </label>
                {isEditing ? (
                  <select
                    name="college_year"
                    value={formData.college_year}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg bg-background border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="">{t('profile.select_year')}</option>
                    {collegeYears.map((year) => (
                      <option key={year.id} value={year.id}>
                        {year.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-center gap-3 p-3 border rounded-lg border-border bg-gray-50/30 dark:bg-gray-800/30">
                    <div className="p-2 bg-white dark:bg-gray-700 rounded-md shadow-sm border border-border">
                      <FaGraduationCap className="text-primary text-sm" />
                    </div>
                    <span className="font-medium">
                      {collegeYears.find((year) => year.id == localUser.college_year)?.name || t('profile.not_specified')}
                    </span>
                  </div>
                )}
              </div>


            </div>
          </div>
        </div>
      </div>


      {/* ===== POINTS & REFERRAL SECTION ===== */}
      {user && (
        <div className="mt-8 space-y-4">
          {/* Section Header */}
          <div className="flex items-center gap-3 pb-2 border-b border-border">
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <FaGem className="text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-xl font-bold">{t('points.title', 'Points & Referral')}</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Points Balance Card */}
            <div className="p-5 border bg-surface border-border rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <FaCoins className="text-yellow-500" />
                <h4 className="font-bold text-sm uppercase tracking-wider opacity-70">{t('points.balance', 'Points Balance')}</h4>
              </div>
              <div className="text-center py-3">
                <div className="text-4xl font-bold text-primary mb-1">
                  {Number(user.points_balance || 0).toLocaleString()}
                </div>
                <div className="text-sm text-text-secondary">{t('points.pts', 'pts')}</div>
                <div className="mt-3 pt-3 border-t border-border space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">{t('points.monetary_value', 'Cash Value')}</span>
                    <span className="font-semibold text-green-600">₴{Number(user.points_monetary_value || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">{t('points.point_value', 'Point Value')}</span>
                    <span className="font-medium">₴{user.settings_point_value || '0'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">{t('points.min_redeem', 'Min to Redeem')}</span>
                    <span className="font-medium">{user.settings_min_points_to_redeem || '0'} {t('points.pts', 'pts')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Referral Code Card */}
            <div className="p-5 border bg-surface border-border rounded-xl">
              <div className="flex items-center gap-2 mb-4">
                <FaTag className="text-primary" />
                <h4 className="font-bold text-sm uppercase tracking-wider opacity-70">{t('points.my_code', 'My Referral Code')}</h4>
              </div>

              {/* Own code */}
              {user.code_for_client ? (
                <div className="mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-4 py-3 font-mono text-lg font-bold tracking-widest text-center border rounded-lg bg-background border-border text-primary">
                      {user.code_for_client}
                    </div>
                    <button
                      onClick={handleCopyCode}
                      title={t('points.copy', 'Copy')}
                      className={`p-3 rounded-lg border transition-all ${
                        codeCopied
                          ? 'bg-green-100 border-green-300 text-green-600 dark:bg-green-900/30'
                          : 'bg-surface border-border hover:border-primary hover:text-primary'
                      }`}
                    >
                      {codeCopied ? <FaCheck className="text-sm" /> : <FaCopy className="text-sm" />}
                    </button>
                  </div>
                  {codeCopied && (
                    <p className="mt-1 text-xs text-center text-green-600">{t('points.copied', 'Copied!')}</p>
                  )}
                  <p className="text-xs text-text-secondary mt-3 text-center leading-relaxed bg-primary/5 rounded p-2 border border-primary/10">
                    {t('points.earn_referral', 'Share this code to earn {{points}} points for each friend that registers!', { points: user.settings_referral_points || '0' })}
                  </p>
                </div>
              ) : (
                <p className="mb-4 text-sm text-center text-text-secondary opacity-60">{t('points.no_code', 'No referral code assigned yet')}</p>
              )}

              {/* Friend's code input */}
              <div className="pt-4 border-t border-border">
                <label className="block mb-2 text-xs font-bold uppercase tracking-wider text-text-secondary">
                  {t('points.enter_friends_code', "Enter Friend's Code")}
                </label>
                {codeAlreadyApplied ? (
                  <div className="flex items-center gap-2 px-3 py-2.5 text-sm text-green-700 border border-green-200 rounded-lg bg-green-50 dark:bg-green-900/20">
                    <FaCheck className="text-green-600 flex-shrink-0" />
                    <span>{t('points.code_already_applied', 'Referral code already applied')}</span>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={referralCode}
                      onChange={e => setReferralCode(e.target.value)}
                      placeholder={t('points.code_placeholder', 'Enter referral code...')}
                      className="flex-1 px-3 py-2 text-sm border rounded-lg bg-background border-border focus:outline-none focus:ring-2 focus:ring-primary"
                      onKeyDown={e => e.key === 'Enter' && handleApplyReferralCode()}
                    />
                    <button
                      onClick={handleApplyReferralCode}
                      disabled={referralLoading || !referralCode.trim()}
                      className="px-4 py-2 text-sm font-semibold text-white transition-all rounded-lg bg-primary hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {referralLoading ? t('points.applying', 'Applying...') : t('points.apply_code', 'Apply')}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Allowed Merchants Card */}
            {user.allowed_points_merchants && user.allowed_points_merchants.length > 0 && (
              <div className="p-5 border bg-surface border-border rounded-xl">
                <div className="flex items-center gap-2 mb-4">
                  <FaStore className="text-emerald-600" />
                  <h4 className="font-bold text-sm uppercase tracking-wider opacity-70">{t('points.merchants_title', 'Redeem Points At')}</h4>
                </div>
                <div className="space-y-3">
                  {user.allowed_points_merchants.map(merchant => {
                    // Robust detection logic
                    // A pure store will typically have role 'merchant' or 'store'
                    const isStore = 
                      merchant.role === 'merchant' || 
                      merchant.role === 'store' ||
                      merchant.is_store === true ||
                      merchant.email?.toLowerCase() === 'drkrokwebsite@gmail.com' ||
                      merchant.name?.toLowerCase().includes('dr-krok');
                      
                    // If they are not a store, they are an instructor.
                    // Also explicitly check instructor roles/emails just in case.
                    const isInstructor = 
                      !isStore ||
                      merchant.role === 'instructor' || 
                      merchant.role === 'teacher' ||
                      merchant.email?.toLowerCase() === 'dr.krok12@gmail.com' ||
                      merchant.is_instructor == true;

                    return (
                      <div key={merchant.id} className="flex items-center justify-between p-3 border rounded-lg border-border bg-background/50">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate">{merchant.name}</p>
                          <p className="text-xs text-text-secondary truncate">{merchant.email}</p>
                        </div>
                        <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                          {isInstructor ? (
                            /* Instructor → View Profile only */
                            <button
                              onClick={() => navigate(`/instructors/${merchant.id}`)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-all rounded-lg border border-primary text-primary hover:bg-primary hover:text-white"
                            >
                              <FaUser className="text-[10px]" />
                              {t('points.view_profile', 'View Profile')}
                            </button>
                          ) : (
                            /* Pure merchant/store → Visit Store only */
                            <button
                              onClick={() => navigate(`/merchants/${merchant.id}`)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white transition-all rounded-lg bg-primary hover:bg-secondary hover:shadow-sm"
                            >
                              <FaStore className="text-[10px]" />
                              {t('points.visit_store', 'Visit Store')}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Password Change Modal */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
};

export default MyProfile;
