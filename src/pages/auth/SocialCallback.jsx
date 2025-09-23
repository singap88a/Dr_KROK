import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function SocialCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, register } = useUser();

  useEffect(() => {
    const handleSocialCallback = async () => {
      try {
        // Get the token from URL parameters
        const token = searchParams.get('token');
        const userData = searchParams.get('user');
        const isRegister = searchParams.get('register') === 'true';

        if (token && userData) {
          const user = JSON.parse(decodeURIComponent(userData));

          if (isRegister) {
            register(token, user);
            toast.success('🎉 Account created successfully!', {
              position: 'top-right',
            });
            setTimeout(() => {
              navigate('/profile');
            }, 1500);
          } else {
            login(token, user);
            toast.success('✅ Login successful!', {
              position: 'top-right',
            });
            setTimeout(() => {
              navigate('/');
            }, 1500);
          }
        } else {
          toast.error('❌ Authentication failed. Please try again.', {
            position: 'top-right',
          });
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
      } catch (error) {
        console.error('Social callback error:', error);
        toast.error('❌ Authentication failed. Please try again.', {
          position: 'top-right',
        });
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    };

    handleSocialCallback();
  }, [searchParams, login, register, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background text-text">
      <ToastContainer />
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 border-b-2 rounded-full animate-spin border-primary"></div>
        <p className="text-lg">Processing authentication...</p>
      </div>
    </div>
  );
}
