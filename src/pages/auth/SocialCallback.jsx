import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useUser } from '../../context/UserContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const { login } = useUser();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // هنا هنكلم API بتاع لارافيل اللي بيهندل الكولباك
        const response = await axios.get(
          "https://dr-krok.com/api/auth/google/callback",
          {
            withCredentials: true,
          }
        );

        // خزن التوكن اللي جالك
        localStorage.setItem("token", response.data.token);

        // روح على الصفحة الرئيسية أو الداشبورد
        login(response.data.token, response.data.user);
        toast.success('✅ Login successful!', {
          position: 'top-right',
        });
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } catch (error) {
        console.error("Google login failed:", error);
        toast.error('❌ Authentication failed. Please try again.', {
          position: 'top-right',
        });
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    };

    fetchUser();
  }, [navigate, login]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-text">
      <ToastContainer />
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 border-b-2 rounded-full animate-spin border-primary"></div>
        <p className="text-lg">Processing authentication...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;
