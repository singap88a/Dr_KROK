# 📑 الخطة التنفيذية المعمارية لإعادة هيكلة وتفكيك `src/context/ApiContext.jsx`

**تاريخ الخطة:** 26 أكتوبر 2026  
**الهدف:** تفكيك الملف المركزي الأضخم في المشروع (`ApiContext.jsx` - 2,240 سطر) إلى وحدات برمجية متخصصة ومستقلة (Modular Services) دون تغيير أي سطر منطقي (Logic)، مع الحفاظ التام والكامل بنسبة 100% على عمل الـ 82 ملفاً التي تعتمد عليه.

---

## 📑 الفهرس
1. [تحليل الوضع الحالي والدافع للهيكلة](#1-تحليل-الوضع-الحالي-والدافع-للهيكلة)
2. [الاستراتيجية المعمارية الذكية: نمط الواجهة الموحدة (Facade Pattern)](#2-الاستراتيجية-المعمارية-الذكية-نمط-الواجهة-الموحدة-facade-pattern)
3. [خريطة المسارات الجديدة وتوزيع الدوال](#3-خريطة-المسارات-الجديدة-وتوزيع-الدوال)
4. [حصر وفحص الـ 82 ملفاً المستهلكة لـ useApi](#4-حصر-وفحص-الـ-82-ملفاً-المستهلكة-لـ-useapi)
5. [مصفوفة فحص وضمان بقاء الـ Logic بنسبة 100%](#5-مصفوفة-فحص-وضمان-بقاء-الـ-logic-بنسبة-100)
6. [مراحل وخطوات التنفيذ خطوة بخطوة](#6-مراحل-وخطوات-التنفيذ-خطوة-بخطوة)

---

## 1. تحليل الوضع الحالي والدافع للهيكلة

### مشكلة ملف `ApiContext.jsx` الحالي:
- **الحجم:** **2,240 سطراً برمجياً** داخل ملف واحد.
- **التكدس (God Object Anti-Pattern):** الملف يقوم بكل المهام في وقت واحد:
  1. نظام الكاش وتتبع الـ Events بالذاكرة (`apiCache` و `globalEvents`).
  2. التعامل مع الـ HTTP Requests، الـ Headers، ولغة الموقع، والـ CORS، والتوجيه التلقائي للمدفوعات.
  3. إدارة المصادقة (Auth, OTP, Reset Password).
  4. منطق فحص الصيانة وحالة السيرفر (`platform-status`).
  5. أكثر من **130 دالة وميثود** مسؤولة عن (الكورسات المسجلة، الكورسات الحية، كورسات السنتر، البث المباشر، الفلاش كاردز، الأسئلة المقالية، الشات الذكي، الكويزات، الشهادات، متجر الكتب، وتتبع المذاكرة).
- **التحدي:** أكثر من **82 ملفاً** في المشروع تستورد `useApi` من هذا المسار وتعتمد على الدوال المعرفة بداخله.

---

## 2. الاستراتيجية المعمارية الذكية: نمط الواجهة الموحدة (Facade Pattern)

### 💡 كيف نحقق التقسيم باحترافية وبدون كسر أي مسار؟
إذا قمنا بنقل السياق أو تغييره، سنضطر لتعديل 82 ملفاً في كامل أرجاء المشروع، مما قد يسبب أخطاء غير مرغوبة ومخاطر عالية.

**الحل الهندسي الأفضل عالمياً (Facade Architecture):**
1. **الواجهة الخارجية ثابتة 100%:**
   - يظل ملف `src/context/ApiContext.jsx` موجوداً في نفس مكانه تماماً.
   - يظل يصدر `useApi` و `ApiProvider` بنفس الأسماء وبنفس الـ Signature وبنفس كائن الـ `value`.
2. **التنظيم الداخلي (Modular Extraction):**
   - نقوم بنقل المنطق الداخلي المقسم إلى مجلد فرعي نظيف:
     `src/context/api/`
   - يتم تقسيم الـ 2,240 سطر إلى **10 ملفات متخصصة** يتراوح حجم كل منها بين 80 إلى 250 سطراً فقط.
   - يصبح ملف `ApiContext.jsx` مجرد "منظم مجمع (Orchestrator)" خفيف جداً (أقل من 150 سطر) يستورد هذه الخدمات ويقدمها لجميع مكونات المشروع.
3. **النتيجة:**
   - **0 مسارات مكسورة** في باقي المشروع.
   - بقاء كل الـ State والـ Caching والـ Logic كما هو تماماً.
   - ملفات صغيرة، نظيفة، يسهل قراءتها وصيانتها وتطويرها بشكل مستقل.

---

## 3. خريطة المسارات الجديدة وتوزيع الدوال

سنقوم بإنشاء المجلد الجديد: `src/context/api/` وتقسيم الكود إليه على النحو التالي:

| # | مسار الملف الجديد | الوظيفة والمسؤولية | الدوال المنقولة إليه | الحجم المتوقع |
|---|---|---|---|:---:|
| 1 | `src/context/api/apiCache.js` | نظام الكاش المحلي وإدارة الأحداث اللحظية (TTL & Event Emitter) | `apiCache` (`set`, `get`, `delete`, `clear`, `on`, `off`), `globalEvents` (`emit`, `on`, `off`) | ~80 سطر |
| 2 | `src/context/api/apiClient.js` | محرك الاتصال المركزي، التوكنات، معالجة الـ Headers واللغات والأخطاء والكاش | `getAuthToken`, `buildUrl`, `generateCacheKey`, `request` engine, CORS handlers, Redirect bypass | ~220 سطر |
| 3 | `src/context/api/maintenanceService.js` | مراقبة حالة المنصة والصيانة والـ Poll الدوري | `checkPlatformStatus`, `isMaintenance`, `maintenanceData` | ~90 سطر |
| 4 | `src/context/api/authService.js` | خدمات المصادقة وتسجيل الدخول والبروفايل | `login`, `register`, `sendOtp`, `forgotPassword`, `resetPassword`, `getMyProfile`, `getSettings` | ~160 سطر |
| 5 | `src/context/api/coursesService.js` | جلب واستعراض الكورسات بجميع أنواعها والاشتراكات | `getPlacementCourses`, `getVideoCourses`, `getLiveCourses`, `getVideoCourseById`, `getLiveCourseById`, `getCenterCourses`, `getCenterCourseById`, `filterCourses`, `getCourseLessons`, `getLiveCourseLessons`, `subscribeToCourse`, `subscribeToLiveCourse`, `subscribeToCenterCourse`, `getMyCourses` | ~380 سطر |
| 6 | `src/context/api/courseProgressService.js` | تتبع تقدم الطالب في الكورسات وفتح وإكمال الدروس | `getCourseProgress`, `startLessonProgress`, `completeLessonProgress`, `getCourseProgressDetails`, `markLessonAsCompleted`, `getLiveCourseProgress`, `startLiveLessonProgress`, `completeLiveLessonProgress`, `getLiveCourseProgressDetails`, `markLiveLessonAsCompleted`, `getMyCoursesProgress` | ~280 سطر |
| 7 | `src/context/api/interactionsService.js` | تفاعلات الدروس، اللايكات، التعليقات، الفلاش كاردز، والأسئلة المقالية | `getVideoLessonInteractions`, `toggleVideoLessonLike`, `addVideoLessonComment`, `editVideoLessonComment`, `deleteVideoLessonComment`, `getLiveLessonInteractions`, `toggleLiveLessonLike`, `addLiveLessonComment`, `editLiveLessonComment`, `deleteLiveLessonComment`, `getLessonFlashCards`, `getLiveLessonFlashCards`, `getLessonEssayQuestions`, `submitEssayAnswer` | ~240 سطر |
| 8 | `src/context/api/testsAndCertificatesService.js` | اختبارات الكورسات، النتائج، المراجعات، وتوليد الشهادات | `addStudentTest`, `checkStudentTest`, `getStudentTestReview`, `getFinalTestResult`, `saveFinalTestResult`, `uploadCertificate`, `getCertificateFile`, `checkCertificateExists`, `getCertificateUrl` | ~260 سطر |
| 9 | `src/context/api/storeAndCommunityService.js` | المتاجر، المحاضرين، التقييمات، المفضلة، المقالات، والوظائف | `getFavorites`, `toggleFavorite`, `getInstructors`, `getInstructorById`, `getMerchants`, `getMerchantById`, `getOrders`, `getMyOrderMessages`, `getNotifications`, `getBlogs`, `getBlogBySlug`, `submitCourseReview`, `getUserRatings`, `checkUserReview`, `getJobs`, `submitJobApplication`, `getMyMaterials` | ~270 سطر |
| 10 | `src/context/api/studyTrackerService.js` | ملخص وتقارير وإحصائيات متتبع المذاكرة والـ Streak | `getStudySummary`, `getStudyMonthlyReport` | ~60 سطر |
| 11 | `src/context/api/chatService.js` | خدمات شات الذكاء الاصطناعي (Gemini) | `getChatStatus`, `sendChatMessage` | ~40 سطر |
| 12 | `src/context/ApiContext.jsx` | **الملف الرئيسي المجمع (The Main Facade)** | يجمع الخدمات أعلاه، ينشئ الـ Context، ويصدر `useApi` و `ApiProvider` كالمعتاد | **~150 سطر فقط** (بدلاً من 2,240) |

---

## 4. حصر وفحص الـ 82 ملفاً المستهلكة لـ useApi

تم فحص كامل شجرة استيراد `useApi` في المشروع، والملفات هي:

### 1) ملفات التخطيط والجذر (Layout & Core):
- `src/App.jsx`
- `src/components/Layout/Navbar.jsx`
- `src/components/Layout/Footer.jsx`
- `src/components/Layout/TelegramIcon.jsx`
- `src/context/StudyTrackerContext.jsx`

### 2) صفحات ومكونات الكورسات (Courses & Lessons):
- `src/pages/Video_courses/Courses.jsx`
- `src/pages/Video_courses/CourseDetails.jsx`
- `src/pages/Video_courses/course-lessons/CourseLessons.jsx`
- `src/pages/Video_courses/course-lessons/CourseContentSidebar.jsx`
- `src/pages/Video_courses/CourseTestRunner.jsx`
- `src/pages/Video_courses/CourseTestRunner/PreviousTestResult.jsx`
- `src/pages/Live_courses/LiveCourses.jsx`
- `src/pages/Live_courses/LiveCourseDetails.jsx`
- `src/pages/Live_courses/LiveCourseLessons/LiveCourseLessons.jsx`
- `src/pages/Center_courses/CenterCourseDetails.jsx`
- `src/components/Courses/Subscription/CourseSubscription.jsx`
- `src/components/Courses/VideoPlayerSection.jsx`
- `src/components/Courses/LessonFlashCards.jsx`
- `src/components/Courses/LessonInteractions.jsx`
- `src/components/Courses/LessonEssayQuestions.jsx`
- `src/components/Courses/LeaveReview.jsx`
- `src/components/Courses/CertificateSection/CertificateSection.jsx`

### 3) صفحات ومكونات المتجر (Store & Checkout):
- `src/pages/Store/Shared/StoreCheckout.jsx`
- `src/pages/Store/Shared/StoreDetails.jsx`
- `src/pages/Store/Shared/StoreList.jsx`
- `src/pages/Store/FlashOffersPage.jsx`
- `src/pages/Store/MedicalClothes/MedicalClothesDetails.jsx`

### 4) صفحات الحساب والبروفايل (Profile & Dashboard):
- `src/pages/Profile/Profile.jsx`
- `src/pages/Profile/StudentDashboard.jsx`
- `src/pages/Profile/MyCourses.jsx`
- `src/pages/Profile/MyOrders.jsx`
- `src/pages/Profile/MyProfile.jsx`
- `src/pages/Profile/MyMaterials.jsx`
- `src/pages/Profile/MyNotifications.jsx`
- `src/pages/Profile/MyFavorites.jsx`
- `src/pages/Profile/MyRatings.jsx`
- `src/pages/Profile/StudyTrackerReport.jsx`
- `src/pages/Profile/StudentOnboardingModal.jsx`
- `src/pages/Profile/ChangePasswordModal.jsx`
- `src/pages/Profile/LiveCourseScheduleModal.jsx`
- `src/pages/Profile/UniversityStudents.jsx`

### 5) صفحات المصادقة والتسجيل (Auth):
- `src/pages/auth/Login/LoginPage.jsx`
- `src/pages/auth/Register/RegisterPage.jsx`
- `src/pages/auth/ForgotPassword/ForgotPasswordPage.jsx`

### 6) الصفحة الرئيسية والأقسام (Home Components):
- `src/components/Home/Hero.jsx`
- `src/components/Home/Features.jsx`
- `src/components/Home/HomeBanners.jsx`
- `src/components/Home/FlashOfferBanner.jsx`
- `src/components/Home/FlashOffers.jsx`
- `src/components/Home/CoursesPreview.jsx`
- `src/components/Home/Live_courses.jsx`
- `src/components/Home/InstructorsCarousel.jsx`
- `src/components/Home/BooksCarousel.jsx`
- `src/components/Home/MerchantsCarousel.jsx`
- `src/components/Home/Articles.jsx`
- `src/components/Home/StatsSection.jsx`
- `src/components/Home/CTA.jsx`

### 7) الخدمات المشتركة والذكاء الاصطناعي والمقالات:
- `src/pages/GeminiSingap/GeminiSingap.jsx`
- `src/pages/Articles/Articles.jsx`
- `src/pages/Articles/ArticleDetail.jsx`
- `src/pages/Instructors/Instructors.jsx`
- `src/pages/Instructors/InstructorDetails.jsx`
- `src/pages/Merchants/Merchants.jsx`
- `src/pages/Merchants/MerchantDetails.jsx`
- `src/pages/Jobs/Jobs.jsx`
- `src/pages/Testimonials/Testimonials.jsx`
- `src/pages/Test_yourself/TestYourself.jsx`
- `src/pages/UniversityRepresentative/UniversityRepresentative.jsx`
- `src/pages/shared/Certificate.jsx`
- `src/pages/shared/TestResults.jsx`
- `src/pages/Payment/PaymentSuccess.jsx`
- `src/pages/ContactUs/Contact_Us.jsx`
- `src/pages/Privacypolicy/Privacypolicy.jsx`
- `src/pages/TermsAndConditions/TermsAndConditions.jsx`
- `src/pages/PurchasePolicy/PurchasePolicy.jsx`
- `src/components/About/*` (AboutFeatures, Heroabout, Mission_Vision, OurStory, Testimonials)
- `src/components/Common/CitySelector.jsx`
- `src/components/Common/CouponInput.jsx`

> **النتيجة المؤكدة:** نظراً لاعتمادنا استراتيجية الـ Facade، **لن يتم تغيير سطر واحد في مسار الاستيراد في أي من هذه الـ 82 ملفاً**! كل ملف سيستمر في استدعاء:
> ```javascript
> import { useApi } from "../../context/ApiContext";
> ```
> وستعمل كل الدوال كما هي بالضبط.

---

## 5. مصفوفة فحص وضمان بقاء الـ Logic بنسبة 100%

للتأكد القاطع من عدم تأثر أي منطق برمجي، سنلتزم بالمعايير التالية:

1. **سلامة الكاش التلقائي (Cache Consistency):**
   - الحفاظ على `generateCacheKey` بنفس تركيبة الـ Key تماماً (Path + Method + Body + Token + Language).
   - الحفاظ على الـ TTL الافتراضي (10 دقائق) لكل طلبات الـ GET المكيشة.
   - الحفاظ على منطق `invalidateCacheOnSuccess` في الـ POST/PUT/DELETE بنفس الأنماط والمفاتيح.
2. **سلامة معالجة المدفوعات والـ Redirect:**
   - الحفاظ على المنطق المخصص لطلبات الشراء:
     `['place_order_book', 'place_video_course', 'place_live_course']`
     حيث يتم منع المتصفح من إتباع الـ 302 Redirect تلقائياً والتعامل مع استجابة الدفع يدوياً لمنع أخطاء الـ CORS.
3. **سلامة رؤوس الطلب (Request Headers & Language):**
   - إرسال `Accept: application/json`، ومعالجة اللغات (`ua` تصبح `uk` للباك إند).
   - إرفاق الـ Bearer Token تلقائياً من `localStorage` عند طلب `auth: true`.
4. **سلامة الـ Event Emitters:**
   - بقاء `emitDataUpdate` و `onDataUpdate` لتحديث واجهات المستخدم لحظياً عند تحديث البيانات.
5. **مطابقة البناء (Zero Build Errors):**
   - اختبار `npm run build` للتأكد من نجاح التحويل الكامل لـ 1060+ موديول بـ Exit code 0.

---

## 6. مراحل وخطوات التنفيذ خطوة بخطوة

سنقوم بتنفيذ الخطة بالترتيب الآمن التالي:

- **الخطوة 1:** إنشاء ملفات الأساس:
  - `src/context/api/apiCache.js` (نظام الكاش والأحداث).
  - `src/context/api/apiClient.js` (محرك الـ Request الأساسي).
  - `src/context/api/maintenanceService.js` (حالة الصيانة).
- **الخطوة 2:** استخراج الخدمات الوظيفية (Domain Services):
  - `authService.js`
  - `coursesService.js`
  - `courseProgressService.js`
  - `interactionsService.js`
  - `testsAndCertificatesService.js`
  - `storeAndCommunityService.js`
  - `studyTrackerService.js` & `chatService.js`
- **الخطوة 3:** إعادة صياغة `src/context/ApiContext.jsx`:
  - تجميع كافة الخدمات الفرعية وربطها بمحرك الـ `request`.
  - تصدير كائن الـ `value` الموحد عبر `useMemo`.
- **الخطوة 4:** الفحص البرمجي واختبار البناء:
  - تشغيل `npm run build` للتأكد من عدم وجود أي خطأ.
  - فحص تكامل ملفات الـ Profile وسائر صفحات المنصة.
- **الخطوة 5:** حذف الملف القديم المهمل:
  - `src/pages/Live_courses/LiveCourseLessons_old.jsx` (1,710 سطر ميت).

---

> 🚀 **جاهزية التنفيذ:** تم إعداد كل التفاصيل بدقة. بمجرد تأكيدك وموافقتك على الخطة، سنبدأ التنفيذ خطوة بخطوة فوراً!
