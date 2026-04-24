import { Routes, Route, Link, useLocation } from "react-router-dom";

import Footer from "./components/Layout/Footer";
import Navbar from "./components/Layout/Navbar";
import ScrollToTop from "./components/Layout/ScrollToTop";
// import AuthPage from "./components/Auth/AuthPage";
import Home from "./pages/Home/Home";
import Books from "./pages/Books/Books";
import BookDetails from "./pages/Books/BookDetails";
import BuyNow from "./pages/Books/BuyNow";
import ContactUs from "./pages/ContactUs/Contact_Us";

import About from "./pages/About/About";
import Profile from "./pages/Profile/Profile";
import CTA from "./components/Home/CTA";
import Courses from "./pages/Video_courses/Courses";
import CourseDetails from "./pages/Video_courses/CourseDetails";
import CourseLessons from "./pages/Video_courses/course-lessons/CourseLessons";
import CourseSubscription from "./components/Courses/Subscription/CourseSubscription";
import CourseTestRunner from "./pages/Video_courses/CourseTestRunner";
import Certificate from "./pages/shared/Certificate";
import TestResults from "./pages/shared/TestResults";

import TrainerArticlesPage from "./pages/Articles/Articles";
import GeminiSingap from "./pages/GeminiSingap/GeminiSingap";
import AI_Icon from "./pages/GeminiSingap/Icon_Gemini";
import TestYourself from "./pages/Test_yourself/TestYourself";
import LoginPage from "./pages/auth/Login/LoginPage";
import RegisterPage from "./pages/auth/Register/RegisterPage";
import SocialCallback from "./pages/auth/SocialCallback";
import Privacypolicy from "./pages/Privacypolicy/Privacypolicy";
import TermsAndConditions from "./pages/TermsAndConditions/TermsAndConditions";
import PurchasePolicy from "./pages/PurchasePolicy/PurchasePolicy";
import { UserProvider } from "./context/UserContext";
import { ApiProvider } from "./context/ApiContext";
import { ThemeProvider } from "./context/ThemeContext";
import { CartProvider } from "./context/CartContext";
import TelegramIcon from "./components/Layout/TelegramIcon";
import Instructors from "./pages/Instructors/Instructors";
import InstructorDetails from "./pages/Instructors/InstructorDetails";
import LiveCourses from "./pages/Live_courses/LiveCourses";
import LiveCourseDetails from "./pages/Live_courses/LiveCourseDetails";
// import LiveCourseSubscription from "./pages/Live_courses/LiveCourseSubscription";
import LiveCourseLessons from "./pages/Live_courses/LiveCourseLessons/LiveCourseLessons";
import PaymentSuccess from "./pages/Payment/PaymentSuccess";
import PaymentFailed from "./pages/Payment/PaymentFailed";
import NotFound from "./pages/NotFound/NotFound";

export default function App() {
  const location = useLocation();
  const isChatPage = location.pathname === "/gemini";

  return (
    <div className="min-h-screen bg-background text-text">
     <ThemeProvider>
     <ApiProvider>
      <UserProvider>
       <CartProvider>
        <ScrollToTop />

        <Navbar />
        <main className="pt-16">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          {/* ✅ التصحيح هنا: تغيير المسار إلى /auth/callback بدلاً من /auth/google/callback */}
          <Route path="/auth/callback" element={<SocialCallback />} />
          <Route path="/about" element={<About />} />
          {/* <Route path="/login" element={<Login />} /> */}
          {/* <Route path="/auth" element={<AuthPage />} /> */}
          <Route path="/books" element={<Books />} />
          <Route path="/book/:id" element={<BookDetails />} />
          <Route path="/contact" element={<ContactUs />} />

          <Route path="/buynow" element={<BuyNow />} />
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
          <Route path="/gemini" element={<GeminiSingap />} />
          <Route path="/test" element={<TestYourself />} />
          <Route path="/privacypolicy" element={<Privacypolicy />} />
          <Route path="/termsandconditions" element={<TermsAndConditions />} />
          <Route path="/purchase-policy" element={<PurchasePolicy />} />
          <Route path="/instructors" element={<Instructors />} />
          <Route path="/instructors/:id" element={<InstructorDetails />} />

          {/* Payment Routes */}
          <Route path="/payment/success" element={<PaymentSuccess />} />
          <Route path="/payment/failed" element={<PaymentFailed />} />

          {/* NotFound Catch-all Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <AI_Icon />
      <TelegramIcon/>
      
      {!isChatPage && (
        <>
          <CTA />
          <Footer />
        </>
      )}

       </CartProvider>
      </UserProvider>
     </ApiProvider>
     </ThemeProvider>
    </div>
  );
}