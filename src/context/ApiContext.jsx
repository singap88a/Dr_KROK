import React, { createContext, useContext, useMemo, useCallback } from "react";
import {
  getAuthToken,
  buildUrlHelper,
  clearCache,
  invalidateCache,
  updateCache,
  emitDataUpdate,
  onDataUpdate,
  executeRequest,
} from "./api/apiClient.jsx";
import { usePlatformMaintenance } from "./api/maintenanceService.jsx";
import { createAuthService } from "./api/authService.jsx";
import { createCoursesService } from "./api/coursesService.jsx";
import { createCourseProgressService } from "./api/courseProgressService.jsx";
import { createInteractionsService } from "./api/interactionsService.jsx";
import { createTestsAndCertificatesService } from "./api/testsAndCertificatesService.jsx";
import { createStoreAndCommunityService } from "./api/storeAndCommunityService.jsx";
import { createStudyTrackerService } from "./api/studyTrackerService.jsx";
import { createChatService } from "./api/chatService.jsx";

const ApiContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useApi = () => {
  const ctx = useContext(ApiContext);
  if (!ctx) throw new Error("useApi must be used within an ApiProvider");
  return ctx;
};

export const ApiProvider = ({
  children,
  baseUrl = "https://admin.dr-krok.com/api",
}) => {
  const buildUrl = useCallback(
    (path) => buildUrlHelper(baseUrl, path),
    [baseUrl]
  );

  // Platform Maintenance Hook
  const {
    isMaintenance,
    setIsMaintenance,
    maintenanceData,
    setMaintenanceData,
    checkPlatformStatus,
  } = usePlatformMaintenance(buildUrl);

  const onMaintenanceTrigger = useCallback(
    (data) => {
      setIsMaintenance(true);
      if (data) {
        setMaintenanceData(data);
      }
    },
    [setIsMaintenance, setMaintenanceData]
  );

  // Central Request Engine
  const request = useCallback(
    async (path, options = {}) => {
      return await executeRequest(path, options, {
        baseUrl,
        onMaintenanceTrigger,
      });
    },
    [baseUrl, onMaintenanceTrigger]
  );

  // Domain Services Initialization
  const authService = useMemo(() => createAuthService(request), [request]);
  const coursesService = useMemo(() => createCoursesService(request), [request]);
  const progressService = useMemo(() => createCourseProgressService(request), [request]);
  const interactionsService = useMemo(() => createInteractionsService(request), [request]);
  const testsAndCertificatesService = useMemo(
    () => createTestsAndCertificatesService(request, buildUrl),
    [request, buildUrl]
  );
  const storeAndCommunityService = useMemo(
    () => createStoreAndCommunityService(request),
    [request]
  );
  const studyTrackerService = useMemo(
    () => createStudyTrackerService(request),
    [request]
  );
  const chatService = useMemo(() => createChatService(request), [request]);

  // Combined context value maintaining 100% backwards compatibility
  const value = useMemo(
    () => ({
      baseUrl,
      buildUrl,
      request,
      getAuthToken,

      // Cache & Realtime Event Helpers
      clearCache,
      invalidateCache,
      updateCache,
      emitDataUpdate,
      onDataUpdate,

      // Platform Status & Maintenance
      isMaintenance,
      maintenanceData,
      checkPlatformStatus,

      // Auth Service
      ...authService,

      // Courses & Subscription Service
      ...coursesService,

      // Course Progress Service
      ...progressService,

      // Lesson Interactions & Essay Questions
      ...interactionsService,

      // Tests, Reviews & Certificates Service
      ...testsAndCertificatesService,

      // Store, Instructors, Merchants, Blogs, Orders, Jobs & Community
      ...storeAndCommunityService,

      // Study Tracker & Streak System
      ...studyTrackerService,

      // Gemini AI Chat Service
      ...chatService,
    }),
    [
      baseUrl,
      buildUrl,
      request,
      isMaintenance,
      maintenanceData,
      checkPlatformStatus,
      authService,
      coursesService,
      progressService,
      interactionsService,
      testsAndCertificatesService,
      storeAndCommunityService,
      studyTrackerService,
      chatService,
    ]
  );

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};
