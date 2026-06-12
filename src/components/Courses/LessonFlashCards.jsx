import React, { useState, useEffect, useCallback } from "react";
import { useApi } from "../../context/ApiContext";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaArrowLeft, 
  FaArrowRight, 
  FaRedo, 
  FaCheck, 
  FaLightbulb, 
  FaSync,
  FaKeyboard,
  FaTimes,
  FaGraduationCap
} from "react-icons/fa";

// Realistic medical mock cards for Dr. KROK in case API is empty or fails
const getMockFlashCards = (lessonId) => [
  {
    id: `mock-1-${lessonId}`,
    question: "What is the primary site of action of Loop Diuretics (e.g., Furosemide)?",
    answer: "The thick ascending limb of the loop of Henle, where they inhibit the Na-K-2Cl (NKCC2) cotransporter.",
    image: null
  },
  {
    id: `mock-2-${lessonId}`,
    question: "Which cranial nerve is responsible for the sensory innervation of the face and motor innervation for mastication?",
    answer: "Trigeminal Nerve (CN V) - provides sensory to the face and motor to the muscles of mastication (chewing).",
    image: null
  },
  {
    id: `mock-3-${lessonId}`,
    question: "What is the hallmark pathological finding in Parkinson's Disease?",
    answer: "Loss of dopaminergic neurons in the substantia nigra pars compacta and the presence of Lewy Bodies (intracytoplasmic inclusions of alpha-synuclein).",
    image: null
  },
  {
    id: `mock-4-${lessonId}`,
    question: "Which antibody type is responsible for Type I Hypersensitivity reactions (Anaphylaxis)?",
    answer: "IgE antibodies, which bind to mast cells and basophils, causing degranulation and release of histamine.",
    image: null
  },
  {
    id: `mock-5-${lessonId}`,
    question: "What is the drug of choice for treating acute status epilepticus?",
    answer: "Intravenous Lorazepam or Diazepam (Benzodiazepines), which enhance GABA-A receptor activity.",
    image: null
  }
];

