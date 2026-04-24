# شجرة ملفات المشروع (Project Tree)

فيما يلي شجرة مفصلة بجميع المجلدات (📁) والملفات (📄) في مجلد `src`، مع شرح وظيفة كل واحد منها باللغة العربية:

```text
📁 SRC (المجلد الرئيسي لواجهة المستخدم Frontend)
|   📄 App.css - (ملف التنسيقات الإضافية للبرنامج)
|   📄 App.jsx - (المكون الرئيسي اللي بيحوي الـ Routes ومسارات الموقع)
|   📄 i18n.js - (ملف إعدادات الترجمة وتعدد اللغات)
|   📄 index.css - (ملف إعدادات التصميم الأساسية و TailwindCSS)
|   📄 main.jsx - (نقطة البداية Entry Point اللي بتعمل ريندر للمشروع بالكامل)
|   
+---📁 assets (مجلد الميديا والصور الثابتة)
|       📄 react.svg - (صورة لوجو رياكت)
|       
+---📁 components (مجلد المكونات الفرعية المشتركة Reusable Components)
|   +---📁 About (أجزاء صفحة "من نحن")
|   |       📄 AboutFeatures.jsx - (بيعرض مميزات المنصة)
|   |       📄 Heroabout.jsx - (واجهة الترحيب العلوية في صفحة من نحن)
|   |       📄 Mission_Vision.jsx - (بيعرض الرؤية والمهمة الخاصة بالمنصة)
|   |       📄 OurStory.jsx - (جزء بيعرض قصة المنصة)
|   |       📄 Testimonials.jsx - (آراء وتقييمات الطلاب)
|   |       
|   +---📁 animations (ملفات الأنميشن من نوع Lottie)
|   |       📄 hero.json - (الأنميشن اللي بيظهر في الصفحة الرئيسية)
|   |       📄 Login_animation.json - (الأنميشن في صفحة الدخول)
|   |       
|   +---📁 Auth (مكونات صفحات التسجيل)
|   |       📄 AuthPage.jsx - (مكون أساسي بيجمع بين الدخول والتسجيل)
|   |       
|   +---📁 Books (مكونات متجر الكتب)
|   |       📄 PDFViewer.jsx - (مكون لعرض ملفات الـ PDF للكتب)
|   |       
|   +---📁 Common (مكونات عامة بتستخدم في كذا صفحة)
|   |       📄 CitySelector.jsx - (قائمة منسدلة لاختيار المحافظة والمدينة)
|   |       📄 CouponInput.jsx - (مربع إدخال كوبون الخصم)
|   |       📄 LoadingSpinner.jsx - (أيقونة التحميل اللي بتلف)
|   |       📄 Pagination.jsx - (أزرار التقليب بين الصفحات 1, 2, 3...)
|   |       📄 RatingStars.jsx - (عرض نجوم التقييم للكورسات والكتب)
|   |       📄 TopStudentsSlider.jsx - (شريط بيعرض الطلاب الأوائل)
|   |       
|   +---📁 Courses (المكونات الخاصة بالكورسات بشكل عام)
|   |   |   📄 CourseHeader.jsx - (رأس صفحة الكورس اللي فيه العنوان والتقييم)
|   |   |   📄 LeaveReview.jsx - (نموذج كتابة تقييم للكورس)
|   |   |   📄 VideoPlayerSection.jsx - (مشغل الفيديو الأساسي للكورسات)
|   |   |   
|   |   +---📁 CertificateSection (قسم الشهادات)
|   |   |       📄 CertificateSection.jsx - (القسم اللي بيظهر فيه زرار استلام الشهادة)
|   |   |       
|   |   +---📁 ContentModals (النوافذ المنبثقة لمحتويات الكورس)
|   |   |       📄 ImagePopup.jsx - (نافذة لعرض الصور)
|   |   |       📄 InlinePDFViewer.jsx - (مكون لعرض الـ PDF جوه الصفحة)
|   |   |       📄 PDFPopup.jsx - (نافذة لعرض ملفات الـ PDF)
|   |   |       📄 PurchaseModal.jsx - (نافذة طلب شراء الكورس)
|   |   |       📄 VideoPopup.jsx - (نافذة لعرض الفيديوهات)
|   |   |       
|   |   +---📁 InfoCards (كروت المعلومات على الجنب)
|   |   |       📄 BatchInfoCard.jsx - (كارت بيعرض معلومات الدفعة/المجموعة)
|   |   |       📄 InstructorCard.jsx - (كارت بيعرض بيانات المدرب في الكورس)
|   |   |       
|   |   +---📁 LessonPlayer (مشغل الدروس)
|   |   |       📄 LessonAttachments.jsx - (مرفقات الدرس زي الـ PDF وغيره)
|   |   |       📄 VideoPlayer.jsx - (المكون الداخلي لمشغل الفيديو)
|   |   |       
|   |   +---📁 ProgressSystem (نظام تتبع إنجاز الطالب)
|   |   |       📄 LessonProgress.jsx - (تتبع تقدم درس معين)
|   |   |       📄 ProgressCircle.jsx - (الدائرة اللي بتعرض نسبة الإنجاز)
|   |   |       📄 SectionProgress.jsx - (تتبع تقدم قسم/وحدة معينة)
|   |   |       
|   |   +---📁 QuizSystem (نظام الامتحانات داخل الكورس)
|   |   |       📄 FinalTests.jsx - (الامتحانات النهائية للكورس)
|   |   |       📄 LessonEndTests.jsx - (امتحانات نهاية الدرس)
|   |   |       📄 PeriodicQuizzes.jsx - (الامتحانات الدورية اللي بتظهر جوه الفيديو)
|   |   |       📄 QuizModal.jsx - (النافذة المنبثقة للامتحان المباشر)
|   |   |       📄 ResultsModal.jsx - (النافذة المنبثقة لعرض النتيجة الفورية)
|   |   |       📄 SectionTests.jsx - (امتحانات نهاية القسم/الوحدة)
|   |   |       
|   |   +---📁 Sidebar (القائمة الجانبية للكورس)
|   |   |       📄 LessonItem.jsx - (عنصر الدرس الواحد في القائمة الجانبية)
|   |   |       📄 SectionItem.jsx - (عنصر القسم أو الوحدة في القائمة الجانبية)
|   |   |       
|   |   +---📁 Subscription (الاشتراكات)
|   |           📄 CourseSubscription.jsx - (جزء الاشتراك في الكورس)
|   |           📄 SubscriptionSuccess.jsx - (رسالة نجاح الاشتراك)
|   |           
|   +---📁 Home (أجزاء الصفحة الرئيسية للموقع)
|   |       📄 Articles.jsx - (قسم عرض المقالات في الرئيسية)
|   |       📄 BooksCarousel.jsx - (سلايدر الكتب في الرئيسية)
|   |       📄 CoursesPreview.jsx - (قسم عرض الكورسات في الرئيسية)
|   |       📄 CTA.jsx - (قسم Call to action لتشجيع التسجيل)
|   |       📄 Features.jsx - (مميزات المنصة في الرئيسية)
|   |       📄 Hero.jsx - (أول جزء بيظهر فوق في الصفحة الرئيسية)
|   |       📄 HomeBanners.jsx - (البنرات الإعلانية)
|   |       📄 InstructorsCarousel.jsx - (سلايدر عرض المدربين)
|   |       📄 Live_courses.jsx - (قسم عرض الكورسات المباشرة)
|   |       📄 StatsSection.jsx - (قسم الإحصائيات والأرقام)
|   |       
|   +---📁 Layout (مكونات هيكل وتخطيط الموقع)
|   |       📄 Footer.jsx - (الجزء السفلي للموقع)
|   |       📄 Navbar.jsx - (الشريط العلوي - الهيدر)
|   |       📄 ScrollToTop.jsx - (الزرار اللي بيرجعك لأول الصفحة)
|   |       📄 TelegramIcon.jsx - (أيقونة تليجرام العائمة)
|   |       
|   +---📁 Modals (نوافذ منبثقة عامة)
|           📄 IncompleteProfileModal.jsx - (تنبيه بإن الحساب غير مكتمل البيانات)
|           📄 LogoutConfirmModal.jsx - (نافذة تأكيد تسجيل الخروج)
|           📄 SaveBeforeLoginModal.jsx - (نافذة بتطلب الدخول قبل حفظ كورس في المفضلة)
|           
+---📁 context (إدارة الحالة العامة للمشروع Global States)
|       📄 ApiContext.jsx - (إدارة أي حاجة ليها علاقة بالتواصل مع السيرفر والباك اند)
|       📄 CartContext.jsx - (إدارة بيانات سلة المشتريات)
|       📄 ThemeContext.jsx - (إدارة الثيم الليلي والنهاري)
|       📄 UserContext.jsx - (إدارة حالة المستخدم الحالي وتسجيل الدخول)
|       
+---📁 locales (ملفات الترجمة)
|   +---📁 en
|   |       📄 translation.json - (نصوص اللغة الإنجليزية)
|   +---📁 ua
|           📄 translation.json - (نصوص اللغة الأوكرانية)
|           
+---📁 pages (الصفحات الكاملة اللي بيزورها اليوزر - Routes)
|   +---📁 About
|   |       📄 About.jsx - (صفحة من نحن الكاملة)
|   |       
|   +---📁 Articles
|   |       📄 Articles.jsx - (صفحة المقالات الكاملة)
|   |       
|   +---📁 auth (صفحات التحقق)
|   |   |   📄 SocialCallback.jsx - (صفحة الرد لتسجيل الدخول بجوجل/فيسبوك)
|   |   |   📄 SocialIcons.jsx - (أيقونات تسجيل الدخول الاجتماعي)
|   |   +---📁 Login
|   |   |       📄 LoginPage.jsx - (صفحة تسجيل الدخول)
|   |   +---📁 Register
|   |           📄 RegisterPage.jsx - (صفحة إنشاء حساب جديد)
|   |           
|   +---📁 Books (صفحات متجر الكتب)
|   |       📄 BookDetails.jsx - (صفحة تفاصيل الكتاب المختار)
|   |       📄 Books.jsx - (صفحة المتجر الرئيسية للكتب)
|   |       📄 BuyNow.jsx - (صفحة الدفع وتوصيل الكتاب)
|   |       
|   +---📁 ContactUs
|   |       📄 Contact_Us.jsx - (صفحة تواصل معنا)
|   |       
|   +---📁 GeminiSingap
|   |       📄 GeminiSingap.jsx - (صفحة المساعد الذكي / الشات بوت)
|   |       📄 Icon_Gemini.jsx - (أيقونة المساعد الذكي)
|   |       
|   +---📁 Home
|   |       📄 Home.jsx - (الصفحة الرئيسية للموقع)
|   |       
|   +---📁 Instructors (صفحات المدربين)
|   |       📄 InstructorDetails.jsx - (صفحة الملف الشخصي للمدرب وكورساته)
|   |       📄 Instructors.jsx - (صفحة قائمة كل المدربين)
|   |       
|   +---📁 Live_courses (صفحات الكورسات المباشرة - زووم/لايف)
|   |   |   📄 LiveCourseDetails.jsx - (صفحة تفاصيل الكورس المباشر לפני השراء)
|   |   |   📄 LiveCourseLessons_old.jsx - (نسخة قديمة من صفحة دروس الكورس المباشر)
|   |   |   📄 LiveCourses.jsx - (صفحة قائمة الكورسات المباشرة)
|   |   |   
|   |   \---📁 LiveCourseLessons (صفحة دروس الكورس المباشر)
|   |           📄 animations.js - (حركات الأنميشن للصفحة)
|   |           📄 InactiveSession.jsx - (الجزء اللي بيظهر لما تكون الجلسة لسه مبدأتش - عداد تنازلي)
|   |           📄 LiveCourseLessons.jsx - (الصفحة الأساسية اللي بيحضر منها الطالب الكورس المباشر)
|   |           📄 Sidebar.jsx - (القائمة الجانبية للكورسات المباشرة)
|   |           📄 timeUtils.jsx - (أدوات مساعدة لحساب التوقيت والوقت المتبقي للجلسات)
|   |           
|   +---📁 NotFound
|   |       📄 NotFound.jsx - (صفحة خطأ 404 لو الرابط غلط)
|   |       
|   +---📁 Payment
|   |       📄 PaymentFailed.jsx - (صفحة فشل عملية الدفع)
|   |       📄 PaymentSuccess.jsx - (صفحة نجاح عملية الدفع)
|   |       
|   +---📁 Privacypolicy
|   |       📄 Privacypolicy.jsx - (صفحة سياسة الخصوصية)
|   |       
|   +---📁 Profile (صفحات الحساب الشخصي للطالب)
|   |       📄 ChangePasswordModal.jsx - (نافذة تغيير الباسورد)
|   |       📄 MyCourses.jsx - (الكورسات المشترك فيها)
|   |       📄 MyFavorites.jsx - (الكورسات والكتب المفضلة)
|   |       📄 MyOrders.jsx - (طلبات الشراء والفواتير)
|   |       📄 MyProfile.jsx - (بيانات الحساب الشخصي)
|   |       📄 MyRatings.jsx - (التقييمات اللي الطالب كتبها)
|   |       📄 Profile.jsx - (الصفحة الرئيسية للوحة تحكم الطالب اللي بتجمع الصفحات دي)
|   |       📄 ProfileCompletionModal.jsx - (نافذة إجبارية لاستكمال البيانات)
|   |       
|   +---📁 PurchasePolicy
|   |       📄 PurchasePolicy.jsx - (صفحة سياسة الشراء)
|   |       
|   +---📁 shared (صفحات مشتركة بتفتح من أكتر من مكان)
|   |       📄 Certificate.jsx - (صفحة استخراج وعرض الشهادة)
|   |       📄 TestResults.jsx - (صفحة عرض نتيجة الامتحان النهائي أو العادي)
|   |       
|   +---📁 TermsAndConditions
|   |       📄 TermsAndConditions.jsx - (صفحة الشروط والأحكام)
|   |       
|   +---📁 Test_yourself (قسم اختبر نفسك للتدريب الحر)
|   |       📄 ConnectQuestion.jsx - (سؤال توصيل)
|   |       📄 CourseDetails.jsx - (تفاصيل الاختبار)
|   |       📄 CourseList.jsx - (قائمة مجالات الاختبارات)
|   |       📄 MCQQuestion.jsx - (سؤال اختيارات)
|   |       📄 ResultsPage.jsx - (نتيجة الاختبار)
|   |       📄 TestInterface.jsx - (واجهة حل الامتحان)
|   |       📄 TestYourself.jsx - (الصفحة الرئيسية للقسم)
|   |       
|   +---📁 Video_courses (صفحات الكورسات المسجلة بالفيديو)
|       |   📄 CourseDetails.jsx - (تفاصيل الكورس المسجل قبل الشراء)
|       |   📄 Courses.jsx - (قائمة كل الكورسات)
|       |   📄 CourseTestRunner.jsx - (المكون الأساسي لمشغل الامتحانات اللي بيجمع المكونات الفرعية جواه)
|       |   📄 VideoCourses.jsx - (تجميعة للكورسات المسجلة)
|       |   
|       +---📁 course-lessons (محتوى الكورس المسجل)
|       |       📄 CourseContentSidebar.jsx - (القائمة الجانبية اللي بتتحكم في الفيديوهات)
|       |       📄 CourseLessons.jsx - (الصفحة الأساسية اللي الطالب بيتفرج منها على الفيديوهات)
|       |       
|       \---📁 CourseTestRunner (مشغل امتحانات الكورسات)
|               📄 ConnectQuestion.jsx - (مكون سؤال السحب والإفلات للصور والنصوص)
|               📄 MatchQuestion.jsx - (مكون سؤال التوصيل العادي)
|               📄 MultipleChoiceQuestion.jsx - (مكون سؤال الاختيارات)
|               📄 PreviousTestResult.jsx - (شاشة عرض النتيجة السابقة لو امتحن قبل كدا)
|               📄 TestHeader.jsx - (الهيدر اللي فيه عداد الأسئلة)
|               
\---📁 utils (أدوات ووظائف مساعدة)
        📄 certificateUtils.js - (دوال لتحميل وتعديل نصوص الشهادات واستخراجها)
```
