# خطة إعادة هيكلة وتنظيم كود الكورسات (Video_courses & Live_courses)

> **الهدف:** فحص وتقسيم الملفات الكبيرة المتبقية في مجلدي `src/pages/Video_courses` و `src/pages/Live_courses` إلى مكونات فرعية وهوكات مخصصة احترافية داخل `src/components/Courses/` وفق مبدأ التصميم الآلي النظيف (Clean Controller Pattern)، مع الحفاظ التام بنسبة 100% على التصميم، الأنميشن، مفاتيح الترجمة، والـ Business Logic.

---

## 📊 1. الفحص الشامل لملفات المجلدين (Audit Overview)

| المسار والملف | عدد الأسطر الحالية | درجة التعقيد | نوع المعالجة المقترحة |
|---|---|---|---|
| `Live_courses/LiveCourseLessons/LiveCourseLessons.jsx` | **712 سطر** | عالي جداً (Progress, Timer, Fetch, State) | فصل هوكات البيانات والتقدم + شريط الدروس |
| `Video_courses/course-lessons/CourseLessons.jsx` | **671 سطر** | عالي جداً (Video Progress, Navigation, Storage) | فصل هوك إدارة الكورس وهوك التقدم والملاحة |
| `Video_courses/Courses.jsx` | **581 سطر** | عالي (Filters, Tabs, Pagination, Data Mapping) | استخراج هوك الكتالوج + مكون التبويبات + الشاشات البديلة |
| `Video_courses/CourseTestRunner.jsx` | **548 سطر** | عالي (Shuffling, DnD, Submission, Score Calc) | استخراج دوال الخلط utils + هوك تشغيل وحساب درجات الاختبار |
| `Video_courses/CourseDetails.jsx` | **316 سطر** | متوسط (State, Access Checks, Tabs) | استخراج هوك جلب بيانات الكورس والتقييمات |
| `Live_courses/LiveCourseDetails.jsx` | **297 سطر** | متوسط (Live Checks, Schedule, Access) | استخراج هوك بيانات الكورس المباشر وتفاصيل الاشتراك |
| `Video_courses/course-lessons/CourseContentSidebar.jsx` | **282 سطر** | متوسط (Syllabus tree, Section items) | تنظيم وتقسيم عناصر الأقسام إلى مكونات فرعية |
| `Live_courses/LiveCourseLessons/InactiveSession.jsx` | **257 سطر** | متوسط (Cards, Countdown, Links) | دمج وتبسيط مع مشغل الجلسات المباشرة |
| `Live_courses/LiveCourses.jsx` | 159 سطر | منخفض (بطاقات وفلاتر بسيطة) | كود نظيف ومناسب |
| `Live_courses/LiveCourseLessons/Sidebar.jsx` | 124 سطر | منخفض (قائمة الدروس للبث) | كود نظيف ومناسب |
| `Video_courses/VideoCourses.jsx` | 97 سطر | منخفض | كود نظيف ومناسب |

---

## 🛠️ 2. الخطة التفصيلية لتقسيم وتنظيم كل ملف

---

### أ. ملف مشغل الاختبارات: `CourseTestRunner.jsx`
* **الحجم الحالي:** 548 سطر ➔ **الحجم المستهدف بعد التقسيم:** ~120 سطر.
* **المشكلة الحالية:** يحتوي الملف على خوارزميات متداخلة لخلط الأسئلة (`shuffleArray`)، فك شفرات التوصيل (`extractAnswerPairs`)، وتحضير المحاولات (`getAttemptQuizzes`)، بجانب لوجيك ضخم للتحقق من الاختبار السابق وإرسال النتائج وحساب النقاط.
* **المكونات والملفات الفرعية المستخرجة:**
  1. `src/components/Courses/TestRunner/testRunnerUtils.js`:
     - دالة `shuffleArray(array)`
     - دالة `extractAnswerPairs(question)`
     - دالة `prepareConnectQuestion(question)`
     - دالة `getAttemptQuizzes(allQuizzes, limitStr)`
  2. `src/components/Courses/TestRunner/useCourseTestEngine.jsx`:
     - إدارة حالة الإجابات `answers`, `setAnswers`.
     - جلب وفحص نتائج الاختبار السابق `checkPreviousTest`.
     - حساب نسبة النجاح وإرسال الإجابات للـ API (`addStudentTest`, `completeLessonProgress`).
     - احتساب نقاط المكافأة وعرض نافذة النقاط.

---

### ب. ملف قاعة البث المباشر: `LiveCourseLessons.jsx`
* **الحجم الحالي:** 712 سطر ➔ **الحجم المستهدف بعد التقسيم:** ~140 سطر.
* **المشكلة الحالية:** يحتوي الملف على تضخم كبير في إدارة الـ State (أكثر من 20 حالة مختلفة)، فحص الصلاحيات، وحساب تقدم الدروس المباشرة، وحفظ آخر درس محلياً `localStorage`.
* **المكونات والملفات الفرعية المستخرجة:**
  1. `src/components/Courses/CourseLessons/hooks/useLiveCourseData.jsx`:
     - جلب بيانات الكورس والأقسام والدروس (`getLiveCourseById`).
     - فحص صلاحية الوصول والانتهاء (`getCourseAccess`, `isExpired`).
     - حساب فارق توقيت السيرفر `serverTimeOffset` ومؤقت تحديث الوقت كل 30 ثانية.
  2. `src/components/Courses/CourseLessons/hooks/useLiveCourseProgress.jsx`:
     - إدارة تقدم الطالب في كل قسم ودرس (`getLiveCourseProgressDetails`, `startLiveLessonProgress`).
     - دالة حفظ واسترجاع آخر درس شوهد (`saveLastLesson`, `getLastLesson`).
     - التعامل مع إكمال الدرس واحتساب النسب الإجمالية.

