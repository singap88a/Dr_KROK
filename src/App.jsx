import { Routes, Route, Link } from "react-router-dom";
 
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
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
import DashboardHome from "./pages/Dashboard/DashboardHome";
import DashboardBooks from "./pages/Dashboard/DashboardBooks";
import DashboardUsers from "./pages/Dashboard/DashboardUsers";
import DashboardCourses from "./pages/Dashboard/DashboardCourses";
import DashboardInstructors from "./pages/Dashboard/DashboardInstructors";
import TrainerArticlesPage from "./pages/Articles/Articles";
import GeminiSingap from "./pages/GeminiSingap/GeminiSingap";
import AI_Icon from "./pages/GeminiSingap/Icon_Gemini";
import TestYourself from "./pages/Test_yourself/TestYourself";
import LoginPage from "./pages/auth/Login/LoginPage";
import RegisterPage from "./pages/auth/Register/RegisterPage";
import Privacypolicy from "./pages/Privacypolicy/Privacypolicy";
import { UserProvider } from "./context/UserContext";

export default function App() {
  return (
    <div className="min-h-screen bg-background text-text">
     <UserProvider>

      <Navbar />
      <main className="pt-16">
        <Routes>
          <Route path="/" element={<Home />} />
                  <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
          <Route path="/about" element={<About />} />
          {/* <Route path="/login" element={<Login />} /> */}
          {/* <Route path="/auth" element={<AuthPage />} /> */}
          <Route path="/books" element={<Books />} />
          <Route path="/book/:id" element={<BookDetails />} />
          <Route path="/contact" element={<ContactUs />} />

          <Route path="/buynow" element={<BuyNow />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/courses" element={<Courses />} />

          <Route path="/coursedetails" element={<CourseDetails />} />

          {/* Dashboard Routes */}
          <Route path="/dashboard" element={<DashboardHome />} />
          <Route path="/dashboard/books" element={<DashboardBooks />} />
          <Route path="/dashboard/users" element={<DashboardUsers />} />
          <Route path="/dashboard/courses" element={<DashboardCourses />} />
          <Route
            path="/dashboard/instructors"
            element={<DashboardInstructors />}
          />
          <Route path="/dashboard/*" element={<DashboardHome />} />
          <Route path="/articles" element={<TrainerArticlesPage />} />
          <Route path="/gemini" element={<GeminiSingap />} />
          <Route path="/test" element={<TestYourself />} />
          <Route path="/privacypolicy" element={<Privacypolicy />} />
        </Routes>
      </main>
      <AI_Icon />
      <CTA />

      <Footer />
     </UserProvider>

    </div>
  );
}
