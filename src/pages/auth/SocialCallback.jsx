import { useEffect, useRef } from "react";
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
  const processedRef = useRef(false);

  useEffect(() => {
    const handleSocialCallback = async () => {
      if (processedRef.current) return;
      processedRef.current = true;
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const email = urlParams.get('email');

        console.log("Social Auth Callback - Token received:", !!token);
        if (email) console.log("Social Auth Callback - Email received:", email);

        if (token) {
          // Prevent React StrictMode double-execution using sessionStorage
          if (sessionStorage.getItem('DR_KROK_consumed_token') === token) {
            console.log("Token already processed, skipping...");
            return;
          }
          sessionStorage.setItem('DR_KROK_consumed_token', token);

          localStorage.setItem("token", token);

          try {
            console.log("Fetching user profile with token...");
            const userResponse = await axios.get(
              "https://admin.dr-krok.com/api/auth/me",
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  Accept: "application/json",
                },
              }
            );

            console.log("User data response success:", userResponse.data.success);

            if (userResponse.data.success) {
              login(token, userResponse.data.data);
              
              toast.success(t('auth.social.login_success'), {
                position: 'top-right',
              });
              
              const authFlow = localStorage.getItem('DR_KROK_auth_flow');
              const returnUrl = localStorage.getItem('DR_KROK_return_url');
              
              console.log("Auth Flow:", authFlow, "Return URL:", returnUrl);

              if (authFlow === 'register') {
                localStorage.setItem('DR_KROK_show_completion_modal', 'true');
              }
              
              const redirectPath = "/profile";
              
              console.log("Final Redirect Path:", redirectPath);

              localStorage.removeItem('DR_KROK_auth_flow');
              localStorage.removeItem('DR_KROK_return_url');

              setTimeout(() => {
                navigate(redirectPath, { replace: true });
              }, 1500);
            } else {
              throw new Error("API returned success:false");
            }
          } catch (userError) {
            console.error("Error fetching user data profile:", userError);

            const basicUserData = {
              id: Date.now(),
              email: email || 'user@example.com',
              name: email?.split('@')[0] || 'User',
            };
            
            login(token, basicUserData);
            
            toast.success(t('auth.social.login_success'), {
              position: 'top-right',
            });
            
            const authFlow = localStorage.getItem('DR_KROK_auth_flow');
            const returnUrl = localStorage.getItem('DR_KROK_return_url');
            
            if (authFlow === 'register') {
              localStorage.setItem('DR_KROK_show_completion_modal', 'true');
            }
            
            const redirectPath = "/profile";
            
            localStorage.removeItem('DR_KROK_auth_flow');
            localStorage.removeItem('DR_KROK_return_url');

            setTimeout(() => {
              navigate(redirectPath, { replace: true });
            }, 1500);
          }
        } else {
          throw new Error("No token received from social login");
        }
      } catch (error) {
        console.error("Social authentication failed overall:", error);
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