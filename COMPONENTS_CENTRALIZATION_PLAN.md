# خطة نقل وتوحيد المكونات داخل `src/components/` (Components Centralization Plan)

> **الهدف:** نقل جميع المكونات الفرعية الموجودة حالياً داخل مجلدات `src/pages/` إلى المجلد المركزي `src/components/` بتنظيم شجري احترافي، وتعديل جميع مسارات الاستيراد (Imports) في الصفحات والمكونات، مع الحفاظ الكامل على التصميم والأنميشن والـ Logic بنسبة 100%.

---

## 📁 1. خريطة النقل الشاملة (Source ➔ Target Mapping)

### أ. مكونات البروفايل (Profile Components)
**المسار القديم:** `src/pages/Profile/components/`  
**المسار الجديد الموحد:** `src/components/Profile/`

| الملف الأصلي في `src/pages/Profile/components/` | المسار الجديد في `src/components/Profile/` | الصفحات المستهلكة (Consumer Files) |
|---|---|---|
| `ProfileSidebar.jsx` | `src/components/Profile/ProfileSidebar.jsx` | `src/pages/Profile/Profile.jsx` |
| `courses/CourseProgressCard.jsx` | `src/components/Profile/courses/CourseProgressCard.jsx` | `src/pages/Profile/MyCourses.jsx` |
| `courses/CoursesFilterBar.jsx` | `src/components/Profile/courses/CoursesFilterBar.jsx` | `src/pages/Profile/MyCourses.jsx` |
| `courses/CoursesSummaryHeader.jsx` | `src/components/Profile/courses/CoursesSummaryHeader.jsx` | `src/pages/Profile/MyCourses.jsx` |
| `courses/TestsHistoryModal.jsx` | `src/components/Profile/courses/TestsHistoryModal.jsx` | `src/pages/Profile/MyCourses.jsx` |
| `dashboard/DashboardHeroBanner.jsx` | `src/components/Profile/dashboard/DashboardHeroBanner.jsx` | `src/pages/Profile/StudentDashboard.jsx` |
| `dashboard/DashboardStatsGrid.jsx` | `src/components/Profile/dashboard/DashboardStatsGrid.jsx` | `src/pages/Profile/StudentDashboard.jsx` |
| `dashboard/DashboardCourseProgress.jsx` | `src/components/Profile/dashboard/DashboardCourseProgress.jsx` | `src/pages/Profile/StudentDashboard.jsx` |
| `dashboard/DashboardLiveSchedule.jsx` | `src/components/Profile/dashboard/DashboardLiveSchedule.jsx` | `src/pages/Profile/StudentDashboard.jsx` |
| `dashboard/DashboardStudyTracker.jsx` | `src/components/Profile/dashboard/DashboardStudyTracker.jsx` | `src/pages/Profile/StudentDashboard.jsx` |
| `dashboard/DashboardQuickShortcuts.jsx` | `src/components/Profile/dashboard/DashboardQuickShortcuts.jsx` | `src/pages/Profile/StudentDashboard.jsx` |
| `favorites/FavoriteItemCard.jsx` | `src/components/Profile/favorites/FavoriteItemCard.jsx` | `src/pages/Profile/MyFavorites.jsx` |
| `materials/MaterialImageModal.jsx` | `src/components/Profile/materials/MaterialImageModal.jsx` | `src/pages/Profile/MyMaterials.jsx` |
| `materials/MaterialsLevelView.jsx` | `src/components/Profile/materials/MaterialsLevelView.jsx` | `src/pages/Profile/MyMaterials.jsx` |
| `notifications/OrderMessageNotificationCard.jsx` | `src/components/Profile/notifications/OrderMessageNotificationCard.jsx` | `src/pages/Profile/MyNotifications.jsx` |
| `notifications/PlatformNotificationCard.jsx` | `src/components/Profile/notifications/PlatformNotificationCard.jsx` | `src/pages/Profile/MyNotifications.jsx` |
| `onboarding/OnboardingProgressBar.jsx` | `src/components/Profile/onboarding/OnboardingProgressBar.jsx` | `src/pages/Profile/StudentOnboardingModal.jsx` |
| `onboarding/OnboardingSuccessScreen.jsx` | `src/components/Profile/onboarding/OnboardingSuccessScreen.jsx` | `src/pages/Profile/StudentOnboardingModal.jsx` |
| `onboarding/OnboardingExitConfirm.jsx` | `src/components/Profile/onboarding/OnboardingExitConfirm.jsx` | `src/pages/Profile/StudentOnboardingModal.jsx` |
| `onboarding/OnboardingStepFields.jsx` | `src/components/Profile/onboarding/OnboardingStepFields.jsx` | `src/pages/Profile/StudentOnboardingModal.jsx` |
| `orders/OrderFilterDropdown.jsx` | `src/components/Profile/orders/OrderFilterDropdown.jsx` | `src/pages/Profile/MyOrders.jsx` |
| `orders/OrderMessagesModal.jsx` | `src/components/Profile/orders/OrderMessagesModal.jsx` | `src/pages/Profile/MyOrders.jsx` |
| `orders/OrderRowAndCards.jsx` | `src/components/Profile/orders/OrderRowAndCards.jsx` | `src/pages/Profile/MyOrders.jsx` |
| `orders/OrderStatusBadge.jsx` | `src/components/Profile/orders/OrderStatusBadge.jsx` | `src/pages/Profile/MyOrders.jsx` |
| `orders/OrderStatusModal.jsx` | `src/components/Profile/orders/OrderStatusModal.jsx` | `src/pages/Profile/MyOrders.jsx` |
| `profile/ProfileAvatarCard.jsx` | `src/components/Profile/profile/ProfileAvatarCard.jsx` | `src/pages/Profile/MyProfile.jsx` |
| `profile/ProfileBanners.jsx` | `src/components/Profile/profile/ProfileBanners.jsx` | `src/pages/Profile/MyProfile.jsx` |
| `profile/ProfileDetailsForm.jsx` | `src/components/Profile/profile/ProfileDetailsForm.jsx` | `src/pages/Profile/MyProfile.jsx` |
| `profile/ProfilePointsSection.jsx` | `src/components/Profile/profile/ProfilePointsSection.jsx` | `src/pages/Profile/MyProfile.jsx` |
| `profile/profileValidation.jsx` | `src/components/Profile/profile/profileValidation.jsx` | `src/pages/Profile/MyProfile.jsx` |
| `ratings/RatingCard.jsx` | `src/components/Profile/ratings/RatingCard.jsx` | `src/pages/Profile/MyRatings.jsx` |
| `tracker/TrackerCalendarGrid.jsx` | `src/components/Profile/tracker/TrackerCalendarGrid.jsx` | `src/pages/Profile/StudyTrackerReport.jsx` |
| `tracker/TrackerDayModal.jsx` | `src/components/Profile/tracker/TrackerDayModal.jsx` | `src/pages/Profile/StudyTrackerReport.jsx` |
| `tracker/TrackerKpiCards.jsx` | `src/components/Profile/tracker/TrackerKpiCards.jsx` | `src/pages/Profile/StudyTrackerReport.jsx` |