export default function LessonFlashCards({ lessonId, isLiveCourse, hasAccess }) {
  const { t, i18n } = useTranslation();
  const { getLessonFlashCards, getLiveLessonFlashCards } = useApi();

  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [knowCount, setKnowCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [cardStates, setCardStates] = useState({}); // Stores 'known' or 'review' for each card

  const isRtl = i18n.language === "ar";

  // Load cards from API or fallback to mock
  useEffect(() => {
    let active = true;
    const fetchCards = async () => {
      if (!lessonId) return;
      setLoading(true);
      setCurrentIndex(0);
      setIsFlipped(false);
      setSessionCompleted(false);
      setKnowCount(0);
      setReviewCount(0);
      setCardStates({});

      try {
        let response;
        if (isLiveCourse) {
          response = await getLiveLessonFlashCards(lessonId, 1, 100);
        } else {
          response = await getLessonFlashCards(lessonId, 1, 100);
        }

        if (active) {
          if (response && response.success && response.data && response.data.length > 0) {
            setCards(response.data);
          } else {
            console.log("No flash cards from API, loading high-quality KROK mock cards");
            setCards(getMockFlashCards(lessonId));
          }
        }
      } catch (err) {
        console.warn("Failed to fetch flash cards from API, falling back to mock cards:", err.message);
        if (active) {
          setCards(getMockFlashCards(lessonId));
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchCards();
    return () => {
      active = false;
    };
  }, [lessonId, isLiveCourse, getLessonFlashCards, getLiveLessonFlashCards]);

  const handleNext = useCallback(() => {
    setIsFlipped(false);
    setTimeout(() => {
      if (currentIndex < cards.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setSessionCompleted(true);
      }
    }, 150);
  }, [currentIndex, cards.length]);

  const handlePrev = useCallback(() => {
    setIsFlipped(false);
    setTimeout(() => {
      if (currentIndex > 0) {
        setCurrentIndex((prev) => prev - 1);
      }
    }, 150);
  }, [currentIndex]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleMarkKnown = useCallback(() => {
    const cardId = cards[currentIndex]?.id;
    if (!cardStates[cardId]) {
      setKnowCount((prev) => prev + 1);
    } else if (cardStates[cardId] === "review") {
      setReviewCount((prev) => Math.max(0, prev - 1));
      setKnowCount((prev) => prev + 1);
    }
    setCardStates((prev) => ({ ...prev, [cardId]: "known" }));
    handleNext();
  }, [currentIndex, cards, cardStates, handleNext]);

  const handleMarkReview = useCallback(() => {
    const cardId = cards[currentIndex]?.id;
    if (!cardStates[cardId]) {
      setReviewCount((prev) => prev + 1);
    } else if (cardStates[cardId] === "known") {
      setKnowCount((prev) => Math.max(0, prev - 1));
      setReviewCount((prev) => prev + 1);
    }
    setCardStates((prev) => ({ ...prev, [cardId]: "review" }));
    handleNext();
  }, [currentIndex, cards, cardStates, handleNext]);

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionCompleted(false);
    setKnowCount(0);
    setReviewCount(0);
    setCardStates({});
  };

  // Keyboard Shortcuts Support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (sessionCompleted || loading || cards.length === 0) return;

      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        handleFlip();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        if (isRtl) handleNext();
        else handlePrev();
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        if (isRtl) handlePrev();
        else handleNext();
      } else if (isFlipped) {
        if (e.code === "Digit1" || e.code === "Numpad1" || e.code === "KeyR") {
          e.preventDefault();
          handleMarkReview();
        } else if (e.code === "Digit2" || e.code === "Numpad2" || e.code === "KeyK") {
          e.preventDefault();
          handleMarkKnown();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [loading, cards, currentIndex, isFlipped, sessionCompleted, handleFlip, handlePrev, handleNext, handleMarkKnown, handleMarkReview, isRtl]);

  // Multilingual Text Dictionary
  const texts = {
    title: t("flashcards.title", isRtl ? "بطاقات الاستذكار للدرس" : "Lesson Flash Cards"),
    subtitle: t("flashcards.subtitle", isRtl ? "اختبر معلوماتك وراجع أهم النقاط بسرعة فائقة!" : "Review core concepts and test your knowledge quickly!"),
    flipTip: t("flashcards.flipTip", isRtl ? "انقر على البطاقة لقلبها ورؤية الإجابة" : "Click card to flip and reveal the answer"),
    knewIt: t("flashcards.knewIt", isRtl ? "كنت أعرفها" : "I knew this"),
    reviewAgain: t("flashcards.reviewAgain", isRtl ? "احتاج لمراجعتها" : "Review again"),
    next: t("flashcards.next", isRtl ? "التالي" : "Next"),
    prev: t("flashcards.prev", isRtl ? "السابق" : "Prev"),
    restart: t("flashcards.restart", isRtl ? "البدء من جديد" : "Restart Quiz"),
    completedTitle: t("flashcards.completedTitle", isRtl ? "رائع! أنهيت المراجعة بنجاح 🎉" : "Excellent! You finished reviewing 🎉"),
    completedDesc: t("flashcards.completedDesc", isRtl ? "لقد مررت على جميع بطاقات الاستذكار في هذا الدرس بنجاح." : "You have successfully studied all the cards in this deck."),
    statsTitle: t("flashcards.statsTitle", isRtl ? "إحصائيات الجلسة" : "Session Summary"),
    statsKnew: t("flashcards.statsKnew", isRtl ? "نقاط متقنة:" : "Mastered:"),
    statsReview: t("flashcards.statsReview", isRtl ? "بحاجة لمراجعة:" : "Needs Review:"),
    statsProgress: t("flashcards.statsProgress", isRtl ? "نسبة الإتقان:" : "Mastery Rate:"),
    keyboardHelp: t("flashcards.keyboardHelp", isRtl ? "اختصارات لوحة المفاتيح" : "Keyboard Shortcuts"),
    keyboardSpace: t("flashcards.keyboardSpace", isRtl ? "المسافة / إدخال : لقلب البطاقة" : "Space / Enter : Flip card"),
    keyboardArrows: t("flashcards.keyboardArrows", isRtl ? "الأسهم الجانبية : الانتقال للبطاقات" : "Left / Right Arrows : Prev / Next"),
    keyboardReview: t("flashcards.keyboardReview", isRtl ? "مفتاح 1 / R : وضع علامة مراجعة" : "Key 1 / R : Mark for review"),
    keyboardKnew: t("flashcards.keyboardKnew", isRtl ? "مفتاح 2 / K : وضع علامة إتقان" : "Key 2 / K : Mark as mastered"),
    cardOf: t("flashcards.cardOf", isRtl ? "بطاقة {current} من {total}" : "Card {current} of {total}"),
    loading: t("flashcards.loading", isRtl ? "جاري تحميل بطاقات الاستذكار..." : "Loading flash cards...")
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 my-6 border border-border bg-surface/50 backdrop-blur rounded-2xl min-h-[300px]">
        <FaSync className="w-10 h-10 text-primary animate-spin mb-3" />
        <p className="text-text-muted font-medium">{texts.loading}</p>
      </div>
    );
  }

  if (cards.length === 0) {
    return null; // Don't render anything if there are absolutely no cards and mock failed
  }

  const currentCard = cards[currentIndex];
  const progressPercentage = Math.round(((currentIndex) / cards.length) * 100);
  const masteryRate = cards.length > 0 ? Math.round((knowCount / cards.length) * 100) : 0;

  return (
    <div className="w-full my-8 p-6 bg-gradient-to-b from-surface to-surface/80 border border-border/80 rounded-3xl shadow-xl dark:shadow-black/20">
      
      {/* CSS 3D Transforms Stylesheet Injection */}
      <style dangerouslySetInnerHTML={{__html: `
        .flashcard-perspective {
          perspective: 1500px;
        }
        .flashcard-inner {
          position: relative;
          width: 100%;
          height: 100%;
          text-align: center;
          transition: transform 0.65s cubic-bezier(0.4, 0, 0.2, 1);
          transform-style: preserve-3d;
        }
        .flashcard-inner.is-flipped {
          transform: rotateY(180deg);
        }
        .flashcard-front, .flashcard-back {
          position: absolute;
          width: 100%;
          height: 100%;
          -webkit-backface-visibility: hidden;
          backface-visibility: hidden;
          display: flex;
          flex-direction: column;
          border-radius: 1.5rem;
          box-shadow: 0 10px 30px -15px rgba(0,0,0,0.1);
        }
        .flashcard-back {
          transform: rotateY(180deg);
        }
      `}} />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-border/60 pb-4 mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 text-primary rounded-2xl">
            <FaGraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-text flex items-center gap-2">
              {texts.title}
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20">
                {cards.length} {isRtl ? "بطاقات" : "cards"}
              </span>
            </h3>
            <p className="text-xs text-text-muted mt-0.5">{texts.subtitle}</p>
          </div>
        </div>
        
        {/* Actions Header */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <button 
            onClick={() => setShowKeyboardHelp(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-text-muted bg-accent/40 rounded-xl hover:bg-accent hover:text-text transition-colors"
            title="Keyboard Shortcuts"
          >
            <FaKeyboard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{texts.keyboardHelp}</span>
          </button>
          
          <button 
            onClick={handleRestart}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-primary bg-primary/10 rounded-xl hover:bg-primary hover:text-white transition-all"
          >
            <FaRedo className="w-3 h-3" />
            <span>{texts.restart}</span>
          </button>
        </div>
      </div>

      {!sessionCompleted ? (
        <div className="space-y-6">
          {/* Progress Bar Container */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-text-muted">
              <span>{texts.cardOf.replace("{current}", currentIndex + 1).replace("{total}", cards.length)}</span>
              <span>{progressPercentage}% {isRtl ? "مكتمل" : "completed"}</span>
            </div>
            <div className="w-full h-2.5 bg-accent/30 rounded-full overflow-hidden border border-border/20">
              <div 
                className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* 3D Flash Card Area */}
          <div className="flashcard-perspective relative w-full h-[320px] max-w-2xl mx-auto cursor-pointer" onClick={handleFlip}>
            <div className={`flashcard-inner ${isFlipped ? "is-flipped" : ""}`}>
              
              {/* CARD FRONT */}
              <div className="flashcard-front p-6 border-2 border-border/60 bg-surface/90 hover:border-primary/50 transition-colors duration-300 justify-between">
                
                {/* Flash Card Indicator Tag */}
                <div className="flex justify-between items-center text-xs font-semibold text-text-muted">
                  <span className="uppercase tracking-wider flex items-center gap-1">
                    <FaLightbulb className="text-yellow-500 animate-pulse" />
                    {isRtl ? "سؤال الاستذكار" : "Question Card"}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-accent/50 text-[10px]">
                    {currentIndex + 1} / {cards.length}
                  </span>
                </div>

                {/* Question Body */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-6 my-auto max-h-[220px] overflow-y-auto px-2">
                  {currentCard.image && (
                    <div className="w-24 h-24 md:w-32 md:h-32 shrink-0 rounded-2xl overflow-hidden border border-border shadow bg-white">
                      <img 
                        src={currentCard.image} 
                        alt="Question Reference" 
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                  )}
                  <h4 className="text-base md:text-lg font-bold text-text text-center leading-relaxed max-w-lg">
                    {currentCard.question}
                  </h4>
                </div>

                {/* Flip Instruction Hint */}
                <div className="text-[11px] font-medium text-text-muted text-center pt-2 border-t border-border/40 flex items-center justify-center gap-1.5">
                  <FaSync className="animate-spin text-primary/50" style={{ animationDuration: "6s" }} />
                  {texts.flipTip}
                </div>
              </div>

              {/* CARD BACK */}
              <div className="flashcard-back p-6 border-2 border-primary/30 bg-gradient-to-br from-surface to-accent/15 justify-between">
                
                {/* Back Header */}
                <div className="flex justify-between items-center text-xs font-semibold text-primary">
                  <span className="uppercase tracking-wider flex items-center gap-1">
                    <FaCheck className="text-secondary" />
                    {isRtl ? "الإجابة النموذجية" : "Model Answer"}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-primary/10 text-[10px]">
                    {currentIndex + 1} / {cards.length}
                  </span>
                </div>

                {/* Answer Body */}
                <div className="flex flex-col items-center justify-center gap-4 my-auto max-h-[220px] overflow-y-auto px-4">
                  <p className="text-sm md:text-base font-semibold text-text text-center leading-relaxed max-w-lg">
                    {currentCard.answer}
                  </p>
                </div>

                {/* Self-Assessment Buttons (Stop propagation on click to avoid flip) */}
                <div className="grid grid-cols-2 gap-4 border-t border-border/40 pt-4" onClick={(e) => e.stopPropagation()}>
                  <button 
                    onClick={handleMarkReview}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/20 hover:border-red-500 text-xs font-bold rounded-2xl transition-all duration-200 active:scale-95 shadow-sm"
                  >
                    <FaRedo className="w-3.5 h-3.5 shrink-0" />
                    <span>{texts.reviewAgain}</span>
                    <kbd className="hidden sm:inline-block px-1.5 py-0.5 bg-black/10 text-[9px] rounded font-mono ml-1">1</kbd>
                  </button>

                  <button 
                    onClick={handleMarkKnown}
                    className="flex items-center justify-center gap-2 py-2.5 px-4 bg-secondary/10 hover:bg-secondary text-secondary hover:text-white border border-secondary/20 hover:border-secondary text-xs font-bold rounded-2xl transition-all duration-200 active:scale-95 shadow-sm"
                  >
                    <FaCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>{texts.knewIt}</span>
                    <kbd className="hidden sm:inline-block px-1.5 py-0.5 bg-black/10 text-[9px] rounded font-mono ml-1">2</kbd>
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Simple controls under card */}
          <div className="flex justify-between items-center max-w-2xl mx-auto px-4">
            <button 
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className={`flex items-center gap-2 px-4 py-2 bg-accent/40 text-text rounded-xl border border-border/40 text-xs font-bold transition-all ${
                currentIndex === 0 ? "opacity-40 cursor-not-allowed" : "hover:bg-accent active:scale-95"
              }`}
            >
              <FaArrowLeft className={isRtl ? "rotate-180" : ""} />
              <span>{texts.prev}</span>
            </button>

            <span className="text-xs font-semibold text-text-muted">
              {isRtl ? "مفتاح المسافة للقلب" : "Press Space to Flip"}
            </span>

            <button 
              onClick={handleNext}
              className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/20 hover:border-primary rounded-xl text-xs font-bold transition-all active:scale-95"
            >
              <span>{texts.next}</span>
              <FaArrowRight className={isRtl ? "rotate-180" : ""} />
            </button>
          </div>
        </div>
      ) : (
        /* Animated completion screen */
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-10 px-4 text-center max-w-md mx-auto"
        >
          <div className="w-20 h-20 bg-secondary/10 text-secondary rounded-full flex items-center justify-center mb-6 shadow-inner animate-bounce">
            <FaCheck className="w-10 h-10" />
          </div>

          <h4 className="text-2xl font-bold text-text mb-2">
            {texts.completedTitle}
          </h4>
          <p className="text-sm text-text-muted mb-8 leading-relaxed">
            {texts.completedDesc}
          </p>

          {/* Results Summary Box */}
          <div className="w-full bg-accent/25 border border-border/50 rounded-2xl p-5 mb-8 text-left space-y-4">
            <h5 className="text-sm font-bold text-text border-b border-border/40 pb-2 flex items-center gap-2">
              <FaLightbulb className="text-yellow-500" />
              {texts.statsTitle}
            </h5>

            <div className="grid grid-cols-2 gap-4 text-sm font-medium">
              <div className="space-y-1">
                <span className="text-xs text-text-muted">{texts.statsKnew}</span>
                <div className="text-lg font-bold text-secondary flex items-center gap-1.5">
                  <FaCheck /> {knowCount} / {cards.length}
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-text-muted">{texts.statsReview}</span>
                <div className="text-lg font-bold text-red-500 flex items-center gap-1.5">
                  <FaRedo /> {reviewCount} / {cards.length}
                </div>
              </div>
            </div>

            {/* Completion Gauge */}
            <div className="pt-2">
              <div className="flex justify-between text-xs font-semibold text-text-muted mb-1">
                <span>{texts.statsProgress}</span>
                <span className="text-secondary">{masteryRate}%</span>
              </div>
              <div className="w-full h-2 bg-accent/40 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-secondary rounded-full transition-all duration-1000"
                  style={{ width: `${masteryRate}%` }}
                />
              </div>
            </div>
          </div>

          <button 
            onClick={handleRestart}
            className="w-full py-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary hover:to-secondary text-white font-bold rounded-2xl shadow-lg hover:shadow-primary/30 transition-all duration-300 active:scale-[0.98]"
          >
            {texts.restart}
          </button>
        </motion.div>
      )}

      {/* Keyboard Shortcuts Modal */}
      <AnimatePresence>
        {showKeyboardHelp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm bg-surface border border-border rounded-3xl p-6 shadow-2xl relative"
            >
              <button 
                onClick={() => setShowKeyboardHelp(false)}
                className="absolute top-4 right-4 p-1.5 text-text-muted hover:bg-accent rounded-lg transition-colors"
              >
                <FaTimes />
              </button>

              <h4 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
                <FaKeyboard className="text-primary" />
                {texts.keyboardHelp}
              </h4>

              <div className="space-y-3.5 text-xs text-text-secondary font-medium">
                <div className="flex items-center justify-between py-2 border-b border-border/40">
                  <span>{texts.keyboardSpace}</span>
                  <kbd className="px-2 py-1 bg-accent border border-border/80 rounded font-mono shadow-sm">Space</kbd>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/40">
                  <span>{texts.keyboardArrows}</span>
                  <kbd className="px-2 py-1 bg-accent border border-border/80 rounded font-mono shadow-sm">← / →</kbd>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/40">
                  <span>{texts.keyboardReview}</span>
                  <div className="flex gap-1">
                    <kbd className="px-1.5 py-0.5 bg-accent border border-border/80 rounded font-mono shadow-sm">1</kbd>
                    <kbd className="px-1.5 py-0.5 bg-accent border border-border/80 rounded font-mono shadow-sm">R</kbd>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span>{texts.keyboardKnew}</span>
                  <div className="flex gap-1">
                    <kbd className="px-1.5 py-0.5 bg-accent border border-border/80 rounded font-mono shadow-sm">2</kbd>
                    <kbd className="px-1.5 py-0.5 bg-accent border border-border/80 rounded font-mono shadow-sm">K</kbd>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
