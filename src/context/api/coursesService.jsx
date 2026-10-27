import { globalEvents } from "./apiCache.jsx";

export function createCoursesService(request) {
  // Placement Courses API
  const getPlacementCourses = async (params = {}) => {
    const type = params.type || "all";

    if (type === "video") {
      const res = await request("placementCourses/video", { useCache: true });
      const list = Array.isArray(res?.data)
        ? res.data.map((c) => ({ ...c, type: "video" }))
        : [];
      return { data: list, raw: res };
    }
    if (type === "live") {
      const res = await request("placementCourses/live", { useCache: true });
      const list = Array.isArray(res?.data)
        ? res.data.map((c) => ({ ...c, type: "live" }))
        : [];
      return { data: list, raw: res };
    }
    const [videoRes, liveRes] = await Promise.all([
      request("placementCourses/video", { useCache: true }),
      request("placementCourses/live", { useCache: true }),
    ]);
    const video = Array.isArray(videoRes?.data)
      ? videoRes.data.map((c) => ({ ...c, type: "video" }))
      : [];
    const live = Array.isArray(liveRes?.data)
      ? liveRes.data.map((c) => ({ ...c, type: "live" }))
      : [];
    return { data: [...video, ...live], raw: { video: videoRes, live: liveRes } };
  };

  // Video Courses API
  const getVideoCourses = async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set("page", params.page);
    if (params.per_page) query.set("per_page", params.per_page);
    const path = query.toString() ? `video_courses?${query.toString()}` : "video_courses";
    const response = await request(path, { useCache: true });
    return {
      data: Array.isArray(response?.data) ? response.data : [],
      pagination: response?.pagination || null,
      raw: response,
    };
  };

  const getLiveCourses = async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set("page", params.page);
    if (params.per_page) query.set("per_page", params.per_page);
    const path = query.toString() ? `live_courses?${query.toString()}` : "live_courses";
    const response = await request(path, { useCache: true });
    return {
      data: Array.isArray(response?.data) ? response.data : [],
      pagination: response?.pagination || null,
      raw: response,
    };
  };

  const getVideoCourseById = async (id, auth = false) => {
    if (!id) throw new Error("Course id is required");
    let itemData = null;
    try {
      const response = await request(`video_course/${id}`, { auth, useCache: true });
      if (response && response.data && (response.data.id || response.data.title))
        itemData = response.data;
      else if (response && (response.id || response.title)) itemData = response;
    } catch (err) {
      if (err?.status === 404) {
        const candidates = [`courses/video/${id}`, `courses/${id}`];
        for (const path of candidates) {
          try {
            const res2 = await request(path, { auth, useCache: true });
            if (res2?.data && (res2.data.id || res2.data.title)) {
              itemData = res2.data;
              break;
            }
          } catch {
            /* try next */
          }
        }
      }
    }

    if (!itemData) {
      try {
        const listRes = await request(`video_courses?per_page=100`, { useCache: true });
        if (listRes && Array.isArray(listRes.data)) {
          const found = listRes.data.find(
            (c) => c.slug === id || String(c.id) === String(id)
          );
          if (found) {
            if (found.id) {
              try {
                const fullRes = await request(`video_course/${found.id}`, {
                  auth,
                  useCache: true,
                });
                itemData = fullRes?.data || found;
              } catch {
                itemData = found;
              }
            } else {
              itemData = found;
            }
          }
        }
      } catch (fallbackErr) {
        console.error("Fallback fetch for video course failed", fallbackErr);
      }
    }

    if (!itemData) throw new Error("Course not found");
    return itemData;
  };

  const getLiveCourseById = async (id, auth = false) => {
    if (!id) throw new Error("Course id is required");
    let itemData = null;
    try {
      const response = await request(`live_course/${id}`, { auth, useCache: true });
      if (response && response.data && (response.data.id || response.data.title))
        itemData = response.data;
      else if (response && (response.id || response.title)) itemData = response;
    } catch (err) {
      if (err?.status === 404) {
        const candidates = [`courses/live/${id}`, `courses/${id}`];
        for (const path of candidates) {
          try {
            const res2 = await request(path, { auth, useCache: true });
            if (res2?.data && (res2.data.id || res2.data.title)) {
              itemData = res2.data;
              break;
            }
          } catch {
            /* try next */
          }
        }
      }
    }

    if (!itemData) {
      try {
        const listRes = await request(`live_courses?per_page=100`, { useCache: true });
        if (listRes && Array.isArray(listRes.data)) {
          const found = listRes.data.find(
            (c) => c.slug === id || String(c.id) === String(id)
          );
          if (found) {
            if (found.id) {
              try {
                const fullRes = await request(`live_course/${found.id}`, {
                  auth,
                  useCache: true,
                });
                itemData = fullRes?.data || found;
              } catch {
                itemData = found;
              }
            } else {
              itemData = found;
            }
          }
        }
      } catch (fallbackErr) {
        console.error("Fallback fetch for live course failed", fallbackErr);
      }
    }

    if (!itemData) throw new Error("Course not found");
    return itemData;
  };

  const getCenterCourses = async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set("page", params.page);
    if (params.per_page) query.set("per_page", params.per_page);
    if (params.filter) query.set("filter", params.filter);
    const path = query.toString() ? `center-courses?${query.toString()}` : "center-courses";
    const response = await request(path, { useCache: true });
    return {
      data: Array.isArray(response?.data) ? response.data : [],
      pagination: response?.pagination || null,
      raw: response,
    };
  };

  const filterCourses = async (params = {}) => {
    const query = new URLSearchParams();
    if (params.type) query.set("type", params.type);
    if (params.specialization_id) query.set("specialization_id", params.specialization_id);
    if (params.college_year) query.set("college_year", params.college_year);
    if (params.page) query.set("page", params.page);
    if (params.per_page) query.set("per_page", params.per_page);
    const path = `courses/filter?${query.toString()}`;
    const response = await request(path, { useCache: false });
    return {
      data: Array.isArray(response?.data) ? response.data : [],
      pagination: response?.pagination || null,
      raw: response,
    };
  };

  const getCenterCourseById = async (id, auth = false) => {
    if (!id) throw new Error("Course id is required");
    let itemData = null;
    try {
      const response = await request(`center-courses/${id}`, { auth, useCache: true });
      if (response && response.data && (response.data.id || response.data.title))
        itemData = response.data;
      else if (response && (response.id || response.title)) itemData = response;
    } catch {
      // ignore
    }

    if (!itemData) throw new Error("Course not found");
    return itemData;
  };

  const getLiveCourseLessons = async (courseId) => {
    if (!courseId) throw new Error("Course id is required");
    try {
      const response = await request(`live_courses/${courseId}/lessons`, {
        useCache: true,
      });
      return {
        data: Array.isArray(response?.data) ? response.data : [],
        raw: response,
      };
    } catch (err) {
      const candidates = [
        `courses/${courseId}/lessons`,
        `lessons?course_id=${courseId}`,
      ];
      for (const path of candidates) {
        try {
          const res2 = await request(path, { useCache: true });
          if (res2?.data) {
            return {
              data: Array.isArray(res2.data) ? res2.data : [],
              raw: res2,
            };
          }
        } catch {
          // try next
        }
      }
      throw err;
    }
  };

  const getCourseLessons = async (courseId) => {
    if (!courseId) throw new Error("Course id is required");
    try {
      const response = await request(`video_courses/${courseId}/lessons`, {
        useCache: true,
      });
      return {
        data: Array.isArray(response?.data) ? response.data : [],
        raw: response,
      };
    } catch (err) {
      const candidates = [
        `courses/${courseId}/lessons`,
        `lessons?course_id=${courseId}`,
      ];
      for (const path of candidates) {
        try {
          const res2 = await request(path, { useCache: true });
          if (res2?.data) {
            return {
              data: Array.isArray(res2.data) ? res2.data : [],
              raw: res2,
            };
          }
        } catch {
          // try next
        }
      }
      throw err;
    }
  };

  const getCourseAccess = async (courseId, type = null) => {
    if (!courseId) throw new Error("Course id is required");
    try {
      const response = await request(`profile/get-my-courses`, { auth: true });
      const myCourses = response.data || [];

      const detectType = (item) => {
        if (!item) return null;
        if (item.type) return String(item.type);
        if (item.course_type) return String(item.course_type);
        if (item.is_live !== undefined) return item.is_live ? "live_course" : "video_course";
        if (item.resource_type) return String(item.resource_type);
        return null;
      };

      if (type) {
        return myCourses.some((c) => {
          const itemId = Number(c.id || c.course_id || c.id_course || 0);
          const itemType = detectType(c);
          return itemId === Number(courseId) && itemType && itemType.includes(type);
        });
      }

      return myCourses.some((course) => Number(course.id) === Number(courseId));
    } catch (err) {
      console.warn("Failed to get my courses for access check:", err);
      return false;
    }
  };

  const subscribeToCourse = async (
    courseId,
    paymentMethod,
    amount,
    couponId = null,
    usePoints = false,
    paymentPlan = "cash"
  ) => {
    const formData = new FormData();
    const userData = JSON.parse(localStorage.getItem("DR_KROK_user") || "{}");
    const userId = userData.id || userData.user_id || userData.client_id || courseId;

    formData.append("client_id", userId.toString());
    formData.append("course_id", courseId.toString());
    formData.append("payment_method", paymentMethod);
    formData.append("amount", amount.toString());
    formData.append("deposit_amount", amount.toString());
    formData.append("payment_plan", paymentPlan || "cash");
    if (couponId) {
      formData.append("coupon_id", couponId);
    }
    if (usePoints) {
      formData.append("use_points", "1");
    }

    try {
      const result = await request("place_video_course", {
        method: "POST",
        body: formData,
        auth: true,
        isFormData: true,
        invalidateCacheOnSuccess: [
          `profile/get-my-courses`,
          `video_course/${courseId}`,
          `course/${courseId}`,
          `courses/${courseId}`,
          "my-courses",
        ],
      });

      globalEvents.emit("dataUpdated", {
        type: "purchaseSuccess",
        courseId: courseId,
        courseType: "video_course",
        source: "subscribeToCourse",
      });

      return result;
    } catch (error) {
      console.error("Purchase error for video course:", error);
      throw error;
    }
  };

  const subscribeToLiveCourse = async (
    courseId,
    paymentMethod,
    amount,
    couponId = null,
    usePoints = false,
    paymentPlan = "cash"
  ) => {
    const formData = new FormData();
    const userData = JSON.parse(localStorage.getItem("DR_KROK_user") || "{}");
    const userId = userData.id || userData.user_id || userData.client_id || courseId;

    formData.append("client_id", userId.toString());
    formData.append("course_id", courseId.toString());
    formData.append("payment_method", paymentMethod);
    formData.append("amount", amount.toString());
    formData.append("deposit_amount", amount.toString());
    formData.append("payment_plan", paymentPlan || "cash");
    if (couponId) {
      formData.append("coupon_id", couponId);
    }
    if (usePoints) {
      formData.append("use_points", "1");
    }

    try {
      const result = await request("place_live_course", {
        method: "POST",
        body: formData,
        auth: true,
        isFormData: true,
        invalidateCacheOnSuccess: [
          `profile/get-my-courses`,
          `live_course/${courseId}`,
          `course/${courseId}`,
          `courses/${courseId}`,
          "my-courses",
        ],
      });

      globalEvents.emit("dataUpdated", {
        type: "purchaseSuccess",
        courseId: courseId,
        courseType: "live_course",
        source: "subscribeToLiveCourse",
      });

      return result;
    } catch (error) {
      console.error("Purchase error for live course:", error);
      throw error;
    }
  };

  const subscribeToCenterCourse = async (
    courseId,
    paymentMethod,
    amount,
    couponId = null,
    usePoints = false
  ) => {
    const formData = new FormData();
    const userData = JSON.parse(localStorage.getItem("DR_KROK_user") || "{}");
    const userId = userData.id || userData.user_id || userData.client_id || courseId;

    formData.append("client_id", userId.toString());
    formData.append("course_id", courseId.toString());
    formData.append("payment_method", paymentMethod);
    formData.append("amount", amount.toString());
    formData.append("deposit_amount", amount.toString());
    if (couponId) {
      formData.append("coupon_id", couponId);
    }
    if (usePoints) {
      formData.append("use_points", "1");
    }

    try {
      const result = await request("place_center_course", {
        method: "POST",
        body: formData,
        auth: true,
        isFormData: true,
        invalidateCacheOnSuccess: [
          `profile/get-my-courses`,
          `center-courses/${courseId}`,
          `course/${courseId}`,
          `center-courses`,
          "my-courses",
        ],
      });

      globalEvents.emit("dataUpdated", {
        type: "purchaseSuccess",
        courseId: courseId,
        courseType: "center_course",
        source: "subscribeToCenterCourse",
      });

      return result;
    } catch (error) {
      console.error("Purchase error for center course:", error);
      throw error;
    }
  };

  const getMyCourses = async () => {
    const response = await request("profile/get-my-courses", { auth: true });
    return response.data || [];
  };

  const getMyLiveSchedule = async (params = {}, { useCache = false } = {}) => {
    const query = new URLSearchParams();
    if (params.only_lessons !== undefined) {
      query.append("only_lessons", params.only_lessons ? "1" : "0");
    } else {
      query.append("only_lessons", "1");
    }
    if (params.status && params.status !== "all") {
      query.append("status", params.status);
    }
    if (params.only_active !== undefined) {
      query.append("only_active", params.only_active ? "1" : "0");
    }
    if (params.course_id) {
      query.append("course_id", params.course_id);
    }

    const queryString = query.toString();
    const primaryEndpoint = `live-courses/my-schedule${queryString ? `?${queryString}` : ""}`;
    const fallbackEndpoint = `profile/my-live-schedule${queryString ? `?${queryString}` : ""}`;

    try {
      const res = await request(primaryEndpoint, {
        auth: true,
        useCache,
        cacheTTL: 2 * 60 * 1000,
      });
      if (res?.success) return res;
      return await request(fallbackEndpoint, {
        auth: true,
        useCache,
        cacheTTL: 2 * 60 * 1000,
      });
    } catch {
      return await request(fallbackEndpoint, {
        auth: true,
        useCache,
        cacheTTL: 2 * 60 * 1000,
      });
    }
  };

  return {
    getPlacementCourses,
    getVideoCourses,
    getLiveCourses,
    getVideoCourseById,
    getLiveCourseById,
    getCenterCourses,
    filterCourses,
    getCenterCourseById,
    getLiveCourseLessons,
    getCourseLessons,
    getCourseAccess,
    subscribeToCourse,
    subscribeToLiveCourse,
    subscribeToCenterCourse,
    getMyCourses,
    getMyLiveSchedule,
  };
}