---

### ب. مكونات الدفع والشحن بالمتجر (Store Checkout Components)
**المسار القديم:** `src/pages/Store/Shared/components/`  
**المسار الجديد الموحد:** `src/components/Store/Checkout/`

| الملف الأصلي | المسار الجديد في `src/components/Store/Checkout/` | الصفحات المستهلكة |
|---|---|---|
| `CheckoutProductSummary.jsx` | `src/components/Store/Checkout/CheckoutProductSummary.jsx` | `src/pages/Store/Shared/StoreCheckout.jsx` |
| `CheckoutPriceSummary.jsx` | `src/components/Store/Checkout/CheckoutPriceSummary.jsx` | `src/pages/Store/Shared/StoreCheckout.jsx` |
| `CheckoutDeliveryForm.jsx` | `src/components/Store/Checkout/CheckoutDeliveryForm.jsx` | `src/pages/Store/Shared/StoreCheckout.jsx` |
| `CheckoutDigitalPayment.jsx` | `src/components/Store/Checkout/CheckoutDigitalPayment.jsx` | `src/pages/Store/Shared/StoreCheckout.jsx` |
| `CheckoutTermsModal.jsx` | `src/components/Store/Checkout/CheckoutTermsModal.jsx` | `src/pages/Store/Shared/StoreCheckout.jsx` |
| `CheckoutInstallmentModal.jsx` | `src/components/Store/Checkout/CheckoutInstallmentModal.jsx` | `src/pages/Store/Shared/StoreCheckout.jsx` |

