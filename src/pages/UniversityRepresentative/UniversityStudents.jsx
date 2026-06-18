import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaBuilding, FaArrowLeft, FaUsers } from "react-icons/fa";
import { useApi } from "../../context/ApiContext";
import { useUser } from "../../context/UserContext";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import RepPendingStatus from "../../components/UniversityRepresentative/RepPendingStatus";
import RepRejectedStatus from "../../components/UniversityRepresentative/RepRejectedStatus";
import RepDashboard from "../../components/UniversityRepresentative/RepDashboard";

export default function UniversityStudents() {
  const { t, i18n } = useTranslation();
  const { request } = useApi();
  const { isLoggedIn, userData } = useUser();
  const [loading, setLoading] = useState(true);
  const [repId, setRepId] = useState(null);
  const [status, setStatus] = useState(null);
  const [students, setStudents] = useState([]);
  const [guestName, setGuestName] = useState("");

  const loadRepState = useCallback(async (id) => {
    try {
      setLoading(true);
      const res = await request(`university-representative/students?rep_id=${id}`, {
        auth: isLoggedIn,
        useCache: false,
      });
      if (res?.success) {
        setStatus(res.data?.status || null);
        setStudents(res.data?.students || []);
      } else {
        setStatus(null);
        setStudents([]);
      }
    } catch (error) {
      console.error("Failed to load university students", error);
      setStatus(null);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [isLoggedIn, request]);

  useEffect(() => {
    const storedRepId = isLoggedIn && userData?.id
      ? localStorage.getItem(`dr_krok_rep_id_${userData.id}`) || localStorage.getItem("dr_krok_rep_id")
      : localStorage.getItem("dr_krok_rep_id");

    const storedGuestName = localStorage.getItem("dr_krok_rep_guest_name") || "";

    if (storedRepId) {
      setRepId(parseInt(storedRepId, 10));
      if (storedGuestName) setGuestName(storedGuestName);
      loadRepState(storedRepId);
    } else {
      setLoading(false);
    }
  }, [isLoggedIn, userData, loadRepState]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(i18n.language === "ua" ? "uk-UA" : "en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!repId) {
    return (
      <div className="container px-4 py-10 mx-auto max-w-4xl">
        <div className="p-8 bg-surface border border-border rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10 text-primary">
              <FaBuilding />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{t("universityRepresentative.studentsList", "My University Students")}</h1>
              <p className="text-text-secondary">
                {t(
                  "universityRepresentative.studentsHint",
                  "This page appears after your representative request is created. Use the request page to submit university details and notes."
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-border bg-background text-text font-semibold hover:bg-surface transition"
            >
              <FaArrowLeft />
              {t("profile.title", "My Profile")}
            </Link>
            <Link
              to="/university-representative"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition"
            >
              <FaUsers />
              {t("universityRepresentative.submit", "Submit Request")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (status === "pending") {
    return <RepPendingStatus t={t} repId={repId} onRefresh={loadRepState} />;
  }

  if (status === "rejected") {
    return <RepRejectedStatus t={t} onReapply={() => window.location.assign("/university-representative")} />;
  }

  if (status === "approved") {
    return (
      <RepDashboard
        t={t}
        i18n={i18n}
        students={students}
        userData={userData}
        guestName={guestName}
        formatDate={formatDate}
      />
    );
  }

  return (
    <div className="container px-4 py-10 mx-auto max-w-4xl">
      <div className="p-8 bg-surface border border-border rounded-2xl shadow-sm space-y-4">
        <h1 className="text-2xl font-bold">{t("universityRepresentative.studentsList", "My University Students")}</h1>
        <p className="text-text-secondary">
          {t("universityRepresentative.pendingMessage", "Your request has been submitted successfully. We will review it shortly.")}
        </p>
      </div>
    </div>
  );
}
