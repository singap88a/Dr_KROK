import { useState, useCallback, useEffect } from "react";
import i18n from "../../i18n";

export function usePlatformMaintenance(buildUrl) {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [maintenanceData, setMaintenanceData] = useState(null);
  const [isCheckingMaintenance, setIsCheckingMaintenance] = useState(true);

  // Check Platform Maintenance Status
  const checkPlatformStatus = useCallback(
    async (langOverride = null) => {
      try {
        const currentLng = (
          langOverride ||
          i18n?.language ||
          localStorage.getItem("DR_KROK_i18nextLng") ||
          localStorage.getItem("language") ||
          "en"
        ).split("-")[0];
        const backendLng = currentLng === "ua" ? "uk" : currentLng;

        const response = await fetch(buildUrl("platform-status"), {
          headers: {
            Accept: "application/json",
            "Accept-Language": backendLng,
            "X-Requested-With": "XMLHttpRequest",
          },
        });

        if (!response.ok) {
          if (response.status === 503) {
            setIsMaintenance(true);
            return { is_maintenance: true };
          }
          return null;
        }

        const json = await response.json();
        const statusData = json?.data || json;
        const maintenance = Boolean(
          statusData?.is_maintenance === true ||
            statusData?.is_maintenance === 1 ||
            statusData?.is_maintenance === "1" ||
            statusData?.is_maintenance === "true"
        );

        setIsMaintenance((prev) => (prev !== maintenance ? maintenance : prev));
        if (maintenance) {
          setMaintenanceData(statusData);
        }
        return statusData;
      } catch (err) {
        console.warn("Could not check platform status:", err);
        return null;
      } finally {
        setIsCheckingMaintenance(false);
      }
    },
    [buildUrl]
  );

  // Initial and periodic platform status polling
  useEffect(() => {
    checkPlatformStatus();
    const interval = setInterval(() => {
      checkPlatformStatus();
    }, 45000);
    return () => clearInterval(interval);
  }, [checkPlatformStatus]);

  // Re-check when i18n language changes
  useEffect(() => {
    const handleLangChange = (lng) => {
      checkPlatformStatus(lng);
    };
    if (i18n?.on) {
      i18n.on("languageChanged", handleLangChange);
      return () => i18n.off("languageChanged", handleLangChange);
    }
  }, [checkPlatformStatus]);

  return {
    isMaintenance,
    setIsMaintenance,
    maintenanceData,
    setMaintenanceData,
    isCheckingMaintenance,
    checkPlatformStatus,
  };
}
