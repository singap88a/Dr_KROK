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

  // Fetch universities and college years on component mount
  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const response = await fetch("https://dr-krok.hudurly.com/api/universities", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        if (data.success) {
          setUniversities(data.data);
        } else {
          toast.error("Failed to load universities");
        }
      } catch (error) {
        console.error("Error fetching universities:", error);
        toast.error("Failed to load universities");
      }
    };

    const fetchCollegeYears = async () => {
      try {
        const response = await fetch("https://dr-krok.hudurly.com/api/college-years", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        if (data) {
          setCollegeYears(data);
        } else {
          toast.error("Failed to load college years");
        }
      } catch (error) {
        console.error("Error fetching college years:", error);
        toast.error("Failed to load college years");
      }
    };

    fetchUniversities();
    fetchCollegeYears();
  }, []);

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
    imageFormData.append("image", formData.image);

    try {
      const token = localStorage.getItem("token") || localStorage.getItem("userToken");
      const response = await fetch("https://dr-krok.hudurly.com/api/profile/updateImage", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: imageFormData,
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Image uploaded successfully!");
        // Handle different response structures
        return data.data?.image_url || data.image_url || data.data || imagePreview;
      } else {
        toast.error(data.message || "Failed to upload image");
        return null;
      }
    } catch (error) {
      console.error("Image upload error:", error);
      toast.error("Failed to upload image");
      return null;
    }
  };

  const handleSave = async () => {
    // Basic validation
    if (!formData.name || !formData.email) {
      toast.error("Name and email are required");
      return;
    }
    
    if (!formData.university_id) {
      toast.error("Please select a university");
      return;
    }
    
    if (!formData.college_year) {
      toast.error("Please select your college year");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("userToken");
      if (!token) {
        toast.error("Authentication token not found");
        setLoading(false);
        return;
      }

      // Upload image first if there's a new one
      let imageUrl = user?.imageprofile;
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
        imageprofile: imageUrl || "",
      };

      // Remove empty fields to avoid validation issues
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === null || updateData[key] === undefined || updateData[key] === "") {
          delete updateData[key];
        }
      });

      const response = await fetch("https://dr-krok.hudurly.com/api/profile/update-my-profile", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Profile updated successfully!");

        // Update local user state for immediate display
        setLocalUser(data.data);

        // Update parent component with new data
        if (onProfileUpdate && typeof onProfileUpdate === "function") {
          onProfileUpdate(data.data);
        }

        setIsEditing(false);
      } else {
        console.error("API Error:", data);
        toast.error(data.message || "Failed to update profile. Please check your data and try again.");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Failed to update profile. Please try again.");
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
          <p className="text-text-secondary">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Profile</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 text-white transition-colors rounded-lg bg-primary hover:bg-secondary"
          >
            <FaEdit className="text-sm" />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <FaSave className="text-sm" />
              {loading ? "Saving..." : "Save"}
            </button>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              <FaTimes className="text-sm" />
              Cancel
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
          <h3 className="mb-6 text-lg font-semibold">Profile Information</h3>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block mb-2 text-sm font-medium text-text-secondary">
                  Full Name *
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
                  Email Address *
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
                  Phone Number
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
                    <span>{user.phone || "Not provided"}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {/* Birth Date */}
              <div>
                <label className="block mb-2 text-sm font-medium text-text-secondary">
                  Birth Date
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
                    <span>{user.birth ? new Date(user.birth).toLocaleDateString() : "Not provided"}</span>
                  </div>
                )}
              </div>

              {/* Gender */}
              <div>
                <label className="block mb-2 text-sm font-medium text-text-secondary">
                  Gender
                </label>
                {isEditing ? (
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg bg-background border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                ) : (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <FaVenusMars className="text-primary" />
                    <span className="capitalize">{user.gender || "Not provided"}</span>
                  </div>
                )}
              </div>

              {/* University */}
              <div>
                <label className="block mb-2 text-sm font-medium text-text-secondary">
                  University *
                </label>
                {isEditing ? (
                  <select
                    name="university_id"
                    value={formData.university_id}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border rounded-lg bg-background border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="">Select University</option>
                    {universities.map((university) => (
                      <option key={university.id} value={university.id}>
                        {university.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <FaGraduationCap className="text-primary" />
                    <span>{universities.find((u) => u.id == localUser.university_id)?.name || "Not selected"}</span>
                  </div>
                )}
              </div>

              {/* College Year */}
              <div>
                <label className="block mb-2 text-sm font-medium text-text-secondary">
                  College Year *
                </label>
              {isEditing ? (
                <select
                  name="college_year"
                  value={formData.college_year}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border rounded-lg bg-background border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select Year</option>
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
                    {collegeYears.find((year) => year.id == localUser.college_year)?.name || "Not specified"}
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