> **تعديل داخلي مهم داخل `CheckoutDeliveryForm.jsx`:**  
> استيراد `CitySelector` سيتغير من:  
> `import CitySelector from "../../../../components/Common/CitySelector";`  
> إلى:  
> `import CitySelector from "../../Common/CitySelector";`

---

### ج. مكونات الكورسات المسجلة (Video Courses Components)
**المسار القديم:** `src/pages/Video_courses/components/`  
**المسار الجديد الموحد:** `src/components/Courses/`

| الملف الأصلي | المسار الجديد في `src/components/Courses/` | الصفحات المستهلكة |
|---|---|---|
| `CoursesFilterBar.jsx` | `src/components/Courses/Catalog/CoursesFilterBar.jsx` | `src/pages/Video_courses/Courses.jsx` |
| `CoursesFilterModal.jsx` | `src/components/Courses/Catalog/CoursesFilterModal.jsx` | `src/pages/Video_courses/Courses.jsx` |
| `CourseHeroMedia.jsx` | `src/components/Courses/CourseDetails/CourseHeroMedia.jsx` | `src/pages/Video_courses/CourseDetails.jsx` |
| `CourseHeroInfo.jsx` | `src/components/Courses/CourseDetails/CourseHeroInfo.jsx` | `src/pages/Video_courses/CourseDetails.jsx` |
| `CourseReviewsSection.jsx` | `src/components/Courses/CourseDetails/CourseReviewsSection.jsx` | `src/pages/Video_courses/CourseDetails.jsx` و `src/pages/Live_courses/LiveCourseDetails.jsx` |
| `CourseInstructorSidebar.jsx` | `src/components/Courses/CourseDetails/CourseInstructorSidebar.jsx` | `src/pages/Video_courses/CourseDetails.jsx` |
| `CourseStatusModals.jsx` | `src/components/Courses/CourseDetails/CourseStatusModals.jsx` | `src/pages/Video_courses/CourseDetails.jsx` و `src/pages/Live_courses/LiveCourseDetails.jsx` |

> **ملاحظة معمارية ممتازة:**  
> كان ملف `LiveCourseDetails.jsx` يضطر لعمل استيراد غريب من صفحة الكورسات المسجلة:  
> `import CourseReviewsSection from "../Video_courses/components/CourseReviewsSection";`  
> بنقلها إلى `src/components/Courses/CourseDetails/` ينتهي هذا التعارض وتصبح كل المكونات المشتركة في مكانها الطبيعي!

---

### د. مكونات دروس الفيديو (Video Course Lessons)
**المسار القديم:** `src/pages/Video_courses/course-lessons/components/` و `hooks/`  
**المسار الجديد الموحد:** `src/components/Courses/CourseLessons/`

| الملف الأصلي | المسار الجديد | الصفحات المستهلكة |
|---|---|---|
| `components/CourseLessonsBanners.jsx` | `src/components/Courses/CourseLessons/CourseLessonsBanners.jsx` | `src/pages/Video_courses/course-lessons/CourseLessons.jsx` |
| `components/CourseLessonsModals.jsx` | `src/components/Courses/CourseLessons/CourseLessonsModals.jsx` | `src/pages/Video_courses/course-lessons/CourseLessons.jsx` |
| `hooks/useVideoPeriodicQuiz.jsx` | `src/components/Courses/CourseLessons/hooks/useVideoPeriodicQuiz.jsx` | `src/pages/Video_courses/course-lessons/CourseLessons.jsx` |

