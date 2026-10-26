import axios from "axios";
import i18n from "../../i18n";
import { globalEvents } from "./apiCache.jsx";

export function createTestsAndCertificatesService(request, buildUrl) {
  // Add student test results
  const addStudentTest = async (testData) => {
    console.log("🎯 addStudentTest called with:", testData);

    try {
      const response = await request("add_student_test", {
        method: "POST",
        body: testData,
        auth: true,
        invalidateCacheOnSuccess: [
          `progress`,
          `courses/${testData.course_id}`,
          `student_test`,
          `test`,
        ],
      });

      globalEvents.emit("dataUpdated", {
        type: "testCompleted",
        courseId: testData.course_id,
        lessonId: testData.lesson_id,
        testId: testData.test_id,
      });

      return response;
    } catch (error) {
      console.error("❌ Error in addStudentTest:", error);

      const formData = new FormData();
      formData.append("test_id", testData.test_id?.toString() || "");
      formData.append("course_id", testData.course_id?.toString() || "");
      if (testData.lesson_id) {
        formData.append("lesson_id", testData.lesson_id?.toString() || "");
      }
      formData.append("type", testData.type || "");
      formData.append("student_score", testData.student_score?.toString() || "0");
      formData.append("total_score", testData.total_score?.toString() || "0");
      formData.append("result_status", testData.result_status?.toString() || "1");
      formData.append("total_questions", testData.total_questions?.toString() || "0");
      formData.append("questions", JSON.stringify(testData.questions || []));

      try {
        const formDataResponse = await request("add_student_test", {
          method: "POST",
          body: formData,
          auth: true,
          isFormData: true,
          invalidateCacheOnSuccess: [
            `progress`,
            `courses/${testData.course_id}`,
            `student_test`,
            `test`,
          ],
        });

        globalEvents.emit("dataUpdated", {
          type: "testCompleted",
          courseId: testData.course_id,
          lessonId: testData.lesson_id,
          testId: testData.test_id,
        });

        return formDataResponse;
      } catch (formDataError) {
        console.error("❌ FormData also failed:", formDataError);
        throw formDataError;
      }
    }
  };

  // Check student test
  const checkStudentTest = async (testData) => {
    console.log("🔍 checkStudentTest called with:", testData);

    try {
      const response = await request("checkStudentTest", {
        method: "POST",
        body: testData,
        auth: true,
        invalidateCacheOnSuccess: [`student_test`, `test`],
      });

      console.log("✅ checkStudentTest response:", response);
      return response;
    } catch (error) {
      console.error("❌ Error in checkStudentTest:", error);

      const formData = new FormData();
      formData.append("test_id", testData.test_id?.toString() || "");
      formData.append("course_id", testData.course_id?.toString() || "");
      if (testData.lesson_id) {
        formData.append("lesson_id", testData.lesson_id?.toString() || "");
      }
      formData.append("type", testData.type || "");

      try {
        const formDataResponse = await request("checkStudentTest", {
          method: "POST",
          body: formData,
          auth: true,
          isFormData: true,
          invalidateCacheOnSuccess: [`student_test`, `test`],
        });

        console.log("✅ FormData response for checkStudentTest:", formDataResponse);
        return formDataResponse;
      } catch (formDataError) {
        console.error("❌ FormData also failed for checkStudentTest:", formDataError);
        throw formDataError;
      }
    }
  };

  const getStudentTestReview = async (testId, studentTestId) => {
    console.log("🔍 getStudentTestReview called with:", { testId, studentTestId });
    return await request(
      `student_test_review?test_id=${testId}&student_test_id=${studentTestId}`,
      {
        auth: true,
        useCache: false,
      }
    );
  };

  // Final Test Results API
  const getFinalTestResult = async (courseId) => {
    if (!courseId) throw new Error("Course id is required");

    const candidates = [
      `live_courses/${courseId}/final-test-result`,
      `courses/${courseId}/final-test-result`,
    ];

    for (const path of candidates) {
      try {
        const response = await request(path, { auth: true });
        if (response && response.data) return response.data;
      } catch (err) {
        if (err?.status !== 404) {
          console.warn(`Failed with endpoint ${path}:`, err);
        }
      }
    }
    return null;
  };

  const saveFinalTestResult = async (courseId, testData) => {
    if (!courseId) throw new Error("Course id is required");
    try {
      const formData = new FormData();
      formData.append("course_id", courseId.toString());
      formData.append("score", testData.score?.toString() || "0");
      formData.append("percentage", testData.percentage?.toString() || "0");
      formData.append("passed", testData.passed ? "1" : "0");

      const candidates = [
        `live_courses/${courseId}/final-test-result`,
        `courses/${courseId}/final-test-result`,
      ];

      for (const path of candidates) {
        try {
          const response = await request(path, {
            method: "POST",
            body: formData,
            auth: true,
            isFormData: true,
            invalidateCacheOnSuccess: [
              `courses/${courseId}`,
              `video_course/${courseId}`,
              `live_courses/${courseId}`,
              `live_course/${courseId}`,
              `final-test-result`,
            ],
          });
          return response?.data || null;
        } catch (err) {
          if (err?.status !== 404) {
            console.warn(`Failed saving final test result with endpoint ${path}:`, err);
          }
        }
      }
      throw new Error("Failed to save final test result for both paths");
    } catch (err) {
      console.error("Failed to save final test result:", err);
      throw err;
    }
  };

  // Certificate API functions
  const uploadCertificate = async (token, formData) => {
    if (!token) throw new Error("Token is required");
    if (!formData) throw new Error("FormData is required");

    try {
      const response = await request("create_student_certificate", {
        method: "POST",
        body: formData,
        auth: true,
        isFormData: true,
      });
      return response;
    } catch (error) {
      console.error("Failed to upload certificate:", error);

      try {
        const url = buildUrl("create_student_certificate");
        const axiosResponse = await axios.post(url, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          timeout: 30000,
        });
        return axiosResponse.data;
      } catch (axiosError) {
        console.error("Axios upload also failed:", axiosError);
        throw axiosError;
      }
    }
  };

  const getCertificateFile = async (token, courseId, courseType = "video") => {
    if (!token) throw new Error("Token is required");
    if (!courseId) throw new Error("Course id is required");

    try {
      const url = buildUrl(`get_certificate_file?course_id=${courseId}&type=${courseType}`);
      console.log("🔍 Fetching certificate from:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/pdf, application/json, */*",
          "Accept-Language": (i18n?.language || "en").split("-")[0],
        },
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("CERTIFICATE_NOT_FOUND");
        }
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        const jsonResponse = await response.json();
        console.log("📄 JSON Response:", jsonResponse);

        if (
          jsonResponse &&
          (jsonResponse.code === 200 || jsonResponse.code === 208) &&
          jsonResponse.success
        ) {
          if (jsonResponse.data && jsonResponse.data.certificate) {
            const certificateUrl = jsonResponse.data.certificate;
            console.log("📥 Downloading certificate from URL:", certificateUrl);

            try {
              const pdfResponse = await fetch(certificateUrl, {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
                signal: AbortSignal.timeout(30000),
              });

              if (pdfResponse.ok) {
                const pdfBlob = await pdfResponse.blob();
                if (pdfBlob && pdfBlob.size > 0) {
                  console.log("✅ Certificate downloaded successfully, size:", pdfBlob.size);
                  return pdfBlob;
                } else {
                  console.warn("⚠️ Certificate blob is empty");
                  throw new Error("CERTIFICATE_EMPTY");
                }
              } else {
                console.warn("⚠️ Failed to download certificate from URL:", pdfResponse.status);
                throw new Error("CERTIFICATE_DOWNLOAD_FAILED");
              }
            } catch (fetchError) {
              console.warn("⚠️ Error fetching certificate URL:", fetchError.message);
              throw new Error("CERTIFICATE_URL_FETCH_FAILED");
            }
          } else {
            throw new Error("CERTIFICATE_URL_MISSING");
          }
        } else {
          throw new Error(jsonResponse.message || "CERTIFICATE_NOT_AVAILABLE");
        }
      } else if (contentType.includes("application/pdf")) {
        const blob = await response.blob();
        if (!blob || blob.size === 0) {
          throw new Error("CERTIFICATE_EMPTY");
        }
        console.log("✅ PDF received directly, size:", blob.size);
        return blob;
      } else {
        console.warn("⚠️ Unknown content type, trying as PDF:", contentType);
        const blob = await response.blob();
        if (blob && blob.size > 1000) {
          console.log("✅ PDF received (unknown type), size:", blob.size);
          return blob;
        }
        throw new Error("UNKNOWN_CONTENT_TYPE");
      }
    } catch (error) {
      console.error("❌ Failed to get certificate file:", error);

      if (
        error.name === "TimeoutError" ||
        error.name === "TypeError" ||
        error.message.includes("Failed to fetch")
      ) {
        throw new Error("NETWORK_ERROR");
      }

      if (error.message.startsWith("CERTIFICATE_") || error.message === "CERTIFICATE_NOT_FOUND") {
        throw error;
      }

      throw new Error("CERTIFICATE_FETCH_ERROR");
    }
  };

  const checkCertificateExists = async (token, courseId, courseType = "video") => {
    if (!token) throw new Error("Token is required");
    if (!courseId) throw new Error("Course id is required");

    try {
      const url = buildUrl(`get_certificate_file?course_id=${courseId}&type=${courseType}`);
      console.log("🔍 Checking if certificate exists:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        return false;
      }

      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        const jsonResponse = await response.json();
        console.log("📄 Certificate check response:", jsonResponse);

        if (
          jsonResponse &&
          (jsonResponse.code === 200 || jsonResponse.code === 208) &&
          jsonResponse.success
        ) {
          if (jsonResponse.data && jsonResponse.data.certificate) {
            console.log("✅ Certificate exists on server");
            return true;
          }
        }
      } else if (contentType && contentType.includes("application/pdf")) {
        console.log("✅ Certificate exists (PDF response)");
        return true;
      }

      return false;
    } catch (error) {
      console.error("❌ Failed to check certificate existence:", error);
      return false;
    }
  };

  const getCertificateUrl = async (token, courseId, courseType = "video") => {
    if (!token) throw new Error("Token is required");
    if (!courseId) throw new Error("Course id is required");

    try {
      const url = buildUrl(`get_certificate_file?course_id=${courseId}&type=${courseType}`);
      console.log("🔍 Getting certificate URL from:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        const jsonResponse = await response.json();
        console.log("📄 Certificate URL response:", jsonResponse);

        if (
          jsonResponse &&
          (jsonResponse.code === 200 || jsonResponse.code === 208) &&
          jsonResponse.success
        ) {
          if (jsonResponse.data && jsonResponse.data.certificate) {
            const certificateUrl = jsonResponse.data.certificate;
            console.log("✅ Certificate URL found:", certificateUrl);
            return certificateUrl;
          }
        }
        throw new Error(jsonResponse.message || "Certificate URL not found in response");
      } else if (contentType && contentType.includes("application/pdf")) {
        const blob = await response.blob();
        if (blob && blob.size > 0) {
          const blobUrl = URL.createObjectURL(blob);
          console.log("✅ PDF received directly, created blob URL");
          return blobUrl;
        }
        throw new Error("Empty PDF received from server");
      } else {
        throw new Error(`Unexpected content type: ${contentType}`);
      }
    } catch (error) {
      console.error("❌ Failed to get certificate URL:", error);
      throw error;
    }
  };

  return {
    addStudentTest,
    checkStudentTest,
    getStudentTestReview,
    getFinalTestResult,
    saveFinalTestResult,
    uploadCertificate,
    getCertificateFile,
    checkCertificateExists,
    getCertificateUrl,
  };
}
