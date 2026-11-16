import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useApi } from "../../../context/ApiContext";
import {
  FaArrowLeft,
  FaArrowRight,
  FaCheck,
  FaTimes,
  FaClock,
  FaTrophy,
  FaRedo,
  FaExpand,
  FaCompress,
  FaSearchPlus,
  FaSearchMinus,
  FaLock,
  FaGamepad,
  FaImage,
  FaExchangeAlt,
  FaLayerGroup,
  FaVolumeUp,
  FaVolumeMute,
  FaPlay,
  FaChevronLeft,
  FaChevronRight,
  FaStar,
} from "react-icons/fa";

// ─── Confetti Canvas Overlay (>= 70%) ─────────────────────────────────────────
function ConfettiCelebration() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const colors = [
      "#22c55e",
      "#3b82f6",
      "#f59e0b",
      "#ec4899",
      "#8b5cf6",
      "#06b6d4",
      "#ef4444",
    ];

    const particles = Array.from({ length: 130 }, (_, i) => {
      const fromLeft = i % 2 === 0;
      return {
        x: fromLeft ? Math.random() * (canvas.width * 0.35) : canvas.width - Math.random() * (canvas.width * 0.35),
        y: -20 - Math.random() * 180,
        vx: (Math.random() - 0.5) * 6,
        vy: 2.5 + Math.random() * 4.5,
        size: 6 + Math.random() * 7,
        color: colors[i % colors.length],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10,
        shape: i % 3 === 0 ? "circle" : "rect",
        opacity: 1,
      };
    });

    const start = performance.now();

    const tick = (now) => {
      const elapsed = now - start;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let alive = false;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06;
        p.rotation += p.rotSpeed;

        if (elapsed > 3500) {
          p.opacity = Math.max(0, p.opacity - 0.015);
        }

        if (p.y < canvas.height + 40 && p.opacity > 0.01) {
          alive = true;
          ctx.save();
          ctx.globalAlpha = p.opacity;
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          if (p.shape === "circle") {
            ctx.beginPath();
            ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.65);
          }
          ctx.restore();
        }
      }

      if (alive && elapsed < 6000) {
        animId = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    animId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[120] pointer-events-none"
    />
  );
}

