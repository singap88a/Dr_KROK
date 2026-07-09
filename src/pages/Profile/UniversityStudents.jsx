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

  const loadRepState = useCallback(async () => {
    try {
      setLoading(true);
      // Backend should infer the representative from the Auth Token
      const res = await request(`university-representative/students`, {
        auth: isLoggedIn,
        useCache: false,
      });
      if (res?.success) {
        setStatus(res.data?.status || null);
        setStudents(res.data?.students || []);
        // Update repId from response if available
        if (res.data?.rep_id) {
          setRepId(res.data.rep_id);
        }
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
    if (isLoggedIn) {
      setGuestName(userData?.name || "");
      loadRepState();
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

  // Fallback if status is null or missing
  return (
    <div className="container px-4 py-10 mx-auto max-w-4xl">
      <div className="p-8 bg-surface border border-border rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10 text-primary">
            <FaUsers />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{t("universityRepresentative.studentsList", "My university students")}</h1>
            <p className="text-text-secondary mt-1">
              {t("universityRepresentative.noStudentsData", "You don't have any students or there is no data available.")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