> **تعديل داخلي داخل `CourseLessonsModals.jsx`:**  
> المسارات القديمة: `../../../../components/Courses/ContentModals/...`  
> المسارات الجديدة: `../ContentModals/...` و `../QuizSystem/...`

---

### هـ. مكونات الكورسات المباشرة ودروس البث (Live Courses & Lessons)
**المسار القديم:** `src/pages/Live_courses/components/` و `src/pages/Live_courses/LiveCourseLessons/`  
**المسار الجديد الموحد:** `src/components/Courses/LiveCourses/` و `src/components/Courses/CourseLessons/`

| الملف الأصلي | المسار الجديد | الصفحات المستهلكة |
|---|---|---|
| `components/LiveCourseHeroMedia.jsx` | `src/components/Courses/LiveCourses/LiveCourseHeroMedia.jsx` | `src/pages/Live_courses/LiveCourseDetails.jsx` |
| `components/LiveCourseHeroInfo.jsx` | `src/components/Courses/LiveCourses/LiveCourseHeroInfo.jsx` | `src/pages/Live_courses/LiveCourseDetails.jsx` |
| `components/LiveCourseInstructorSidebar.jsx` | `src/components/Courses/LiveCourses/LiveCourseInstructorSidebar.jsx` | `src/pages/Live_courses/LiveCourseDetails.jsx` |
| `LiveCourseLessons/components/CourseCompletionBanners.jsx` | `src/components/Courses/CourseLessons/CourseCompletionBanners.jsx` | `src/pages/Live_courses/LiveCourseLessons/LiveCourseLessons.jsx` |
| `LiveCourseLessons/components/LiveCourseModals.jsx` | `src/components/Courses/CourseLessons/LiveCourseModals.jsx` | `src/pages/Live_courses/LiveCourseLessons/LiveCourseLessons.jsx` |
| `LiveCourseLessons/hooks/useLivePeriodicQuiz.jsx` | `src/components/Courses/CourseLessons/hooks/useLivePeriodicQuiz.jsx` | `src/pages/Live_courses/LiveCourseLessons/LiveCourseLessons.jsx` |

---

### و. مكونات نظام تشغيل الاختبارات (Course Test Runner)
**المسار القديم:** `src/pages/Video_courses/CourseTestRunner/`  
**المسار الجديد الموحد:** `src/components/Courses/TestRunner/`

| الملفات المنقولة (8 ملفات) | المسار الجديد في `src/components/Courses/TestRunner/` | الصفحة المستهلكة |
|---|---|---|
| `ConnectQuestion.jsx` | `src/components/Courses/TestRunner/ConnectQuestion.jsx` | `CourseTestRunner.jsx` |
| `MatchQuestion.jsx` | `src/components/Courses/TestRunner/MatchQuestion.jsx` | `CourseTestRunner.jsx` |
| `MultipleChoiceQuestion.jsx` | `src/components/Courses/TestRunner/MultipleChoiceQuestion.jsx` | `CourseTestRunner.jsx` |
| `PreviousTestResult.jsx` | `src/components/Courses/TestRunner/PreviousTestResult.jsx` | `CourseTestRunner.jsx` |
| `TestHeader.jsx` | `src/components/Courses/TestRunner/TestHeader.jsx` | `CourseTestRunner.jsx` |
| `TestModals.jsx` | `src/components/Courses/TestRunner/TestModals.jsx` | `CourseTestRunner.jsx` |
| `TestQuestionCard.jsx` | `src/components/Courses/TestRunner/TestQuestionCard.jsx` | `CourseTestRunner.jsx` |
| `useConnectDnD.jsx` | `src/components/Courses/TestRunner/useConnectDnD.jsx` | `CourseTestRunner.jsx` |