// ─── Image Zoom Lightbox Modal ────────────────────────────────────────────────
function ImageLightboxModal({ imageUrl, alt, onClose, t }) {
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-[130] bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Controls bar */}
      <div
        className="flex items-center gap-2 mb-4 px-4 py-2 rounded-2xl bg-slate-900/90 border border-white/15 text-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(1, Number((z - 0.5).toFixed(1))))}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          title={t("homework.recreational.zoomOut", "Zoom Out")}
        >
          <FaSearchMinus />
        </button>
        <span className="text-xs font-bold px-2 min-w-[48px] text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(3, Number((z + 0.5).toFixed(1))))}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          title={t("homework.recreational.zoomIn", "Zoom In")}
        >
          <FaSearchPlus />
        </button>
        <button
          type="button"
          onClick={() => setZoom(1)}
          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        >
          1:1
        </button>
        <div className="w-px h-5 bg-white/20 mx-1" />
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-300 transition-colors"
          title={t("common.close", "Close")}
        >
          <FaTimes />
        </button>
      </div>

      {/* Scrollable zoom image viewport */}
      <div
        className="max-w-5xl max-h-[82vh] overflow-auto rounded-2xl border border-white/15 bg-white p-2 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt={alt || "Question visual"}
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "center center",
            transition: "transform 0.2s ease",
          }}
          className="max-h-[75vh] w-auto object-contain mx-auto select-none"
        />
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatTimer = (seconds) => {
  const s = Math.max(0, Math.floor(seconds || 0));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${rem < 10 ? "0" : ""}${rem}`;
};

const formatScore = (num) => {
  const n = Number(num || 0);
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
};

const isMcqOptionCorrect = (question, option) => {
  if (!option) return false;
  if (option.is_correct === true) return true;
  if (
    question?.correct_answer !== undefined &&
    question?.correct_answer !== null
  ) {
    return String(option.id) === String(question.correct_answer);
  }
  return false;
};

const playFeedbackTone = (isGood, soundEnabled) => {
  if (!soundEnabled) return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = isGood ? "sine" : "triangle";
    osc.frequency.setValueAtTime(isGood ? 587.33 : 220, ctx.currentTime);
    if (isGood) {
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
    }
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
    osc.start();
    osc.stop(ctx.currentTime + 0.23);
  } catch {
    // Ignore audio context errors on restricted browsers
  }
};

// ─── Main RecreationalQuizRunner Component ────────────────────────────────────
export default function RecreationalQuizRunner({
  quizSummary,
  isLiveCourse = false,
  onBack,
  onSubscribeClick,
}) {
  const { t, i18n } = useTranslation();
  const { getRecreationalQuizDetails } = useApi();
  const isRtl = i18n.dir() === "rtl";
  const lessonType = isLiveCourse ? "live" : "video";

  // Quiz fetch & lifecycle states
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [quizData, setQuizData] = useState(quizSummary || null);

  // Stages: "intro" | "countdown" | "playing" | "results"
  const [stage, setStage] = useState("intro");
  const [countdownVal, setCountdownVal] = useState(3);
  const [runId, setRunId] = useState(1);

  // Gameplay states
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isQuestionLocked, setIsQuestionLocked] = useState(false);
  const [timedOutThisQuestion, setTimedOutThisQuestion] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lightboxImage, setLightboxImage] = useState(null);

  // Question-type specific interaction states
  const [selectedMcqOptionId, setSelectedMcqOptionId] = useState(null);
  const [userMatches, setUserMatches] = useState({}); // { [desc_id]: term_id }
  const [activeTermId, setActiveTermId] = useState(null);
  const [activeDescId, setActiveDescId] = useState(null);
  const [userCategories, setUserCategories] = useState({}); // { [cat_id]: [item_ids] }
  const [activeItemId, setActiveItemId] = useState(null);

  // Recorded answers across all questions: { [questionId]: { ... } }
  const [questionResults, setQuestionResults] = useState({});

  const autoAdvanceTimeoutRef = useRef(null);

  const clearAutoAdvance = useCallback(() => {
    if (autoAdvanceTimeoutRef.current) {
      clearTimeout(autoAdvanceTimeoutRef.current);
      autoAdvanceTimeoutRef.current = null;
    }
  }, []);

  // Load quiz details from backend
  const loadQuizDetails = useCallback(
    async (startImmediately = false) => {
      if (!quizSummary?.id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setForbidden(false);
      setErrorMsg(null);
      try {
        const data = await getRecreationalQuizDetails(
          quizSummary.id,
          lessonType
        );
        const normalized = data?.quiz ? { ...data, ...data.quiz } : data;
        setQuizData(normalized || quizSummary);
        if (startImmediately) {
          setCurrentIndex(0);
          setQuestionResults({});
          setCountdownVal(3);
          setStage("countdown");
          setRunId((r) => r + 1);
        }
      } catch (err) {
        if (err?.status === 403) {
          setForbidden(true);
          setErrorMsg(
            err?.data?.message ||
              err?.message ||
              t(
                "homework.recreational.subscriptionRequiredDesc",
                "You need to subscribe to this course first to access recreational quizzes."
              )
          );
        } else if (
          Array.isArray(quizSummary?.questions) &&
          quizSummary.questions.length > 0
        ) {
          setQuizData(quizSummary);
        } else {
          setErrorMsg(
            err?.message ||
              t(
                "homework.recreational.loadError",
                "Failed to load recreational quiz questions."
              )
          );
        }
      } finally {
        setLoading(false);
      }
    },
    [quizSummary, lessonType, getRecreationalQuizDetails, t]
  );

  useEffect(() => {
    loadQuizDetails(false);
    return () => clearAutoAdvance();
  }, [loadQuizDetails, clearAutoAdvance]);

  const questions = useMemo(() => {
    const raw =
      quizData?.questions ||
      quizData?.items ||
      quizSummary?.questions ||
      [];
    return Array.isArray(raw) ? raw : [];
  }, [quizData, quizSummary]);

  const quizTotalScore = useMemo(() => {
    if (quizData?.total_score != null && Number(quizData.total_score) > 0) {
      return Number(quizData.total_score);
    }
    return questions.reduce((sum, q) => sum + Number(q.score || 1), 0);
  }, [quizData, questions]);

  const questionTypesSummary = useMemo(() => {
    const types = new Set(questions.map((q) => q.type).filter(Boolean));
    return Array.from(types);
  }, [questions]);

  const currentQuestion = questions[currentIndex] || null;
  const currentTimeLimit = Number(currentQuestion?.time_limit_seconds || 30);

  // Reset per-question interactive state when moving to a question
  useEffect(() => {
    if (stage !== "playing" || !currentQuestion) return;
    clearAutoAdvance();
    setTimeLeft(Number(currentQuestion.time_limit_seconds || 30));
    setIsQuestionLocked(false);
    setTimedOutThisQuestion(false);
    setSelectedMcqOptionId(null);
    setUserMatches({});
    setActiveTermId(null);
    setActiveDescId(null);
    setUserCategories({});
    setActiveItemId(null);
  }, [stage, currentIndex, runId, currentQuestion, clearAutoAdvance]);

  // Countdown screen animation: 3 -> 2 -> 1 -> play
  useEffect(() => {
    if (stage !== "countdown") return;
    if (countdownVal <= 0) {
      setStage("playing");
      return;
    }
    const timer = setTimeout(() => {
      setCountdownVal((c) => c - 1);
    }, 650);
    return () => clearTimeout(timer);
  }, [stage, countdownVal]);

  // Advance to next question or final results
  const handleNextQuestion = useCallback(() => {
    clearAutoAdvance();
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFullscreen(false);
      setStage("results");
    }
  }, [clearAutoAdvance, currentIndex, questions.length]);

  // Evaluate and lock the current question
  const lockAndGradeQuestion = useCallback(
    (overrides = {}) => {
      if (!currentQuestion || isQuestionLocked) return;

      const {
        timedOut = false,
        mcqChoiceId = selectedMcqOptionId,
        matchesState = userMatches,
        categoriesState = userCategories,
      } = overrides;

      const maxScore = Number(currentQuestion.score || 1);
      let earnedScore = 0;
      let status = "wrong"; // "correct" | "partial" | "wrong"
      let details = {};

      if (currentQuestion.type === "mcq_image_question") {
        const options = currentQuestion.options || [];
        const chosenOpt = options.find(
          (o) => String(o.id) === String(mcqChoiceId)
        );
        const correct = chosenOpt
          ? isMcqOptionCorrect(currentQuestion, chosenOpt)
          : false;
        earnedScore = correct ? maxScore : 0;
        status = correct ? "correct" : "wrong";
        details = {
          selectedOptionId: mcqChoiceId,
          chosenText: chosenOpt?.text || null,
          correctOptionText:
            options.find((o) => isMcqOptionCorrect(currentQuestion, o))?.text ||
            "",
        };
      } else if (currentQuestion.type === "matching") {
        const descriptions = currentQuestion.matching_data?.descriptions || [];
        const terms = currentQuestion.matching_data?.terms || [];
        const solutionMap = currentQuestion.matching_data?.solution_map || {};

        let correctPairs = 0;
        descriptions.forEach((desc) => {
          const expectedTermId = solutionMap[desc.id] ?? desc.id;
          const userTermId = matchesState[desc.id];
          if (
            userTermId !== undefined &&
            userTermId !== null &&
            String(userTermId) === String(expectedTermId)
          ) {
            correctPairs++;
          }
        });

        const totalPairs = descriptions.length;
        earnedScore =
          totalPairs > 0
            ? Number(((correctPairs / totalPairs) * maxScore).toFixed(2))
            : 0;
        if (totalPairs > 0 && correctPairs === totalPairs) {
          status = "correct";
        } else if (correctPairs > 0) {
          status = "partial";
        } else {
          status = "wrong";
        }
        details = {
          userMatches: { ...matchesState },
          correctPairs,
          totalPairs,
          descriptions,
          terms,
          solutionMap,
        };
      } else if (currentQuestion.type === "categorization") {
        const categories =
          currentQuestion.categorization_data?.categories || [];
        const itemsPool =
          currentQuestion.categorization_data?.items_pool || [];
        const solutionMap =
          currentQuestion.categorization_data?.solution_map || {};

        let correctItems = 0;
        itemsPool.forEach((item) => {
          const expectedCatId =
            solutionMap[item.id] ?? item.correct_category_id;
          const placedInExpected = (categoriesState[expectedCatId] || []).some(
            (id) => String(id) === String(item.id)
          );
          if (placedInExpected) {
            correctItems++;
          }
        });

        const totalItems = itemsPool.length;
        earnedScore =
          totalItems > 0
            ? Number(((correctItems / totalItems) * maxScore).toFixed(2))
            : 0;
        if (totalItems > 0 && correctItems === totalItems) {
          status = "correct";
        } else if (correctItems > 0) {
          status = "partial";
        } else {
          status = "wrong";
        }
        details = {
          userCategories: { ...categoriesState },
          correctItems,
          totalItems,
          categories,
          itemsPool,
          solutionMap,
        };
      }

      setIsQuestionLocked(true);
      setTimedOutThisQuestion(timedOut);
      playFeedbackTone(status === "correct" || status === "partial", soundEnabled);

      setQuestionResults((prev) => ({
        ...prev,
        [currentQuestion.id || currentIndex]: {
          question: currentQuestion,
          earnedScore,
          maxScore,
          status,
          timedOut,
          details,
        },
      }));

      if (timedOut) {
        autoAdvanceTimeoutRef.current = setTimeout(() => {
          handleNextQuestion();
        }, 1800);
      }
    },
    [
      currentQuestion,
      currentIndex,
      isQuestionLocked,
      selectedMcqOptionId,
      userMatches,
      userCategories,
      soundEnabled,
      handleNextQuestion,
    ]
  );

  // Per-second countdown timer during gameplay
  useEffect(() => {
    if (stage !== "playing" || isQuestionLocked || !currentQuestion) return;

    if (timeLeft <= 0) {
      lockAndGradeQuestion({ timedOut: true });
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [stage, isQuestionLocked, currentQuestion, timeLeft, lockAndGradeQuestion]);

  // ─── Interaction Handlers ─────────────────────────────────────────────────
  const handleSelectMcq = (optionId) => {
    if (isQuestionLocked) return;
    setSelectedMcqOptionId(optionId);
    lockAndGradeQuestion({ mcqChoiceId: optionId });
  };

  // Matching: pair term_id with desc_id
  const assignMatch = (descId, termId) => {
    if (isQuestionLocked || !descId || !termId) return;
    setUserMatches((prev) => {
      const next = { ...prev };
      // Ensure one term is only placed in one description at a time
      Object.keys(next).forEach((k) => {
        if (String(next[k]) === String(termId)) {
          delete next[k];
        }
      });
      next[descId] = termId;
      return next;
    });
    setActiveTermId(null);
    setActiveDescId(null);
  };

  const removeMatch = (descId) => {
    if (isQuestionLocked) return;
    setUserMatches((prev) => {
      const next = { ...prev };
      delete next[descId];
      return next;
    });
  };

  const handleTermClick = (termId) => {
    if (isQuestionLocked) return;
    if (activeDescId) {
      assignMatch(activeDescId, termId);
    } else {
      setActiveTermId((prev) => (String(prev) === String(termId) ? null : termId));
    }
  };

  const handleDescSlotClick = (descId) => {
    if (isQuestionLocked) return;
    if (activeTermId) {
      assignMatch(descId, activeTermId);
    } else {
      setActiveDescId((prev) => (String(prev) === String(descId) ? null : descId));
    }
  };

  // Categorization: assign item_id into category_id
  const assignItemToCategory = (categoryId, itemId) => {
    if (isQuestionLocked || !categoryId || !itemId) return;
    setUserCategories((prev) => {
      const next = {};
      Object.keys(prev).forEach((catKey) => {
        next[catKey] = (prev[catKey] || []).filter(
          (id) => String(id) !== String(itemId)
        );
      });
      next[categoryId] = [...(next[categoryId] || []), itemId];
      return next;
    });
    setActiveItemId(null);
  };

  const removeItemFromCategory = (categoryId, itemId) => {
    if (isQuestionLocked) return;
    setUserCategories((prev) => ({
      ...prev,
      [categoryId]: (prev[categoryId] || []).filter(
        (id) => String(id) !== String(itemId)
      ),
    }));
  };

  const handleCategoryClick = (categoryId) => {
    if (isQuestionLocked) return;
    if (activeItemId) {
      assignItemToCategory(categoryId, activeItemId);
    }
  };

  // Start / Retry
  const handleStartQuiz = () => {
    setCurrentIndex(0);
    setQuestionResults({});
    setCountdownVal(3);
    setStage("countdown");
    setRunId((r) => r + 1);
  };

  const handleRetry = () => {
    clearAutoAdvance();
    loadQuizDetails(true);
  };

  // Final aggregated metrics
  const resultsArray = useMemo(() => {
    return questions.map(
      (q, i) =>
        questionResults[q.id || i] || {
          question: q,
          earnedScore: 0,
          maxScore: Number(q.score || 1),
          status: "wrong",
          timedOut: false,
          details: {},
        }
    );
  }, [questions, questionResults]);

  const totalEarnedScore = useMemo(
    () =>
      Number(
        resultsArray.reduce((sum, r) => sum + Number(r.earnedScore || 0), 0).toFixed(2)
      ),
    [resultsArray]
  );

  const percentage = useMemo(() => {
    if (!quizTotalScore) return 0;
    return Math.min(100, Math.round((totalEarnedScore / quizTotalScore) * 100));
  }, [totalEarnedScore, quizTotalScore]);

  // ─── Loading State ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="p-8 rounded-3xl border border-border bg-surface text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin mx-auto" />
        <p className="text-sm font-semibold text-text-muted">
          {t("homework.recreational.loadingQuiz", "Loading recreational quiz...")}
        </p>
      </div>
    );
  }

  // ─── 403 Subscription Required State ──────────────────────────────────────
  if (forbidden) {
    return (
      <div className="p-8 rounded-2xl border border-primary/30 bg-primary/5 text-center space-y-5">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-2xl">
          <FaLock />
        </div>
        <div className="space-y-2 max-w-md mx-auto">
          <h3 className="text-xl font-bold text-text">
            {t("homework.recreational.subscriptionRequiredTitle", "Subscription Required")}
          </h3>
          <p className="text-sm text-text-muted leading-relaxed">{errorMsg}</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {onSubscribeClick && (
            <button
              type="button"
              onClick={onSubscribeClick}
              className="px-5 py-2.5 rounded-xl bg-primary text-white font-bold text-sm hover:bg-secondary transition-colors shadow-sm cursor-pointer"
            >
              {t("courses.subscribeNow", "Subscribe Now")}
            </button>
          )}
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl border border-border bg-surface text-text font-semibold text-sm hover:bg-accent transition-colors cursor-pointer"
          >
            {t("homework.backToHomework", "Back to Homework")}
          </button>
        </div>
      </div>
    );
  }

  // ─── Error or Empty State ─────────────────────────────────────────────────
  if (errorMsg || questions.length === 0) {
    return (
      <div className="p-8 rounded-2xl border border-border bg-surface text-center space-y-4">
        <p className="text-sm font-semibold text-red-500">
          {errorMsg ||
            t(
              "homework.recreational.noQuestions",
              "No questions available for this recreational quiz yet."
            )}
        </p>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary font-bold text-sm hover:bg-primary hover:text-white transition-colors cursor-pointer"
        >
          {isRtl ? <FaArrowRight /> : <FaArrowLeft />}
          {t("homework.backToHomework", "Back to Homework")}
        </button>
      </div>
    );
  }

  // ─── Stage 1: Intro & Instructions Screen ─────────────────────────────────
  if (stage === "intro") {
    const totalEstimatedSeconds = questions.reduce(
      (s, q) => s + Number(q.time_limit_seconds || 30),
      0
    );

    return (
      <Motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-sm space-y-5"
      >
        {/* Top Back Button */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-border bg-background hover:bg-accent text-xs sm:text-sm font-bold text-text transition-colors cursor-pointer"
          >
            {isRtl ? <FaArrowRight /> : <FaArrowLeft />}
            <span>{t("homework.backToHomework", "Back to Homework")}</span>
          </button>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
            <FaGamepad />
            {t("homework.recreational.badge", "Interactive Challenge")}
          </span>
        </div>

        {/* Title & Description */}
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-2xl">
            <FaGamepad />
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-text">
            {quizData?.title || quizData?.name || t("homework.recreational.title", "Recreational Quiz")}
          </h3>
          {quizData?.description && (
            <p className="text-sm text-text-muted leading-relaxed">
              {quizData.description}
            </p>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 max-w-xl mx-auto">
          <div className="p-3.5 rounded-xl bg-background border border-border text-center">
            <p className="text-xl sm:text-2xl font-black text-primary">{questions.length}</p>
            <p className="text-xs font-semibold text-text-muted mt-0.5">
              {t("homework.questionsCountLabel", "Questions")}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-background border border-border text-center">
            <p className="text-xl sm:text-2xl font-black text-secondary">
              {formatScore(quizTotalScore)}
            </p>
            <p className="text-xs font-semibold text-text-muted mt-0.5">
              {t("homework.totalPointsLabel", "Total Points")}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-background border border-border text-center">
            <p className="text-xl sm:text-2xl font-black text-text">
              {formatTimer(totalEstimatedSeconds)}
            </p>
            <p className="text-xs font-semibold text-text-muted mt-0.5">
              {t("homework.recreational.timeBudget", "Total Time")}
            </p>
          </div>
        </div>

        {/* Question Type Instructions */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {questionTypesSummary.includes("mcq_image_question") && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 text-xs font-bold">
              <FaImage /> {t("homework.recreational.typeMcqImage", "Image / ECG MCQ")}
            </span>
          )}
          {questionTypesSummary.includes("matching") && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 text-xs font-bold">
              <FaExchangeAlt /> {t("homework.recreational.typeMatching", "Term Matching")}
            </span>
          )}
          {questionTypesSummary.includes("categorization") && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 text-xs font-bold">
              <FaLayerGroup /> {t("homework.recreational.typeCategorization", "Group Sorting")}
            </span>
          )}
        </div>

        {/* Start Button */}
        <div className="text-center pt-1">
          <button
            type="button"
            onClick={handleStartQuiz}
            className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-primary hover:bg-secondary text-white font-bold text-sm sm:text-base shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <FaPlay className="text-xs" />
            <span>{t("homework.recreational.startBtn", "Start Recreational Quiz")}</span>
          </button>
        </div>
      </Motion.div>
    );
  }

  // ─── Stage 2: Countdown Screen (3 - 2 - 1 - GO!) ─────────────────────────
  if (stage === "countdown") {
    return (
      <div className="min-h-[340px] rounded-2xl bg-surface border-2 border-primary/30 text-primary flex flex-col items-center justify-center p-8 shadow-sm">
        <p className="text-sm uppercase tracking-widest text-text-muted font-bold mb-4">
          {t("homework.recreational.getReady", "Get Ready!")}
        </p>
        <AnimatePresence mode="wait">
          <Motion.div
            key={countdownVal}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1.1, opacity: 1 }}
            exit={{ scale: 1.8, opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="text-7xl sm:text-8xl font-black text-primary select-none"
          >
            {countdownVal > 0 ? countdownVal : t("homework.recreational.go", "GO!")}
          </Motion.div>
        </AnimatePresence>
      </div>
    );
  }

  // ─── Stage 4: Final Celebratory Results Summary ───────────────────────────
  if (stage === "results") {
    const showConfetti = percentage >= 70;
    const radius = 56;
    const circumference = 2 * Math.PI * radius;
    const strokeOffset = circumference - (percentage / 100) * circumference;

    const fullCorrectCount = resultsArray.filter((r) => r.status === "correct").length;
    const partialCount = resultsArray.filter((r) => r.status === "partial").length;
    const wrongCount = resultsArray.filter((r) => r.status === "wrong").length;

    return (
      <div className="space-y-6">
        {showConfetti && <ConfettiCelebration />}

        <Motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-sm space-y-6"
        >
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
            {/* Circular SVG Percentage Chart */}
            <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
              <svg className="w-36 h-36 -rotate-90" viewBox="0 0 140 140">
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="transparent"
                  className="text-border"
                />
                <Motion.circle
                  cx="70"
                  cy="70"
                  r={radius}
                  stroke={
                    percentage >= 70
                      ? "var(--secondary)"
                      : percentage >= 50
                      ? "var(--primary)"
                      : "#ef4444"
                  }
                  strokeWidth="12"
                  strokeLinecap="round"
                  fill="transparent"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: strokeOffset }}
                  transition={{ duration: 0.9, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-text">{percentage}%</span>
                <span className="text-[11px] font-bold text-text-muted uppercase">
                  {t("courses.score", "Score")}
                </span>
              </div>
            </div>

            {/* Celebration Summary Text & Stats */}
            <div className="flex-1 text-center md:text-start space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">
                <FaTrophy />
                {percentage >= 70
                  ? t("homework.recreational.greatJob", "Outstanding Performance!")
                  : t("homework.recreational.keepPracticing", "Good Effort! Try Again to Improve")}
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-text">
                {quizData?.title || quizData?.name}
              </h3>
              <p className="text-base font-bold text-text-muted">
                {t("homework.recreational.earnedPoints", "You scored")}{" "}
                <span className="text-primary font-black text-xl">
                  {formatScore(totalEarnedScore)}
                </span>{" "}
                / {formatScore(quizTotalScore)}{" "}
                {t("essay.pts", "pts")}
              </p>

              <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-1">
                <span className="px-3 py-1 rounded-xl bg-secondary/10 text-secondary text-xs font-bold border border-secondary/30">
                  ✓ {fullCorrectCount} {t("courses.correct", "Correct")}
                </span>
                {partialCount > 0 && (
                  <span className="px-3 py-1 rounded-xl bg-primary/10 text-primary text-xs font-bold border border-primary/30">
                    ◐ {partialCount} {t("homework.recreational.partial", "Partial")}
                  </span>
                )}
                <span className="px-3 py-1 rounded-xl bg-red-500/10 text-red-500 text-xs font-bold border border-red-500/30">
                  ✕ {wrongCount} {t("courses.incorrect", "Incorrect")}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5 w-full md:w-auto shrink-0">
              <button
                type="button"
                onClick={handleRetry}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-secondary text-white font-bold text-sm shadow-sm transition-colors cursor-pointer"
              >
                <FaRedo />
                <span>{t("homework.recreational.retryBtn", "Retry (New Shuffle)")}</span>
              </button>
              <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border bg-background hover:bg-accent text-text font-bold text-sm transition-colors cursor-pointer"
              >
                {isRtl ? <FaArrowRight /> : <FaArrowLeft />}
                <span>{t("homework.backToHomework", "Back to Homework")}</span>
              </button>
            </div>
          </div>

          {/* Detailed Question Breakdown Review */}
          <div className="border-t border-border pt-6 space-y-4">
            <h4 className="text-base font-extrabold text-text flex items-center gap-2">
              <FaStar className="text-primary" />
              {t("homework.recreational.reviewTitle", "Detailed Answer Review")}
            </h4>

            <div className="space-y-3">
              {resultsArray.map((item, idx) => {
                const q = item.question;
                const badgeClass =
                  item.status === "correct"
                    ? "bg-secondary/15 text-secondary border-secondary/30"
                    : item.status === "partial"
                    ? "bg-primary/15 text-primary border-primary/30"
                    : "bg-red-500/15 text-red-500 border-red-500/30";

                return (
                  <div
                    key={q.id || idx}
                    className="rounded-xl border border-border bg-background p-4 space-y-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <span className="w-7 h-7 rounded-lg bg-primary text-white text-xs font-black flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="font-bold text-sm text-text">{q.question_text}</p>
                          {item.timedOut && (
                            <span className="inline-block mt-1 text-[11px] font-bold text-red-500">
                              ⏱ {t("homework.recreational.timeUp", "Time expired")}
                            </span>
                          )}
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-black border shrink-0 ${badgeClass}`}
                      >
                        {formatScore(item.earnedScore)} / {formatScore(item.maxScore)}
                      </span>
                    </div>

                    {/* Type-specific compact summary */}
                    {q.type === "mcq_image_question" && (
                      <div className="text-xs space-y-1 ps-9">
                        <p className="text-text-muted">
                          {t("essay.yourAnswer", "Your Answer")}:{" "}
                          <span
                            className={`font-bold ${
                              item.status === "correct" ? "text-secondary" : "text-red-500"
                            }`}
                          >
                            {item.details?.chosenText ||
                              t("essay.noAnswer", "No answer provided")}
                          </span>
                        </p>
                        {item.status !== "correct" && (
                          <p className="text-secondary font-bold">
                            {t("courses.correct", "Correct")}: {item.details?.correctOptionText}
                          </p>
                        )}
                      </div>
                    )}

                    {q.type === "matching" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ps-9 pt-1">
                        {(item.details?.descriptions || []).map((desc) => {
                          const expectedId =
                            item.details?.solutionMap?.[desc.id] ?? desc.id;
                          const userTermId = item.details?.userMatches?.[desc.id];
                          const isRowOk =
                            userTermId && String(userTermId) === String(expectedId);
                          const userTermObj = (item.details?.terms || []).find(
                            (tr) => String(tr.id) === String(userTermId)
                          );
                          const expectedTermObj = (item.details?.terms || []).find(
                            (tr) => String(tr.id) === String(expectedId)
                          );

                          return (
                            <div
                              key={desc.id}
                              className={`p-2 rounded-xl border text-xs ${
                                isRowOk
                                  ? "border-secondary/30 bg-secondary/5"
                                  : "border-red-500/30 bg-red-500/5"
                              }`}
                            >
                              <p className="font-semibold text-text">{desc.text}</p>
                              <p className="mt-0.5 text-text-muted">
                                {isRowOk ? "✓" : "✕"}{" "}
                                <span className="font-bold">
                                  {userTermObj?.term || "—"}
                                </span>
                                {!isRowOk && expectedTermObj && (
                                  <span className="text-secondary ms-2 font-bold">
                                    → {expectedTermObj.term}
                                  </span>
                                )}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {q.type === "categorization" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 ps-9 pt-1">
                        {(item.details?.itemsPool || []).map((poolItem) => {
                          const expectedCatId =
                            item.details?.solutionMap?.[poolItem.id] ??
                            poolItem.correct_category_id;
                          const assignedCatId = Object.keys(
                            item.details?.userCategories || {}
                          ).find((cId) =>
                            (item.details?.userCategories[cId] || []).some(
                              (id) => String(id) === String(poolItem.id)
                            )
                          );
                          const isItemOk =
                            assignedCatId &&
                            String(assignedCatId) === String(expectedCatId);
                          const expectedCatTitle =
                            (item.details?.categories || []).find(
                              (c) => String(c.id) === String(expectedCatId)
                            )?.title || expectedCatId;

                          return (
                            <div
                              key={poolItem.id}
                              className={`p-2 rounded-xl border text-xs ${
                                isItemOk
                                  ? "border-secondary/30 bg-secondary/5"
                                  : "border-red-500/30 bg-red-500/5"
                              }`}
                            >
                              <p className="font-semibold text-text">
                                {isItemOk ? "✓" : "✕"} {poolItem.text}
                              </p>
                              <p className="text-secondary font-bold mt-0.5">
                                {expectedCatTitle}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </Motion.div>
      </div>
    );
  }

  // ─── Stage 3: Active Wordwall-Style Game Board ────────────────────────────
  const isDangerTime = timeLeft <= 5 && timeLeft > 0 && !isQuestionLocked;
  const timeProgressPct =
    currentTimeLimit > 0 ? Math.max(0, (timeLeft / currentTimeLimit) * 100) : 0;

  const currentRecordedResult =
    questionResults[currentQuestion?.id || currentIndex] || null;

  // Derived data for matching
  const matchingDescriptions = currentQuestion?.matching_data?.descriptions || [];
  const matchingTerms = currentQuestion?.matching_data?.terms || [];
  const matchingSolution = currentQuestion?.matching_data?.solution_map || {};
  const placedTermIds = new Set(Object.values(userMatches).map(String));
  const availableMatchingTerms = matchingTerms.filter(
    (tr) => !placedTermIds.has(String(tr.id))
  );

  // Derived data for categorization
  const catList = currentQuestion?.categorization_data?.categories || [];
  const catItemsPool = currentQuestion?.categorization_data?.items_pool || [];
  const catSolution = currentQuestion?.categorization_data?.solution_map || {};
  const assignedCatItemIds = new Set(
    Object.values(userCategories).flat().map(String)
  );
  const unassignedCatItems = catItemsPool.filter(
    (item) => !assignedCatItemIds.has(String(item.id))
  );

  const optionLetters = ["A", "B", "C", "D", "E", "F"];

  return (
    <div
      className={
        isFullscreen
          ? "fixed inset-0 z-[100] bg-background p-3 sm:p-6 overflow-y-auto flex flex-col justify-between"
          : "rounded-2xl border border-border bg-surface shadow-sm overflow-hidden flex flex-col"
      }
    >
      {/* Image Lightbox Modal */}
      {lightboxImage && (
        <ImageLightboxModal
          imageUrl={lightboxImage}
          alt={currentQuestion?.question_text}
          onClose={() => setLightboxImage(null)}
          t={t}
        />
      )}

      {/* Top Timer Progress Strip */}
      <div className="w-full h-1.5 bg-accent overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ease-linear ${
            isDangerTime
              ? "bg-red-500 animate-pulse"
              : isQuestionLocked
              ? "bg-secondary"
              : "bg-primary"
          }`}
          style={{ width: `${timeProgressPct}%` }}
        />
      </div>

      {/* Top HUD Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 pt-4 pb-2 gap-3">
        {/* Top-Left Digital Timer */}
        <div
          className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border-2 font-black text-base sm:text-lg tabular-nums transition-all ${
            isDangerTime
              ? "bg-red-500/10 border-red-500 text-red-500 animate-pulse scale-105"
              : "bg-background border-border text-text"
          }`}
        >
          <FaClock className={isDangerTime ? "text-red-500" : "text-primary"} />
          <span>{formatTimer(timeLeft)}</span>
        </div>

        {/* Center Question Score & Type */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-primary text-white text-xs font-bold">
            +{formatScore(currentQuestion?.score || 1)} {t("essay.pts", "pts")}
          </span>
          <span className="px-3 py-1 rounded-full bg-background border border-border text-text-secondary text-xs font-bold">
            {currentQuestion?.type === "mcq_image_question"
              ? t("homework.recreational.typeMcqImage", "Image / ECG MCQ")
              : currentQuestion?.type === "matching"
              ? t("homework.recreational.typeMatching", "Term Matching")
              : t("homework.recreational.typeCategorization", "Group Sorting")}
          </span>
        </div>

        {/* Top-Right Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSoundEnabled((s) => !s)}
            className="p-2 rounded-xl bg-background border border-border text-text-secondary hover:text-primary hover:border-primary transition-colors cursor-pointer"
            title={soundEnabled ? "Mute" : "Unmute"}
          >
            {soundEnabled ? <FaVolumeUp /> : <FaVolumeMute />}
          </button>
          <button
            type="button"
            onClick={() => setIsFullscreen((f) => !f)}
            className="p-2 rounded-xl bg-background border border-border text-text-secondary hover:text-primary hover:border-primary transition-colors cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <FaCompress /> : <FaExpand />}
          </button>
          <button
            type="button"
            onClick={() => {
              clearAutoAdvance();
              setIsFullscreen(false);
              onBack();
            }}
            className="p-2 rounded-xl bg-background border border-border text-text-secondary hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors cursor-pointer"
            title={t("common.close", "Close")}
          >
            <FaTimes />
          </button>
        </div>
      </div>

      {/* Main Interactive Arena */}
      <div className="flex-1 px-4 sm:px-8 py-4 sm:py-6 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <Motion.div
            key={`${runId}-${currentIndex}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -14 }}
            transition={{ duration: 0.2 }}
            className="space-y-6 max-w-6xl mx-auto w-full"
          >
            {/* Question Prompt */}
            <h2 className="text-lg sm:text-2xl font-extrabold text-text text-center leading-snug">
              {currentQuestion?.question_text}
            </h2>

            {/* ── TYPE 1: MCQ WITH IMAGE (Screenshot 3) ────────────────────── */}
            {currentQuestion?.type === "mcq_image_question" && (
              <div
                className={`grid grid-cols-1 ${
                  currentQuestion.image_url ? "lg:grid-cols-12" : ""
                } gap-6 items-center`}
              >
                {currentQuestion.image_url && (
                  <div className="lg:col-span-7">
                    <div
                      onClick={() => setLightboxImage(currentQuestion.image_url)}
                      className="group relative rounded-2xl border border-border bg-background p-2 shadow-sm cursor-zoom-in overflow-hidden"
                    >
                      <img
                        src={currentQuestion.image_url}
                        alt={currentQuestion.question_text}
                        className="w-full max-h-[380px] object-contain mx-auto rounded-xl"
                      />
                      <div className="absolute bottom-3 end-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-bold shadow-md group-hover:scale-105 transition-transform">
                        <FaSearchPlus />
                        <span>
                          {t("homework.recreational.clickToZoom", "Click to Zoom")}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div
                  className={
                    currentQuestion.image_url
                      ? "lg:col-span-5 flex flex-col gap-3"
                      : "max-w-xl mx-auto w-full flex flex-col gap-3"
                  }
                >
                  {(currentQuestion.options || []).map((opt, idx) => {
                    const isSelected =
                      selectedMcqOptionId !== null &&
                      String(selectedMcqOptionId) === String(opt.id);
                    const isCorrect = isMcqOptionCorrect(currentQuestion, opt);

                    let cardStyle =
                      "bg-background hover:bg-primary/5 border-border hover:border-primary text-text";
                    let letterStyle = "bg-primary/10 text-primary";
                    let iconBadge = null;

                    if (isQuestionLocked) {
                      if (isCorrect) {
                        cardStyle =
                          "bg-secondary/15 border-secondary text-text shadow-md scale-[1.01]";
                        letterStyle = "bg-secondary text-white";
                        iconBadge = (
                          <span className="w-8 h-8 rounded-xl bg-secondary text-white flex items-center justify-center text-sm font-black shadow-sm shrink-0">
                            <FaCheck />
                          </span>
                        );
                      } else if (isSelected && !isCorrect) {
                        cardStyle =
                          "bg-red-500/10 border-red-500 text-text shadow-sm";
                        letterStyle = "bg-red-500 text-white";
                        iconBadge = (
                          <span className="w-8 h-8 rounded-xl bg-red-500 text-white flex items-center justify-center text-sm font-black shrink-0">
                            <FaTimes />
                          </span>
                        );
                      } else {
                        cardStyle =
                          "bg-background/60 border-border text-text-muted opacity-65";
                        letterStyle = "bg-accent text-text-muted";
                      }
                    }

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        disabled={isQuestionLocked}
                        onClick={() => handleSelectMcq(opt.id)}
                        className={`w-full min-h-[68px] px-4 py-3.5 rounded-2xl border-2 flex items-center justify-between gap-3.5 shadow-sm transition-all duration-200 ${
                          !isQuestionLocked ? "cursor-pointer active:scale-[0.98]" : "cursor-default"
                        } ${cardStyle}`}
                      >
                        <span
                          className={`w-9 h-9 rounded-xl font-black text-base flex items-center justify-center shrink-0 transition-colors ${letterStyle}`}
                        >
                          {optionLetters[idx] || idx + 1}
                        </span>
                        <span className="flex-1 text-center font-bold text-sm sm:text-base leading-snug">
                          {opt.text}
                        </span>
                        <span className="w-8 shrink-0 flex items-center justify-end">
                          {iconBadge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── TYPE 2: MATCHING (Screenshot 2) ──────────────────────────── */}
            {currentQuestion?.type === "matching" && (
              <div className="space-y-5">
                {/* Top Terms Bar */}
                <div className="p-3.5 rounded-2xl bg-background border border-border">
                  <p className="text-xs font-bold text-text-muted text-center mb-3">
                    {t(
                      "homework.recreational.matchingHint",
                      "Click or drag a term below, then click an empty dashed slot next to its matching description"
                    )}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2.5 min-h-[48px]">
                    {availableMatchingTerms.length > 0 ? (
                      availableMatchingTerms.map((termObj) => {
                        const isActive =
                          String(activeTermId) === String(termObj.id);
                        return (
                          <div
                            key={termObj.id}
                            draggable={!isQuestionLocked}
                            onDragStart={(e) => {
                              e.dataTransfer.setData("text/plain", String(termObj.id));
                              setActiveTermId(termObj.id);
                            }}
                            onClick={() => handleTermClick(termObj.id)}
                            className={`px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm border-2 transition-all select-none ${
                              !isQuestionLocked ? "cursor-pointer" : "opacity-60"
                            } ${
                              isActive
                                ? "bg-secondary border-secondary text-white ring-2 ring-secondary/30 scale-105"
                                : "bg-primary hover:opacity-90 border-primary text-white"
                            }`}
                          >
                            {termObj.term}
                          </div>
                        );
                      })
                    ) : (
                      <span className="text-xs font-bold text-secondary">
                        ✓ {t("homework.recreational.allTermsPlaced", "All terms placed — click Submit Answers below")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Two-Column Rows: Left Slot + Right Description */}
                <div className="space-y-2.5">
                  {matchingDescriptions.map((desc) => {
                    const placedTermId = userMatches[desc.id];
                    const placedTermObj = matchingTerms.find(
                      (tr) => String(tr.id) === String(placedTermId)
                    );
                    const expectedTermId = matchingSolution[desc.id] ?? desc.id;
                    const expectedTermObj = matchingTerms.find(
                      (tr) => String(tr.id) === String(expectedTermId)
                    );
                    const isRowCorrect =
                      isQuestionLocked &&
                      placedTermId !== undefined &&
                      String(placedTermId) === String(expectedTermId);
                    const isActiveRow =
                      String(activeDescId) === String(desc.id);

                    return (
                      <div
                        key={desc.id}
                        onDragOver={(e) => {
                          if (!isQuestionLocked) e.preventDefault();
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          const draggedId = e.dataTransfer.getData("text/plain");
                          if (draggedId) assignMatch(desc.id, draggedId);
                        }}
                        onClick={() => handleDescSlotClick(desc.id)}
                        className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 p-2.5 rounded-xl border transition-all ${
                          isQuestionLocked
                            ? isRowCorrect
                              ? "bg-secondary/10 border-secondary/40"
                              : "bg-red-500/10 border-red-500/40"
                            : isActiveRow
                            ? "bg-primary/5 border-primary"
                            : "bg-background border-border hover:border-primary/60"
                        }`}
                      >
                        {/* Dropzone Slot */}
                        <div className="w-full sm:w-56 shrink-0">
                          {placedTermObj ? (
                            <div
                              className={`min-h-[48px] px-3.5 py-2 rounded-xl border-2 flex items-center justify-between gap-2 font-bold text-sm shadow-sm ${
                                isQuestionLocked
                                  ? isRowCorrect
                                    ? "bg-secondary border-secondary text-white"
                                    : "bg-red-500 border-red-500 text-white"
                                  : "bg-primary border-primary text-white"
                              }`}
                            >
                              <span className="truncate">{placedTermObj.term}</span>
                              {!isQuestionLocked ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeMatch(desc.id);
                                  }}
                                  className="w-6 h-6 rounded-lg bg-white/20 hover:bg-red-500 text-white flex items-center justify-center text-xs shrink-0 transition-colors cursor-pointer"
                                  title={t("homework.recreational.clearMatch", "Clear")}
                                >
                                  <FaTimes />
                                </button>
                              ) : isRowCorrect ? (
                                <FaCheck className="text-white shrink-0" />
                              ) : (
                                <FaTimes className="text-white shrink-0" />
                              )}
                            </div>
                          ) : (
                            <div
                              className={`min-h-[48px] px-3.5 rounded-xl border-2 border-dashed flex items-center justify-center text-xs font-bold transition-colors ${
                                isQuestionLocked
                                  ? "border-red-400 bg-red-500/10 text-red-500"
                                  : activeTermId
                                  ? "border-primary bg-primary/5 text-primary cursor-pointer animate-pulse"
                                  : "border-border bg-surface text-text-muted cursor-pointer"
                              }`}
                            >
                              {isQuestionLocked
                                ? t("homework.recreational.unanswered", "Unmatched")
                                : activeTermId
                                ? t("homework.recreational.tapToPlace", "Click to place here")
                                : t("courses.dropHere", "Drop here")}
                            </div>
                          )}
                        </div>

                        {/* Description Text & Correction Hint */}
                        <div className="flex-1 flex flex-col justify-center">
                          <p className="text-sm sm:text-base font-bold text-text leading-relaxed">
                            {desc.text}
                          </p>
                          {isQuestionLocked && !isRowCorrect && expectedTermObj && (
                            <div className="mt-1 inline-flex items-center gap-1.5 self-start px-2.5 py-0.5 rounded-lg bg-secondary/15 text-secondary text-xs font-bold border border-secondary/30">
                              <FaCheck className="text-[10px]" />
                              <span>{expectedTermObj.term}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── TYPE 3: CATEGORIZATION (Screenshot 1) ────────────────────── */}
            {currentQuestion?.type === "categorization" && (
              <div className="space-y-6">
                {/* Top Unassigned Items Pool Grid */}
                <div className="p-3.5 rounded-2xl bg-background border border-border">
                  <p className="text-xs font-bold text-text-muted text-center mb-3">
                    {t(
                      "homework.recreational.categorizationHint",
                      "Click or drag each card below into the matching category column"
                    )}
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 min-h-[70px]">
                    {unassignedCatItems.map((item) => {
                      const isActive =
                        String(activeItemId) === String(item.id);
                      const expectedCatId =
                        catSolution[item.id] ?? item.correct_category_id;
                      const expectedCatTitle = catList.find(
                        (c) => String(c.id) === String(expectedCatId)
                      )?.title;

                      return (
                        <div
                          key={item.id}
                          draggable={!isQuestionLocked}
                          onDragStart={(e) => {
                            e.dataTransfer.setData("text/plain", String(item.id));
                            setActiveItemId(item.id);
                          }}
                          onClick={() => {
                            if (!isQuestionLocked) {
                              setActiveItemId((prev) =>
                                String(prev) === String(item.id) ? null : item.id
                              );
                            }
                          }}
                          className={`min-h-[68px] p-2.5 rounded-xl border-2 flex flex-col items-center justify-center text-center font-bold text-xs sm:text-sm shadow-sm transition-all select-none ${
                            isQuestionLocked
                              ? "bg-red-500 border-red-500 text-white"
                              : isActive
                              ? "bg-secondary border-secondary text-white ring-2 ring-secondary/30 scale-105 cursor-pointer"
                              : "bg-primary hover:opacity-90 border-primary text-white cursor-pointer"
                          }`}
                        >
                          <span>{item.text}</span>
                          {isQuestionLocked && expectedCatTitle && (
                            <span className="mt-1 text-[10px] px-2 py-0.5 rounded bg-white/20 text-white font-bold">
                              → {expectedCatTitle}
                            </span>
                          )}
                        </div>
                      );
                    })}
                    {unassignedCatItems.length === 0 && (
                      <div className="col-span-full flex items-center justify-center text-xs font-bold text-secondary">
                        ✓ {t("homework.recreational.allItemsCategorized", "All cards sorted — click Submit Answers below")}
                      </div>
                    )}
                  </div>
                </div>

                {/* Category Columns with 2-Column Dashed Slots */}
                <div
                  className={`grid grid-cols-1 ${
                    catList.length === 2
                      ? "md:grid-cols-2"
                      : "md:grid-cols-2 lg:grid-cols-3"
                  } gap-5`}
                >
                  {catList.map((cat) => {
                    const assignedIds = userCategories[cat.id] || [];
                    const assignedItems = assignedIds
                      .map((id) =>
                        catItemsPool.find((it) => String(it.id) === String(id))
                      )
                      .filter(Boolean);

                    const totalSlots = Math.max(
                      4,
                      assignedItems.length +
                        (isQuestionLocked
                          ? 0
                          : assignedItems.length % 2 === 0
                          ? 2
                          : 1)
                    );
                    const emptySlotsCount = Math.max(
                      0,
                      totalSlots - assignedItems.length
                    );

                    return (
                      <div
                        key={cat.id}
                        onDragOver={(e) => {
                          if (!isQuestionLocked) e.preventDefault();
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          const draggedItemId =
                            e.dataTransfer.getData("text/plain");
                          if (draggedItemId) {
                            assignItemToCategory(cat.id, draggedItemId);
                          }
                        }}
                        onClick={() => handleCategoryClick(cat.id)}
                        className={`p-4 rounded-2xl border-2 transition-all ${
                          activeItemId && !isQuestionLocked
                            ? "border-primary bg-primary/5 cursor-pointer"
                            : "border-border bg-background"
                        }`}
                      >
                        <h3 className="text-base sm:text-lg font-extrabold text-text text-center mb-3.5">
                          {cat.title}
                        </h3>

                        <div className="grid grid-cols-2 gap-2.5">
                          {assignedItems.map((item) => {
                            const expectedCatId =
                              catSolution[item.id] ?? item.correct_category_id;
                            const isItemOk =
                              String(expectedCatId) === String(cat.id);
                            const expectedCatTitle = catList.find(
                              (c) => String(c.id) === String(expectedCatId)
                            )?.title;

                            return (
                              <div
                                key={item.id}
                                onClick={(e) => e.stopPropagation()}
                                className={`relative min-h-[70px] p-2.5 rounded-xl border-2 flex flex-col items-center justify-center text-center text-xs sm:text-sm font-bold shadow-sm ${
                                  isQuestionLocked
                                    ? isItemOk
                                      ? "bg-secondary border-secondary text-white"
                                      : "bg-red-500 border-red-500 text-white"
                                    : "bg-primary border-primary text-white"
                                }`}
                              >
                                {!isQuestionLocked && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeItemFromCategory(cat.id, item.id)
                                    }
                                    className="absolute -top-2 -end-2 w-5 h-5 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center text-[10px] shadow cursor-pointer"
                                    title={t("homework.recreational.clearMatch", "Remove")}
                                  >
                                    <FaTimes />
                                  </button>
                                )}
                                <span>{item.text}</span>
                                {isQuestionLocked && (
                                  <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-extrabold">
                                    {isItemOk ? (
                                      <span className="text-white">✓</span>
                                    ) : (
                                      <span className="text-white/95">
                                        ✕ → {expectedCatTitle}
                                      </span>
                                    )}
                                  </span>
                                )}
                              </div>
                            );
                          })}

                          {Array.from({ length: emptySlotsCount }).map((_, si) => (
                            <div
                              key={`empty-${cat.id}-${si}`}
                              className={`min-h-[70px] rounded-xl border-2 border-dashed flex items-center justify-center text-xs font-bold transition-colors ${
                                activeItemId && !isQuestionLocked
                                  ? "border-primary bg-primary/5 text-primary"
                                  : "border-border bg-surface text-text-muted"
                              }`}
                            >
                              {activeItemId && !isQuestionLocked ? "+" : ""}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Controls & Validation Footer */}
      <div className="px-4 sm:px-6 py-3.5 bg-background border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Question Counter (Screenshot 3 style: < 2 of 20 >) */}
        <div className="flex items-center gap-2 text-sm font-bold text-text-secondary">
          <span className="text-text-muted">
            {isRtl ? <FaChevronRight /> : <FaChevronLeft />}
          </span>
          <span>
            {currentIndex + 1} {t("testYourself.test.of", "of")} {questions.length}
          </span>
          <span className="text-text-muted">
            {isRtl ? <FaChevronLeft /> : <FaChevronRight />}
          </span>
        </div>

        {/* Center Action / Feedback */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          {!isQuestionLocked &&
            (currentQuestion?.type === "matching" ||
              currentQuestion?.type === "categorization") && (
              <button
                type="button"
                onClick={() => lockAndGradeQuestion({ timedOut: false })}
                className="px-6 py-2.5 rounded-xl bg-primary hover:bg-secondary text-white font-bold text-sm shadow-sm transition-all cursor-pointer active:scale-95"
              >
                {t("homework.recreational.submitAnswers", "Submit Answers")}
              </button>
            )}

          {isQuestionLocked && currentRecordedResult && (
            <div className="flex flex-wrap items-center justify-center gap-3">
              <span
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold border ${
                  currentRecordedResult.status === "correct"
                    ? "bg-secondary/15 text-secondary border-secondary/30"
                    : currentRecordedResult.status === "partial"
                    ? "bg-primary/15 text-primary border-primary/30"
                    : "bg-red-500/15 text-red-500 border-red-500/30"
                }`}
              >
                {timedOutThisQuestion
                  ? `${t("homework.recreational.timeUp", "Time expired")} — `
                  : ""}
                +{formatScore(currentRecordedResult.earnedScore)} /{" "}
                {formatScore(currentRecordedResult.maxScore)}{" "}
                {t("essay.pts", "pts")}
              </span>

              <button
                type="button"
                onClick={handleNextQuestion}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-secondary text-white font-bold text-sm shadow-sm transition-colors cursor-pointer"
              >
                <span>
                  {currentIndex + 1 < questions.length
                    ? t("homework.recreational.nextQuestion", "Next Question")
                    : t("homework.recreational.viewResults", "View Results")}
                </span>
                {isRtl ? <FaArrowLeft /> : <FaArrowRight />}
              </button>
            </div>
          )}
        </div>

        {/* Running Score Pill */}
        <div className="text-xs font-bold px-3 py-1.5 rounded-xl bg-surface text-text-secondary border border-border">
          {t("courses.score", "Score")}:{" "}
          <span className="text-primary">{formatScore(totalEarnedScore)}</span> /{" "}
          {formatScore(quizTotalScore)}
        </div>
      </div>
    </div>
  );
}
