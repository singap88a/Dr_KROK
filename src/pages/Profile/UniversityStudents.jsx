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
  const [debugError, setDebugError] = useState("");

  const loadRepState = useCallback(async () => {
    try {
      setLoading(true);
      setDebugError("");
      // Add a timestamp to bypass any browser/CDN caching on production
      const timestamp = new Date().getTime();
      const res = await request(`university-representative/students?t=${timestamp}`, {
        auth: true,
        useCache: false,
      });
      if (res?.success) {
        setStatus(res.data?.status || null);
        setStudents(res.data?.students || []);
        if (res.data?.rep_id) {
          setRepId(res.data.rep_id);
        }
      } else {
        setStatus(null);
        setStudents([]);
        setDebugError(JSON.stringify(res));
      }
    } catch (error) {
      console.error("Failed to load university students", error);
      setStatus(null);
      setStudents([]);
      setDebugError(error?.message || "Network Error");
    } finally {
      setLoading(false);
    }
  }, [request]);

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
        
        {/* Debug Info for Production Troubleshooting */}
        {process.env.NODE_ENV === "production" || true ? (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left overflow-auto text-xs text-red-800">
            <p className="font-bold mb-2">Technical Debug Info (Please screenshot if issue persists):</p>
            <p><strong>status state:</strong> {String(status)}</p>
            <p><strong>isLoggedIn:</strong> {String(isLoggedIn)}</p>
            <p><strong>debugError:</strong> {String(debugError)}</p>
            <p><strong>students array length:</strong> {students?.length}</p>
            <p><strong>userData exists:</strong> {String(!!userData)}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
