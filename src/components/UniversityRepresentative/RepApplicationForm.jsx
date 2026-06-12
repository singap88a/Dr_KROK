import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaUser, FaEnvelope, FaPhone, FaWhatsapp, FaBuilding, FaBook } from "react-icons/fa";
import UniversitySelect from "./UniversitySelect";

export default function RepApplicationForm({ t, request, isLoggedIn, userData, onSubmitSuccess }) {
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    whatsapp: "",
    notes: "",
    university_id: ""
  });

  // Pre-fill user data
  useEffect(() => {
    if (isLoggedIn && userData) {
      setFormData(prev => ({
        ...prev,
        name: userData.name || prev.name,
        email: userData.email || prev.email,
        phone: userData.phone || prev.phone,
        whatsapp: userData.whatsapp || userData.phone || prev.whatsapp,
        university_id: userData.university?.id || userData.university_id || prev.university_id
      }));
    }
  }, [isLoggedIn, userData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUniversityChange = (val) => {
    setFormData(prev => ({ ...prev, university_id: val }));
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error(t("universityRepresentative.errors.name", "Name is required"));
    if (!formData.email.trim()) return toast.error(t("universityRepresentative.errors.email", "Email is required"));
    if (!formData.phone.trim()) return toast.error(t("universityRepresentative.errors.phone", "Phone is required"));
    if (!formData.whatsapp.trim()) return toast.error(t("universityRepresentative.errors.whatsapp", "WhatsApp is required"));
    if (!formData.university_id) return toast.error(t("universityRepresentative.errors.university", "University is required"));

    setSubmitting(true);
    try {
      const res = await request("university-representative/apply", {
        method: "POST",
        auth: isLoggedIn,
        body: {
          university_id: String(formData.university_id),
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          whatsapp: formData.whatsapp,
          notes: formData.notes
        }
      });

      if (res && res.success) {
        toast.success(res.message || t("universityRepresentative.pendingMessage"));
        const newRepId = res.data?.id || res.id;
        if (newRepId) {
          onSubmitSuccess(newRepId, formData.name);
        } else {
          toast.error("Application submitted, but reference ID was not returned.");
        }
      } else {
        toast.error(res?.message || "Failed to submit request.");
      }
    } catch (err) {
      console.error("Apply error:", err);
      toast.error(err?.message || "An error occurred while submitting your request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container px-4 py-10 mx-auto max-w-2xl animate-slideUp">
      <div className="p-8 border border-border bg-surface rounded-2xl shadow-2xl space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
              <FaBuilding className="text-2xl" />
            </div>
            <h1 className="text-2xl font-black text-text">
              {t("universityRepresentative.applyTitle", "Representative Request")}
            </h1>
          </div>
          <p className="text-text-secondary text-sm leading-relaxed">
            {t(
              "universityRepresentative.applySubtitle",
              "Submit an application to be recognized as a university representative. Once approved, you can check progress of your university's students."
            )}
          </p>
        </div>

        <form onSubmit={handleApplySubmit} className="space-y-4 pt-4 border-t border-border">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-text-secondary flex items-center gap-1.5">
              <FaUser className="text-text-muted text-xs" />
              {t("universityRepresentative.fields.name", "Full Name")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g. John Doe"
              className="w-full px-4 py-2.5 border rounded-xl bg-background border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-text-secondary flex items-center gap-1.5">
              <FaEnvelope className="text-text-muted text-xs" />
              {t("universityRepresentative.fields.email", "Email Address")} <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="e.g. name@university.edu"
              className="w-full px-4 py-2.5 border rounded-xl bg-background border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
              required
            />
          </div>

          {/* Phone & WhatsApp row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-text-secondary flex items-center gap-1.5">
                <FaPhone className="text-text-muted text-xs" />
                {t("universityRepresentative.fields.phone", "Phone Number")} <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="e.g. +380 99..."
                className="w-full px-4 py-2.5 border rounded-xl bg-background border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-text-secondary flex items-center gap-1.5">
                <FaWhatsapp className="text-emerald-500 text-xs" />
                {t("universityRepresentative.fields.whatsapp", "WhatsApp Number")} <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleInputChange}
                placeholder="WhatsApp Number"
                className="w-full px-4 py-2.5 border rounded-xl bg-background border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                required
              />
            </div>
          </div>

          {/* University Dropdown */}
          <UniversitySelect
            t={t}
            request={request}
            selectedId={formData.university_id}
            onChange={handleUniversityChange}
            initialUniversityName={userData?.university?.name}
          />

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-sm font-bold text-text-secondary flex items-center gap-1.5">
              <FaBook className="text-text-muted text-xs" />
              {t("universityRepresentative.fields.notes", "Additional Notes")}
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows="3"
              placeholder="e.g. Details about your role or association with the university..."
              className="w-full px-4 py-2.5 border rounded-xl bg-background border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition resize-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary/95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {t("universityRepresentative.submitting", "Submitting...")}
                </>
              ) : (
                t("universityRepresentative.submit", "Submit Request")
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
