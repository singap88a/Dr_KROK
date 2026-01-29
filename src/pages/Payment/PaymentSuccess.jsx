import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaListUl, FaHome, FaStar, FaTrophy, FaArrowRight } from 'react-icons/fa';
import { useApi } from '../../context/ApiContext';
import { useTranslation } from 'react-i18next';

// Immersive confetti for full-screen joy
const Confetti = () => {
  const particles = Array.from({ length: 50 });
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-4 rounded-sm"
          style={{
            backgroundColor: ['#4ade80', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'][i % 5],
            left: `${Math.random() * 100}%`,
            top: `-20px`,
          }}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{ 
            y: ['0vh', '110vh'], 
            opacity: [1, 1, 0],
            rotate: 720 * (Math.random() > 0.5 ? 1 : -1),
            x: (Math.random() - 0.5) * 300
          }}
          transition={{ 
            duration: 3 + Math.random() * 4, 
            repeat: Infinity, 
            delay: Math.random() * 5,
            ease: [0.25, 0.1, 0.25, 1]
          }}
        />
      ))}
    </div>
  );
};

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { request } = useApi();
  const [loading, setLoading] = useState(true);
  const orderReference = searchParams.get('order');

  useEffect(() => {
    const checkOrder = async () => {
      try {
        await request('orders', { auth: true });
        setTimeout(() => setLoading(false), 1500);
      } catch (error) {
        console.error('Error checking order:', error);
        setLoading(false);
      }
    };

    if (orderReference) {
      checkOrder();
    } else {
      setLoading(false);
    }
  }, [orderReference, request]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring", stiffness: 100, damping: 15 }
    }
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-background px-6 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      
      {!loading && <Confetti />}
      
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="z-30 flex flex-col items-center"
          >
            <div className="relative mb-8">
              <motion.div 
                className="w-32 h-32 border-4 border-primary/20 border-t-primary rounded-full animate-spin"
              />
              <motion.div 
                className="absolute inset-0 flex items-center justify-center"
                animate={{ scale: [0.9, 1.1, 0.9], rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <FaStar className="text-3xl text-primary" />
              </motion.div>
            </div>
            <h2 className="text-3xl font-black text-center tracking-tight">Confirming Your Order...</h2>
            <p className="text-text-secondary mt-2">Almost there! Your journey is about to begin.</p>
          </motion.div>
        ) : (
          <motion.div 
            key="success-content"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="z-30 w-full max-w-5xl flex flex-col items-center text-center"
          >
            {/* Celebration Icon */}
            <motion.div variants={itemVariants} className="mb-6 relative">
              <motion.div 
                className="absolute inset-0 bg-green-500/30 rounded-full blur-[40px]"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.7, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <div className="w-28 h-28 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.2)] relative group">
                <FaCheckCircle className="text-6xl text-white drop-shadow-xl group-hover:scale-110 transition-transform duration-500" />
                <motion.div 
                  className="absolute -top-4 -right-4 bg-yellow-400 p-3 rounded-2xl shadow-xl border-4 border-background"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <FaTrophy className="text-white text-xl" />
                </motion.div>
              </div>
            </motion.div>

            {/* Main Header */}
            <motion.h1 
              variants={itemVariants} 
              className="text-4xl md:text-5xl font-black mb-4 tracking-tight"
            >
               Great <span className="text-primary">Success!</span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-lg md:text-xl text-text-secondary max-w-2xl mb-8 font-medium leading-relaxed">
              Your payment was received. Your account is now <span className="text-green-500 font-bold underline underline-offset-4">upgraded</span> and ready for action.
            </motion.p>

            {/* Reference & Info Box */}
            <motion.div 
              variants={itemVariants}
              className="px-8 py-3 bg-surface/50 backdrop-blur-md rounded-full border border-white/10 mb-10 flex items-center gap-6"
            >
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">Reference</span>
                <span className="font-mono text-base font-bold text-primary">{orderReference || 'CONFIRMED'}</span>
              </div>
              <div className="w-px h-6 bg-border" />
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">Status</span>
                <span className="text-base font-bold text-green-500 flex items-center gap-2">Active</span>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
              <button 
                onClick={() => navigate('/profile', { state: { activeTab: 'orders' } })}
                className="flex-[1.5] py-4 px-8 bg-primary text-white text-lg font-black rounded-2xl hover:scale-[1.05] active:scale-[0.95] transition-all flex items-center justify-center gap-3 shadow-lg shadow-primary/20 group overflow-hidden relative"
              >
                <motion.div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                View My Orders <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button 
                onClick={() => navigate('/')}
                className="flex-1 py-4 px-8 border-2 border-primary text-primary text-lg font-bold rounded-2xl hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                <FaHome /> Home
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative Orbs */}
      <motion.div 
        className="fixed top-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-primary/10 rounded-full blur-[150px] -z-10"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 20, repeat: Infinity }}
      />
      <motion.div 
        className="fixed bottom-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-emerald-500/5 rounded-full blur-[120px] -z-10"
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{ duration: 15, repeat: Infinity }}
      />
    </div>
  );
}