---

### ج. ملف مشاهدة دروس الفيديو: `CourseLessons.jsx`
* **الحجم الحالي:** 671 سطر ➔ **الحجم المستهدف بعد التقسيم:** ~135 سطر.
* **المشكلة الحالية:** تكرار متوازٍ لنفس لوجيك البث المباشر ولكن مع إضافة متابعة تقدم مشاهدة الفيديو ثانية بثانية (`onVideoTimeUpdate`, `onVideoEnd`).
* **المكونات والملفات الفرعية المستخرجة:**
  1. `src/components/Courses/CourseLessons/hooks/useVideoCourseData.jsx`:
     - جلب كورس الفيديو ودروسه وأقسامه وفحص الوصول.
     - تحديد أول درس متاح تلقائياً والانتقال بين الدروس السابقة والقادمة.
  2. `src/components/Courses/CourseLessons/hooks/useVideoCourseProgress.jsx`:
     - متابعة وقت الفيديو، وتحديث النسبة المئوية في السيرفر عند الوصول لـ 100%.
     - تحديث حالات الدروس المكتملة `lessonStatuses`.

---

### د. صفحة كتالوج الكورسات: `Courses.jsx`
* **الحجم الحالي:** 581 سطر ➔ **الحجم المستهدف بعد التقسيم:** ~120 سطر.
* **المشكلة الحالية:** يحتوي الملف على لوجيك جلب 3 أنواع من الكورسات (مسجلة، مباشرة، وسناتر)، بالإضافة إلى جلب التخصصات والسنوات الدراسية، وإدارة الـ Pagination لكل تبويب على حدة، ومصفوفة تحويل البيانات الضخمة (`map`).
* **المكونات والملفات الفرعية المستخرجة:**
  1. `src/components/Courses/Catalog/useCoursesCatalog.jsx`:
     - هوك مخصص يدير جلب التخصصات وسنوات الكلية (`specializations`, `collegeYears`).
     - جلب الكورسات المفلترة لكل تبويب مع الـ Pagination وإدارة المفضلات (`toggleFavorite`).
     - مصفوفات تحويل وتنسيق البيانات (`data mapping`).
  2. `src/components/Courses/Catalog/CoursesCatalogTabs.jsx`:
     - شريط التبويبات الثلاثي (الكورسات المسجلة / البث المباشر / كورسات السناتر) بتصميمه المتجاوب وأيقوناته.
  3. `src/components/Courses/Catalog/CoursesGridEmpty.jsx`:
     - رسائل وشاشات عدم وجود نتائج أو البحث الفارغ.

---

### هـ. صفحات تفاصيل الكورس: `CourseDetails.jsx` و `LiveCourseDetails.jsx`
* **الحجم الحالي:** 316 سطر و 297 سطر ➔ **الحجم المستهدف:** ~130 سطر لكل ملف.
* **المكونات المستخرجة:**
  1. `src/components/Courses/CourseDetails/useCourseDetailsLogic.jsx`:
     - جلب الكورس والتقييمات وصلاحية الوصول واحتساب متوسط النجوم.
     - إدارة نافذة المراجعة والتقييم الجديد.
  2. `src/components/Courses/LiveCourses/useLiveCourseDetailsLogic.jsx`:
     - فحص حالة البث والمواعيد وتفاصيل اشتراك البث المباشر.

---

## 🎯 3. النتائج المتوقعة بعد التنفيذ

| الملف الأصلي | الأسطر قبل | الأسطر المتوقعة بعد | نسبة التخفيض |
|---|---|---|---|
| `LiveCourseLessons.jsx` | 712 | ~140 | **- 80%** |
| `CourseLessons.jsx` | 671 | ~135 | **- 80%** |
| `Courses.jsx` | 581 | ~120 | **- 79%** |
| `CourseTestRunner.jsx` | 548 | ~120 | **- 78%** |
| `CourseDetails.jsx` | 316 | ~130 | **- 59%** |
| `LiveCourseDetails.jsx` | 297 | ~125 | **- 58%** |

---

## 🔒 4. التزامات وضمانات السلامة (Guarantees)

1. **امتداد الملفات:** جميع الملفات المنشأة ستكون بامتداد `.jsx` و `.js` حصراً.
2. **سلامة التصميم والـ UI:** الحفاظ على 100% من كلاسات Tailwind CSS، الألوان، التدرجات، والأنيميشن التفاعلي (`Framer Motion`).
3. **سلامة المنطق (Business Logic):** الحفاظ الدقيق على جميع الـ Props، مفاتيح الترجمة i18n، دوال الـ API، وسياقات التطبيق (`useApi`, `useUser`).
4. **الفحص المستمر:** تشغيل `npm run build` بعد كل خطوة للتأكد من خلو المشروع تماماً من أي خطأ تجميع أو مسار مفقود.
