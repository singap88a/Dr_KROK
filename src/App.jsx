import React, { Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import Footer from "./components/Layout/Footer";
import Navbar from "./components/Layout/Navbar";
import ScrollToTop from "./components/Layout/ScrollToTop";
import LoadingSpinner from "./components/Common/LoadingSpinner";
import TelegramIcon from "./components/Layout/TelegramIcon";

// Lazy-loaded components
const Home = lazy(() => import("./pages/Home/Home"));
const StoreDetails = lazy(() => import("./pages/Store/Shared/StoreDetails"));
const StoreCheckout = lazy(() => import("./pages/Store/Shared/StoreCheckout"));

const Books = lazy(() => import("./pages/Store/BooksAndBooklets/Books"));
const Booklets = lazy(() => import("./pages/Store/BooksAndBooklets/Booklets"));
const MedicalTools = lazy(() => import("./pages/Store/MedicalTools/MedicalTools"));
const MedicalClothes = lazy(() => import("./pages/Store/MedicalClothes/MedicalClothes"));
const MedicalClothesDetails = lazy(() => import("./pages/Store/MedicalClothes/MedicalClothesDetails"));
const ContactUs = lazy(() => import("./pages/ContactUs/Contact_Us"));
const About = lazy(() => import("./pages/About/About"));
const Profile = lazy(() => import("./pages/Profile/Profile"));
const CTA = lazy(() => import("./components/Home/CTA"));
const Courses = lazy(() => import("./pages/Video_courses/Courses"));
const CourseDetails = lazy(() => import("./pages/Video_courses/CourseDetails"));
const CourseLessons = lazy(() => import("./pages/Video_courses/course-lessons/CourseLessons"));
const CourseSubscription = lazy(() => import("./components/Courses/Subscription/CourseSubscription"));
const CourseTestRunner = lazy(() => import("./pages/Video_courses/CourseTestRunner"));
const Certificate = lazy(() => import("./pages/shared/Certificate"));
const TestResults = lazy(() => import("./pages/shared/TestResults"));
const TrainerArticlesPage = lazy(() => import("./pages/Articles/Articles"));
const ArticleDetail = lazy(() => import("./pages/Articles/ArticleDetail"));
const GeminiSingap = lazy(() => import("./pages/GeminiSingap/GeminiSingap"));
const AI_Icon = lazy(() => import("./pages/GeminiSingap/Icon_Gemini"));
const TestYourself = lazy(() => import("./pages/Test_yourself/TestYourself"));
const LoginPage = lazy(() => import("./pages/auth/Login/LoginPage"));
const RegisterPage = lazy(() => import("./pages/auth/Register/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("./pages/auth/ForgotPassword/ForgotPasswordPage"));
const SocialCallback = lazy(() => import("./pages/auth/SocialCallback"));
const Privacypolicy = lazy(() => import("./pages/Privacypolicy/Privacypolicy"));
const TermsAndConditions = lazy(() => import("./pages/TermsAndConditions/TermsAndConditions"));
const PurchasePolicy = lazy(() => import("./pages/PurchasePolicy/PurchasePolicy"));
const Instructors = lazy(() => import("./pages/Instructors/Instructors"));
const InstructorDetails = lazy(() => import("./pages/Instructors/InstructorDetails"));
const LiveCourses = lazy(() => import("./pages/Live_courses/LiveCourses"));
const LiveCourseDetails = lazy(() => import("./pages/Live_courses/LiveCourseDetails"));
const LiveCourseLessons = lazy(() => import("./pages/Live_courses/LiveCourseLessons/LiveCourseLessons"));
const PaymentSuccess = lazy(() => import("./pages/Payment/PaymentSuccess"));
const PaymentFailed = lazy(() => import("./pages/Payment/PaymentFailed"));
const NotFound = lazy(() => import("./pages/NotFound/NotFound"));
const Jobs = lazy(() => import("./pages/Jobs/Jobs"));
const ApplicationSuccess = lazy(() => import("./pages/Jobs/ApplicationSuccess"));
const UniversityRepresentative = lazy(() => import("./pages/UniversityRepresentative/UniversityRepresentative"));
const UniversityStudents = lazy(() => import("./pages/Profile/UniversityStudents"));
const TestimonialsPage = lazy(() => import("./pages/Testimonials/Testimonials"));

export default function App() {
  const location = useLocation();
  const isChatPage = location.pathname === "/gemini";

  return (
    <div className="min-h-screen bg-background text-text">
      <ScrollToTop />
      <Navbar />
      <main className="pt-16">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <LoadingSpinner />
          </div>
        }>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/auth/callback" element={<SocialCallback />} />
            <Route path="/about" element={<About />} />
            
            {/* Store Routes */}
            <Route path="/store/books" element={<Books />} />
            <Route path="/store/booklets" element={<Booklets />} />
            <Route path="/store/books/:id" element={<StoreDetails productType="book" apiPath="books" checkoutRoute="/store/checkout" />} />
            <Route path="/store/booklets/:id" element={<StoreDetails productType="booklet" apiPath="books" checkoutRoute="/store/checkout" />} />
            
            <Route path="/store/medical-tools" element={<MedicalTools />} />
            <Route path="/store/medical-tools/:id" element={<StoreDetails productType="medical_tool" apiPath="medical-tools" checkoutRoute="/store/checkout" />} />
            
            <Route path="/store/medical-clothes" element={<MedicalClothes />} />
            <Route path="/store/medical-clothes/:id" element={<MedicalClothesDetails />} />
            
            <Route path="/store/checkout" element={<StoreCheckout />} />
            <Route path="/buynow" element={<StoreCheckout />} />

            <Route path="/contact" element={<ContactUs />} />
            <Route path="/testimonials" element={<TestimonialsPage />} />

            <Route path="/profile" element={<Profile />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:id" element={<CourseDetails />} />
            <Route path="/courses/:id/lessons" element={<CourseLessons />} />
            <Route path="/courses/:id/test/:scope/:testId" element={<CourseTestRunner />} />
            <Route path="/courses/:id/certificate" element={<Certificate />} />
            <Route path="/courses/:id/test-results/:scope/:testId" element={<TestResults />} />
            <Route path="/courses/:id/final-results" element={<TestResults />} />
            <Route path="/courses/:id/subscribe" element={<CourseSubscription />} />

            <Route path="/live-courses" element={<LiveCourses />} />
            <Route path="/live-courses/:id" element={<LiveCourseDetails />} />
            <Route path="/live-courses/:id/subscribe" element={<CourseSubscription />} />
            <Route path="/live-courses/:id/lessons" element={<LiveCourseLessons />} />
            <Route path="/live-courses/:id/test/:scope/:testId" element={<CourseTestRunner />} />
            <Route path="/live-courses/:id/final-results" element={<TestResults />} />
            <Route path="/live-courses/:id/test-results/:scope/:testId" element={<TestResults />} />
            <Route path="/live-courses/:id/certificate" element={<Certificate />} />


            <Route path="/articles" element={<TrainerArticlesPage />} />
            <Route path="/articles/:slug" element={<ArticleDetail />} />
            <Route path="/gemini" element={<GeminiSingap />} />
            <Route path="/test" element={<TestYourself />} />
            <Route path="/privacypolicy" element={<Privacypolicy />} />
            <Route path="/termsandconditions" element={<TermsAndConditions />} />
            <Route path="/purchase-policy" element={<PurchasePolicy />} />
            <Route path="/instructors" element={<Instructors />} />
            <Route path="/instructors/:id" element={<InstructorDetails />} />

            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/failed" element={<PaymentFailed />} />

            <Route path="/jobs" element={<Jobs />} />
            <Route path="/application-success" element={<ApplicationSuccess />} />
            <Route path="/university-representative" element={<UniversityRepresentative />} />
            <Route path="/profile/university-students" element={<UniversityStudents />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <AI_Icon />
      <TelegramIcon />
      {!isChatPage && (
        <>
          <CTA />
          <Footer />
        </>
      )}
    </div>
  );
}
