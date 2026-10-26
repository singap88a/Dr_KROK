export function createStoreAndCommunityService(request) {
  // Favorites API functions
  const getFavorites = async () => {
    return await request("favorites", { auth: true });
  };

  const toggleFavorite = async (tableId, type) => {
    const formData = new FormData();
    formData.append("table_id", tableId);
    formData.append("type", type);

    return await request("favorites/toggle", {
      method: "POST",
      body: formData,
      auth: true,
      isFormData: true,
      invalidateCacheOnSuccess: ["favorites"],
    });
  };

  // Instructor API functions
  const getInstructors = async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set("page", params.page);
    if (params.per_page) query.set("per_page", params.per_page);
    const path = query.toString() ? `instructor?${query.toString()}` : "instructor";
    const response = await request(path, { useCache: true });
    return {
      data: Array.isArray(response?.data) ? response.data : response.data || [],
      pagination: response?.pagination || null,
      raw: response,
    };
  };

  const getInstructorById = async (id) => {
    const response = await request(`instructor/${id}`, { useCache: true });
    return response.data;
  };

  // Merchant API functions
  const getMerchants = async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set("page", params.page);
    if (params.per_page) query.set("per_page", params.per_page);
    const path = query.toString() ? `merchants?${query.toString()}` : "merchants";
    const response = await request(path, { useCache: true });
    return {
      data: Array.isArray(response?.data) ? response.data : [],
      pagination: response?.pagination || null,
      raw: response,
    };
  };

  const getMerchantById = async (id) => {
    const response = await request(`merchants/${id}`, { useCache: true });
    return response.data;
  };

  // Blogs API
  const getBlogs = async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set("page", params.page);
    if (params.per_page) query.set("per_page", params.per_page);
    if (params.instructor_id) query.set("instructor_id", params.instructor_id);
    const path = query.toString() ? `blog?${query.toString()}` : "blog";
    const response = await request(path, { useCache: true });
    return {
      data: Array.isArray(response?.data) ? response.data : [],
      pagination: response?.pagination || null,
      raw: response,
    };
  };

  const getBlogBySlug = async (slugOrId) => {
    if (!slugOrId) throw new Error("Article slug is required");

    let decoded = slugOrId;
    try {
      decoded = decodeURIComponent(slugOrId);
    } catch {
      decoded = slugOrId;
    }

    try {
      const direct = await request(`blog/${encodeURIComponent(decoded)}`, {
        useCache: true,
      });
      const blogData = direct?.data;
      if (blogData?.id) {
        return {
          ...blogData,
          instructor: blogData.instructor || blogData.instructor_id || null,
        };
      }
    } catch {
      // Fall back to paginated list search
    }

    let page = 1;
    let totalPages = 1;

    do {
      const response = await request(`blog?page=${page}&per_page=50`, {
        useCache: true,
      });
      const blogs = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
        ? response
        : [];

      for (const blog of blogs) {
        const matchesSlug = blog.slug && blog.slug === decoded;
        const matchesId =
          String(blog.id) === decoded || String(blog.id) === slugOrId;

        if (matchesSlug || matchesId) {
          return {
            ...blog,
            instructor: blog.instructor || blog.instructor_id || null,
          };
        }
      }

      totalPages = response?.pagination?.total_pages || 1;
      page += 1;
    } while (page <= totalPages);

    throw new Error("Article not found");
  };

  // Reviews API
  const submitCourseReview = async (
    courseId,
    rating,
    comment,
    type = "video_course"
  ) => {
    const formData = new FormData();
    formData.append("course_id", courseId);
    formData.append("rate_number", rating);
    formData.append("rate_comment", comment);
    formData.append("type", type);

    return await request("ratings/add", {
      method: "POST",
      body: formData,
      auth: true,
      isFormData: true,
      invalidateCacheOnSuccess: [
        `ratings`,
        `courses/${courseId}`,
        `video_course/${courseId}`,
        `live_course/${courseId}`,
        `center_course/${courseId}`,
      ],
    });
  };

  const getUserRatings = async () => {
    return await request("user/ratings", { auth: true });
  };

  const checkUserReview = async (courseId) => {
    return await request(`courses/${courseId}/user-review`, { auth: true });
  };

  // Orders API
  const getOrders = async () => {
    const response = await request("orders", { auth: true });
    return response.data || { orders: [] };
  };

  const getMyOrderMessages = async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set("page", params.page);
    const path = query.toString()
      ? `profile/my-order-messages?${query.toString()}`
      : "profile/my-order-messages";
    return await request(path, { auth: true, useCache: false });
  };

  const getNotifications = async (params = {}) => {
    const query = new URLSearchParams();
    if (params.page) query.set("page", params.page);
    const path = query.toString()
      ? `profile/my-notifications?${query.toString()}`
      : "profile/my-notifications";
    return await request(path, { auth: true, useCache: true });
  };

  const getJobs = async () => {
    return await request("job", { useCache: true });
  };

  const submitJobApplication = async (formData) => {
    return await request("job_applications", {
      method: "POST",
      body: formData,
      isFormData: true,
      auth: false,
    });
  };

  const getMyMaterials = async () => {
    return await request("profile/my-material", {
      auth: true,
      useCache: true,
    });
  };

  return {
    getFavorites,
    toggleFavorite,
    getInstructors,
    getInstructorById,
    getMerchants,
    getMerchantById,
    getBlogs,
    getBlogBySlug,
    submitCourseReview,
    getUserRatings,
    checkUserReview,
    getOrders,
    getMyOrderMessages,
    getNotifications,
    getJobs,
    submitJobApplication,
    getMyMaterials,
  };
}
