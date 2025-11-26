import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useUser } from '../../context/UserContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslation } from 'react-i18next';

const SocialCallback = () => {
  const navigate = useNavigate();
  const { login } = useUser();
  const { t } = useTranslation();

  useEffect(() => {
    const handleSocialCallback = async () => {
      try {
        // Extract token from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const email = urlParams.get('email');

        console.log("Token received:", token);
        console.log("Email received:", email);

        if (token) {
          // Save token in localStorage
          localStorage.setItem("token", token);

          // Fetch user data using the token
          try {
            const userResponse = await axios.get(
              "https://admin.dr-krok.com/api/auth/me",
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  Accept: "application/json",
                },
              }
            );

            console.log("User data response:", userResponse.data);

            if (userResponse.data.success) {
              // Save user data in context
              login(token, userResponse.data.data);
              
              toast.success(t('auth.social.login_success'), {
                position: 'top-right',
              });
              
              // Navigate to profile page
              setTimeout(() => {
                navigate("/profile", { replace: true });
              }, 1500);
            } else {
              throw new Error("Failed to get user data");
            }
          } catch (userError) {
            console.error("Error fetching user data:", userError);

            // If fetching data fails, use basic data
            const basicUserData = {
              id: Date.now(), // Temporary ID
              email: email || 'user@example.com',
              name: email?.split('@')[0] || 'User',
            };
            
            login(token, basicUserData);
            
            toast.success(t('auth.social.login_success'), {
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
        toast.error(t('auth.social.auth_failed'), {
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
        <p className="text-lg">{t('auth.social.processing_auth')}</p>
        <p className="mt-2 text-sm text-gray-500">{t('auth.social.please_wait')}</p>
      </div>
    </div>
  );
};

export default SocialCallback;