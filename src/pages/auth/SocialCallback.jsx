import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useUser } from '../../context/UserContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SocialCallback = () => {
  const navigate = useNavigate();
  const { login } = useUser();

  useEffect(() => {
    const handleSocialCallback = async () => {
      try {
        // استخراج التوكن من الـ URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const email = urlParams.get('email');

        console.log("Token received:", token);
        console.log("Email received:", email);

        if (token) {
          // حفظ التوكن في localStorage
          localStorage.setItem("token", token);

          // جلب بيانات المستخدم باستخدام التوكن
          try {
            const userResponse = await axios.get(
              "https://dr-krok.com/api/auth/me",
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  Accept: "application/json",
                },
              }
            );

            console.log("User data response:", userResponse.data);

            if (userResponse.data.success) {
              // حفظ بيانات المستخدم في context
              login(token, userResponse.data.data);
              
              toast.success('✅ تسجيل الدخول بنجاح!', {
                position: 'top-right',
              });
              
              // التوجيه لصفحة الملف الشخصي
              setTimeout(() => {
                navigate("/profile", { replace: true });
              }, 1500);
            } else {
              throw new Error("Failed to get user data");
            }
          } catch (userError) {
            console.error("Error fetching user data:", userError);
            
            // إذا فشل جلب البيانات، استخدم البيانات الأساسية
            const basicUserData = {
              id: Date.now(), // ID مؤقت
              email: email || 'user@example.com',
              name: email?.split('@')[0] || 'User',
            };
            
            login(token, basicUserData);
            
            toast.success('✅ تسجيل الدخول بنجاح!', {
              position: 'top-right',
            });
            
            setTimeout(() => {
              navigate("/profile", { replace: true });
            }, 1500);
          }
        } else {
          throw new Error("No token received from social login");
        }
      } catch (error) {
        console.error("Social authentication failed:", error);
        toast.error('❌ فشل المصادقة. يرجى المحاولة مرة أخرى.', {
          position: 'top-right',
        });
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2000);
      }
    };

    handleSocialCallback();
  }, [navigate, login]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-text">
      <ToastContainer />
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 border-b-2 rounded-full animate-spin border-primary"></div>
        <p className="text-lg">جاري معالجة المصادقة...</p>
        <p className="mt-2 text-sm text-gray-500">يرجى الانتظار</p>
      </div>
    </div>
  );
};

export default SocialCallback;