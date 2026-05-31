import React, { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { FaLock } from "react-icons/fa";
import { useApi } from "../../context/ApiContext";
import { useUser } from "../../context/UserContext";
import LoadingSpinner from "../../components/Common/LoadingSpinner";

// Sub-components
import RepApplicationForm from "../../components/UniversityRepresentative/RepApplicationForm";
import RepPendingStatus from "../../components/UniversityRepresentative/RepPendingStatus";
import RepRejectedStatus from "../../components/UniversityRepresentative/RepRejectedStatus";
import RepDashboard from "../../components/UniversityRepresentative/RepDashboard";

export default function UniversityRepresentative() {
  const { t, i18n } = useTranslation();
  const { request } = useApi();
  const { isLoggedIn, userData } = useUser();

  // Representative state
  const [repId, setRepId] = useState(null);
  const [status, setStatus] = useState(null); // 'pending' | 'rejected' | 'approved' | null
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guestName, setGuestName] = useState("");

  // Load repId from localStorage on mount/login
  useEffect(() => {
    let storedRepId = null;
    let storedGuestName = "";
    if (isLoggedIn && userData?.id) {
      storedRepId = localStorage.getItem(`dr_krok_rep_id_${userData.id}`) || localStorage.getItem("dr_krok_rep_id");
    } else {
      storedRepId = localStorage.getItem("dr_krok_rep_id");
      storedGuestName = localStorage.getItem("dr_krok_rep_guest_name") || "";
    }

    if (storedRepId) {
      setRepId(parseInt(storedRepId));
      if (storedGuestName) setGuestName(storedGuestName);
    } else {
      setLoading(false);
    }
  }, [isLoggedIn, userData]);

  // Fetch status and student list
  const fetchStatusAndStudents = useCallback(async (id) => {
    try {
      setLoading(true);
      const res = await request(`university-representative/students?rep_id=${id}`, {
        auth: isLoggedIn,
        useCache: false
      });
      if (res && res.success) {
        const data = res.data || {};
        setStatus(data.status);
        setStudents(data.students || []);
      } else {
        setStatus(null);
      }
    } catch (err) {
      console.error("Error fetching representative status:", err);
      // In case of 404 or other errors (e.g. rep_id deleted on backend), reset state
      setStatus(null);
    } finally {
      setLoading(false);
    }
  }, [request, isLoggedIn]);

  useEffect(() => {
    if (repId) {
      fetchStatusAndStudents(repId);
    }
  }, [repId, fetchStatusAndStudents]);

  const handleApplySuccess = (newRepId, applicantName) => {
    if (isLoggedIn && userData?.id) {
      localStorage.setItem(`dr_krok_rep_id_${userData.id}`, String(newRepId));
    }
    localStorage.setItem("dr_krok_rep_id", String(newRepId));
    if (!isLoggedIn) {
      localStorage.setItem("dr_krok_rep_guest_name", applicantName);
      setGuestName(applicantName);
    }
    setRepId(newRepId);
  };

  const handleReapply = () => {
    if (userData?.id) {
      localStorage.removeItem(`dr_krok_rep_id_${userData.id}`);
    }
    localStorage.removeItem("dr_krok_rep_id");
    localStorage.removeItem("dr_krok_rep_guest_name");
    setRepId(null);
    setStatus(null);
    setStudents([]);
    setGuestName("");
  };

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(i18n.language === "ua" ? "uk-UA" : "en-US", {
        year: "numeric",
        month: "short",
        day: "numeric"
      });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" />;
  }

  // 1. Pending Request State
  if (status === "pending") {
    return (
      <RepPendingStatus
        t={t}
        repId={repId}
        onRefresh={fetchStatusAndStudents}
      />
    );
  }

  // 2. Rejected Request State
  if (status === "rejected") {
    return (
      <RepRejectedStatus
        t={t}
        onReapply={handleReapply}
      />
    );
  }

  // 3. Approved Dashboard State
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

  // 4. Default: Render Form
  return (
    <RepApplicationForm
      t={t}
      request={request}
      isLoggedIn={isLoggedIn}
      userData={userData}
      onSubmitSuccess={handleApplySuccess}
    />
  );
}