---

## 🔄 2. جدول تعديل الاستيرادات في ملفات الـ Pages (Import Migration Table)

| الملف في `src/pages/` | الاستيراد القديم | الاستيراد الجديد |
|---|---|---|
| **`Store/Shared/StoreCheckout.jsx`** | `from "./components/Checkout..."` | `from "../../../components/Store/Checkout/Checkout..."` |
| **`Profile/Profile.jsx`** | `from "./components/ProfileSidebar"` | `from "../../components/Profile/ProfileSidebar"` |
| **`Profile/StudentDashboard.jsx`** | `from "./components/dashboard/..."` | `from "../../components/Profile/dashboard/..."` |
| **`Profile/MyCourses.jsx`** | `from "./components/courses/..."` | `from "../../components/Profile/courses/..."` |
| **`Profile/MyOrders.jsx`** | `from "./components/orders/..."` | `from "../../components/Profile/orders/..."` |
| **`Profile/MyProfile.jsx`** | `from "./components/profile/..."` | `from "../../components/Profile/profile/..."` |
| **`Profile/MyNotifications.jsx`** | `from "./components/notifications/..."` | `from "../../components/Profile/notifications/..."` |
| **`Profile/MyFavorites.jsx`** | `from "./components/favorites/..."` | `from "../../components/Profile/favorites/..."` |
| **`Profile/MyMaterials.jsx`** | `from "./components/materials/..."` | `from "../../components/Profile/materials/..."` |
| **`Profile/MyRatings.jsx`** | `from "./components/ratings/..."` | `from "../../components/Profile/ratings/..."` |
| **`Profile/StudentOnboardingModal.jsx`** | `from "./components/onboarding/..."` | `from "../../components/Profile/onboarding/..."` |
| **`Profile/StudyTrackerReport.jsx`** | `from "./components/tracker/..."` | `from "../../components/Profile/tracker/..."` |
| **`Video_courses/Courses.jsx`** | `from "./components/CoursesFilter..."` | `from "../../components/Courses/Catalog/CoursesFilter..."` |
| **`Video_courses/CourseDetails.jsx`** | `from "./components/CourseHero..."` | `from "../../components/Courses/CourseDetails/CourseHero..."` |
| **`Live_courses/LiveCourseDetails.jsx`** | `from "./components/LiveCourseHero..."` و `from "../Video_courses/components/..."` | `from "../../components/Courses/LiveCourses/LiveCourseHero..."` و `from "../../components/Courses/CourseDetails/..."` |
| **`Live_courses/LiveCourseLessons/LiveCourseLessons.jsx`** | `from "./components/..."` و `from "./hooks/..."` | `from "../../../components/Courses/CourseLessons/..."` |
| **`Video_courses/course-lessons/CourseLessons.jsx`** | `from "./components/..."` و `from "./hooks/..."` | `from "../../../components/Courses/CourseLessons/..."` |
| **`Video_courses/CourseTestRunner.jsx`** | `from "./CourseTestRunner/..."` | `from "../../components/Courses/TestRunner/..."` |

---

## 🧪 3. خطة الفحص والتنفيذ الآمن (Execution & Verification Plan)

1. **الإنشاء والنسخ المنهجي:** إنشاء المجلدات الجديدة في `src/components/` ونقل الملفات مع ضبط المسارات الداخلية التابعة لها فوراً.
2. **تحديث مسارات الاستيراد:** تحديث الـ Imports في كافة ملفات الـ Pages الـ 18 المعنية.
3. **تنظيف المجلدات القديمة:** حذف المجلدات الفارغة داخل `src/pages/` لضمان عدم وجود ملفات مكررة أو تائهة.
4. **فحص الـ Build الشامل:** تشغيل `npm run build` للتأكد من نجاح تجميع الـ 1104 موديول بنسبة 100% وبدون أي خطأ في أي مسار.
