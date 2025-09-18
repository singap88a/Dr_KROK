import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
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
} from "react-icons/fa";
import { useApi } from "../../context/ApiContext";
import { useTranslation } from "react-i18next";

const MyProfile = ({ user, onProfileUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [universities, setUniversities] = useState([]);
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
    image: null,
  });
  const [imagePreview, setImagePreview] = useState("");
  const { t, i18n } = useTranslation();

  const { request } = useApi();

  // Fetch universities and college years on component mount
  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const data = await request('universities');
        if (data.success) {
          setUniversities(data.data);
        } else {
          toast.error(t('profile.toast.update_fail'));
        }
      } catch (error) {
        console.error("Error fetching universities:", error);
        toast.error(t('profile.toast.update_fail'));
      }
    };

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

    fetchUniversities();
    fetchCollegeYears();
  }, [request, i18n.language, t]);

  // Update form data and local user when user changes
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
        image: null,
      });

      // Set image preview
      if (user.imageprofile) {
        setImagePreview(user.imageprofile);
      } else {
        setImagePreview("https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face");
      }
    }
  }, [user]);

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
    if (!formData.name || !formData.email) {
      toast.error(t('profile.toast.name_email_required'));
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
      const token = localStorage.getItem("token") || localStorage.getItem("userToken");
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
        // Do NOT send imageprofile here unless we actually uploaded a new one to the image endpoint
      };

      // Remove empty fields to avoid validation issues
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === null || updateData[key] === undefined || updateData[key] === "") {
          delete updateData[key];
        }
      });

      const data = await request('profile/update-my-profile', {
        method: "POST",
        auth: true,
        body: updateData,
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
        image: null,
      });
      
      // Reset image preview
      if (user.imageprofile) {
        setImagePreview(user.imageprofile);
      } else {
        setImagePreview("https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face");
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t('profile.title')}</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 text-white transition-colors rounded-lg bg-primary hover:bg-secondary"
          >
            <FaEdit className="text-sm" />
            {t('profile.edit')}
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <FaSave className="text-sm" />
              {loading ? t('profile.saving') : t('profile.save')}
            </button>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              <FaTimes className="text-sm" />
              {t('profile.cancel')}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Profile Picture Section */}
        <div className="p-6 text-center border bg-surface border-border rounded-xl">
          <div className="relative w-32 h-32 mx-auto mb-4">
            <img
              src={imagePreview}
              alt={localUser.name}
              className="object-cover w-full h-full rounded-full shadow-lg"
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
        </div>

        {/* Profile Details */}
        <div className="p-6 border lg:col-span-2 bg-surface border-border rounded-xl">
          <h3 className="mb-6 text-lg font-semibold">{t('profile.info')}</h3>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block mb-2 text-sm font-medium text-text-secondary">
                  {t('profile.full_name')}
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
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <FaUser className="text-primary" />
                    <span>{user.name}</span>
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block mb-2 text-sm font-medium text-text-secondary">
                  {t('profile.email_address')}
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
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <FaEnvelope className="text-primary" />
                    <span>{user.email}</span>
                  </div>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block mb-2 text-sm font-medium text-text-secondary">
                  {t('profile.phone_number')}
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg bg-background border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <FaPhone className="text-primary" />
                    <span>{user.phone || t('profile.not_provided')}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {/* Birth Date */}
              <div>
                <label className="block mb-2 text-sm font-medium text-text-secondary">
                  {t('profile.birth_date')}
                </label>
                {isEditing ? (
                  <input
                    type="date"
                    name="birth"
                    value={formData.birth}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg bg-background border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ) : (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <FaCalendarAlt className="text-primary" />
                    <span>{user.birth ? new Date(user.birth).toLocaleDateString() : t('profile.not_provided')}</span>
                  </div>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="block mb-2 text-sm font-medium text-text-secondary">
                  {t('profile.gender')}
                </label>
                {isEditing ? (
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg bg-background border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">{t('profile.select_gender')}</option>
                    <option value="male">{t('profile.male')}</option>
                    <option value="female">{t('profile.female')}</option>
                    <option value="other">{t('profile.other')}</option>
                  </select>
                ) : (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <FaVenusMars className="text-primary" />
                    <span className="capitalize">{user.gender || t('profile.not_provided')}</span>
                  </div>
                )}
              </div>

              {/* University */}
              <div>
                <label className="block mb-2 text-sm font-medium text-text-secondary">
                  {t('profile.university')}
                </label>
                {isEditing ? (
                  <select
                    name="university_id"
                    value={formData.university_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg bg-background border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="">{t('profile.select_university')}</option>
                    {universities.map((university) => (
                      <option key={university.id} value={university.id}>
                        {university.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <FaGraduationCap className="text-primary" />
                    <span>{localUser.university?.name || universities.find((u) => u.id == localUser.university_id)?.name || t('profile.not_selected')}</span>
                  </div>
                )}
              </div>

              {/* College Year */}
              <div>
                <label className="block mb-2 text-sm font-medium text-text-secondary">
                  {t('profile.college_year')}
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
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <FaGraduationCap className="text-primary" />
                  <span>
                    {collegeYears.find((year) => year.id == localUser.college_year)?.name || t('profile.not_specified')}
                  </span>
                </div>
              )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;