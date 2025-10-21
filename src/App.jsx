import { Routes, Route, Link } from "react-router-dom";

import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import ScrollToTop from "./components/ScrollToTop";
// import AuthPage from "./components/AuthPage";
import Home from "./pages/Home/Home";
import Books from "./pages/Books/Books";
import BookDetails from "./pages/Books/BookDetails";
import BuyNow from "./pages/Books/BuyNow";
import ContactUs from "./pages/ContactUs/Contact_Us";

import About from "./pages/About/About";
import Profile from "./pages/Profile/Profile";
import CTA from "./components/Home/CTA";
import Courses from "./pages/Courses/Courses";
import CourseDetails from "./pages/Courses/CourseDetails";
import CourseLessons from "./pages/Courses/course-lessons/CourseLessons";
import CourseSubscription from "./pages/Courses/CourseSubscription";
import CourseTestRunner from "./pages/Courses/CourseTestRunner";
import CourseCertificate from "./pages/Courses/CourseCertificate";
import CourseFinalTestResults from "./pages/Courses/CourseFinalTestResults";
import LessonTestResults from "./pages/Courses/course-lessons/LessonTestResults";
import CourseSectionTestResults from "./pages/Courses/CourseSectionTestResults";

import TrainerArticlesPage from "./pages/Articles/Articles";
import GeminiSingap from "./pages/GeminiSingap/GeminiSingap";
import AI_Icon from "./pages/GeminiSingap/Icon_Gemini";
import TestYourself from "./pages/Test_yourself/TestYourself";
import LoginPage from "./pages/auth/Login/LoginPage";
import RegisterPage from "./pages/auth/Register/RegisterPage";
import SocialCallback from "./pages/auth/SocialCallback";
import Privacypolicy from "./pages/Privacypolicy/Privacypolicy";
import { UserProvider } from "./context/UserContext";
import { ApiProvider } from "./context/ApiContext";
import WhatsAppIcon from "./components/WhatsAppIcon";
import Instructors from "./pages/Instructors/Instructors";
import InstructorDetails from "./pages/Instructors/InstructorDetails";
import LiveCourses from "./pages/Live_courses/LiveCourses";
import LiveCourseDetails from "./pages/Live_courses/LiveCourseDetails";
// import LiveCourseSubscription from "./pages/Live_courses/LiveCourseSubscription";
import LiveCourseLessons from "./pages/Live_courses/LiveCourseLessons";

export default function App() {
  return (
    <div className="min-h-screen bg-background text-text">
     <ApiProvider>
      <UserProvider>
        <ScrollToTop />

        <Navbar />
        <main className="pt-16">
        <Routes>
          <Route path="/" element={<Home />} />
                  <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/auth/google/callback" element={<SocialCallback />} />
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
          <Route path="/courses/:id/certificate" element={<CourseCertificate />} />
          <Route path="/courses/:id/final-results" element={<CourseFinalTestResults />} />
          <Route path="/courses/:id/lesson-results" element={<LessonTestResults />} />
          <Route path="/courses/:id/section-results" element={<CourseSectionTestResults />} />
          <Route path="/courses/:id/subscribe" element={<CourseSubscription />} />

          <Route path="/live-courses" element={<LiveCourses />} />
          <Route path="/live-courses/:id" element={<LiveCourseDetails />} />
          <Route path="/live-courses/:id/subscribe" element={<CourseSubscription />} />
          <Route path="/live-courses/:id/lessons" element={<LiveCourseLessons />} />

 
          <Route path="/articles" element={<TrainerArticlesPage />} />
          <Route path="/gemini" element={<GeminiSingap />} />
          <Route path="/test" element={<TestYourself />} />
          <Route path="/privacypolicy" element={<Privacypolicy />} />
                    <Route path="/instructors" element={<Instructors />} />
          <Route path="/instructors/:id" element={<InstructorDetails />} />

        </Routes>
      </main>
      <AI_Icon />
      <WhatsAppIcon/>
      <CTA />

        <Footer />
      </UserProvider>
     </ApiProvider>

    </div>
  );
}
