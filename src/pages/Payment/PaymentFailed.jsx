import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaTimesCircle, FaRedo, FaHome, FaExclamationTriangle, FaHeadset, FaArrowLeft } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

export default function PaymentFailed() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const orderReference = searchParams.get('order');
  const reason = searchParams.get('reason');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 30 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 120, damping: 20 }
    }
  };

  const shakeVariants = {
    animate: {
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.5, delay: 0.2 }
    }
  };

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-background px-6 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-t from-red-500/5 to-transparent pointer-events-none" />
      
      <motion.div 
        key="failed-content"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="z-30 w-full max-w-5xl flex flex-col items-center text-center"
      >
        <motion.div variants={shakeVariants} animate="animate" className="mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-[40px] scale-125 animate-pulse" />
            <div className="w-28 h-28 bg-gradient-to-br from-red-500 to-rose-600 rounded-full flex items-center justify-center relative shadow-xl">
              <FaTimesCircle className="text-6xl text-white" />
            </div>
          </div>
        </motion.div>

        <motion.h1 
          variants={itemVariants} 
          className="text-4xl md:text-5xl font-black mb-4 tracking-tight"
        >
           Oops! <span className="text-red-500 italic">Failed.</span>
        </motion.h1>

        <motion.p variants={itemVariants} className="text-lg md:text-xl text-text-secondary max-w-2xl mb-8 font-medium leading-relaxed">
          Your transaction couldn't be completed. Don't worry, <span className="font-bold text-text underline underline-offset-4">no funds were deducted</span>. Let's try another way.
        </motion.p>

        {/* Failure Details Box */}
        <motion.div 
          variants={itemVariants}
          className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-4 mb-10"
        >
          <div className="p-6 bg-red-500/5 backdrop-blur-sm rounded-2xl border border-red-500/10 text-left">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-500/60 block mb-1">Technical Reason</span>
            <p className="text-base font-bold text-red-500 leading-snug">
              {reason || "The banking network declined the request or was unreachable."}
            </p>
          </div>
          
          <div className="p-6 bg-surface/50 backdrop-blur-sm rounded-2xl border border-white/5 text-left">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted block mb-1">Transaction ID</span>
            <p className="font-mono text-base font-bold text-primary truncate">
              {orderReference || 'N/A_REF'}
            </p>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 w-full max-w-lg">
          <button 
            onClick={() => navigate('/courses')}
            className="flex-[1.5] py-4 px-8 bg-primary text-white text-lg font-black rounded-2xl hover:scale-[1.05] active:scale-[0.95] transition-all flex items-center justify-center gap-3 shadow-lg shadow-primary/20 group overflow-hidden"
          >
            <FaRedo className="group-hover:rotate-180 transition-transform duration-700" /> Retry Now
          </button>
          
          <button 
            onClick={() => navigate('/')}
            className="flex-1 py-4 px-8 border-2 border-primary text-primary text-lg font-bold rounded-2xl hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-3 active:scale-95"
          >
            <FaHome /> Home
          </button>
        </motion.div>

        <motion.button 
          variants={itemVariants}
          className="mt-12 flex items-center gap-3 text-text-muted hover:text-primary transition-colors font-bold group"
        >
          <FaHeadset className="group-hover:scale-125 transition-transform" /> Contact Support Team
        </motion.button>
      </motion.div>

      {/* Decorative Orbs */}
      <motion.div 
        className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-red-500/5 rounded-full blur-[150px] -z-10 animate-pulse"
      />
      <motion.div 
        className="fixed bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-primary/5 rounded-full blur-[120px] -z-10"
      />
    </div>
  );
}
