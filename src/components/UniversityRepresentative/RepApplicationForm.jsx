import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { FaBuilding, FaBook, FaExclamationTriangle, FaArrowRight } from "react-icons/fa";
import UniversitySelect from "./UniversitySelect";
import { Link } from "react-router-dom";

export default function RepApplicationForm({ t, request, isLoggedIn, userData, onSubmitSuccess }) {
  const [submitting, setSubmitting] = useState(false);
  const [profileMissing, setProfileMissing] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const profile = useMemo(() => ({
    name: userData?.name || "",
    email: userData?.email || "",
    phone: userData?.phone || "",
    whatsapp: userData?.whatsapp || userData?.phone || "",
    university_id: userData?.university?.id || userData?.university_id || "",
    university_name: userData?.university?.name || "",
  }), [userData]);

  const [formData, setFormData] = useState({
    notes: "",
    university_id: "",
  });

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      university_id: profile.university_id || prev.university_id
    }));
  }, [profile.university_id]);

  useEffect(() => {
    const missingProfile = !profile.name || !profile.email || !profile.phone || !profile.whatsapp;
    const missing = !isLoggedIn || missingProfile;
    setProfileMissing(missing);
    if (!isLoggedIn) {
      setProfileMessage(t("universityRepresentative.loginRequired", "Please register and sign in first."));
      return;
    }
    if (missingProfile) {
      setProfileMessage(t("universityRepresentative.profileRequiredMessage", "Complete your profile details first, then come back to submit the request."));
      return;
    }
    setProfileMessage("");
  }, [isLoggedIn, profile]);

  const handleUniversityChange = (val) => {
    setFormData(prev => ({ ...prev, university_id: val }));
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (profileMissing) return toast.error(t("universityRepresentative.profileRequired", "Please complete your profile first."));
    if (!formData.university_id) return toast.error(t("universityRepresentative.errors.university", "University is required"));

    setSubmitting(true);
    try {
      const res = await request("university-representative/apply", {
        method: "POST",
        auth: isLoggedIn,
        body: {
          university_id: String(formData.university_id),
          notes: formData.notes
        }
      });

      if (res && res.success) {
        toast.success(res.message || t("universityRepresentative.pendingMessage"));
        setSuccessMessage(
          res.message ||
          t(
            "universityRepresentative.requestSubmittedNotice",
            "Your request has been sent successfully. Please check your profile for the university students page after your request is reviewed."
          )
        );
        const newRepId = res.data?.id || res.id;
        if (newRepId) {
          onSubmitSuccess(newRepId, profile.name);
        } else {
          toast.error("Application submitted, but reference ID was not returned.");
        }
        setFormData(prev => ({
          ...prev,
          notes: "",
        }));
        window.setTimeout(() => setSuccessMessage(""), 4000);
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
    <div className="container px-4 py-10 mx-auto max-w-4xl animate-slideUp">
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

        <div className="rounded-2xl border border-primary/15 bg-gradient-to-r from-primary/10 via-surface to-secondary/10 p-4 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-text">
                {t("universityRepresentative.followUpTitle", "Need to follow your request?")}
              </p>
              <p className="text-xs leading-relaxed text-text-secondary">
                {t(
                  "universityRepresentative.followUpDescription",
                  "Open your profile to view My University Students and track the status of your representative request."
                )}
              </p>
            </div>
            <Link
              to="/profile"
              state={{ activeTab: "university_students" }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-primary/90 hover:shadow-lg"
            >
              {t("universityRepresentative.goToStudents", "My University Students")}
              <FaArrowRight className="text-xs" />
            </Link>
          </div>
        </div>

        {profileMissing && (
          <div className="flex items-start gap-3 p-4 rounded-xl border border-amber-200 bg-amber-50 text-amber-900">
            <FaExclamationTriangle className="mt-1 shrink-0" />
            <div className="text-sm leading-relaxed">
              <p className="font-semibold">
                {!isLoggedIn
                  ? t("universityRepresentative.loginRequiredTitle", "Please register or sign in first")
                  : t("universityRepresentative.profileRequiredTitle", "Complete your profile first")}
              </p>
              <p className="mt-1">
                {profileMessage}
              </p>
              <div className="flex flex-wrap gap-3 mt-3">
                {!isLoggedIn ? (
                  <Link to="/register" className="inline-flex font-semibold underline">
                    {t("auth.register.title", "Register")}
                  </Link>
                ) : (
                  <Link to="/profile" className="inline-flex font-semibold underline">
                    {t("profile.title", "My Profile")}
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleApplySubmit} className="space-y-4 pt-4 border-t border-border">
          {/* University Dropdown */}
          <UniversitySelect
            t={t}
            request={request}
            selectedId={formData.university_id}
            onChange={handleUniversityChange}
            initialUniversityName={profile.university_name}
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
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows="3"
              placeholder="e.g. Details about your role or association with the university..."
              className="w-full px-4 py-2.5 border rounded-xl bg-background border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition resize-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting || profileMissing}
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

        {successMessage && (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-900 space-y-2">
            <p>{successMessage}</p>
            <p className="text-xs leading-relaxed text-green-800/90">
              {t(
                "universityRepresentative.requestFollowUp",
                "You can always find this page again from your profile under My University Students."
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
