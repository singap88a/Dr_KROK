import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaArrowLeft } from "react-icons/fa";

import PreviousTestResult from "../../components/Courses/TestRunner/PreviousTestResult";
import TestHeader from "../../components/Courses/TestRunner/TestHeader";
import TestQuestionCard from "../../components/Courses/TestRunner/TestQuestionCard";
import TestModals from "../../components/Courses/TestRunner/TestModals";
import { useConnectDnD } from "../../components/Courses/TestRunner/useConnectDnD";
import { useCourseTestEngine } from "../../components/Courses/TestRunner/useCourseTestEngine";

export default function CourseTestRunner() {
  const { id, scope, testId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const {
    test,
    loading,
    error,
    idx,
    setIdx,
    answers,
    setAnswers,
    results,
    activeQuizzes,
    previousTestResult,
    checkingPreviousTest,
    isSubmitting,
    pointsPopupData,
    setPointsPopupData,
    startNewAttempt,
    currentQuestion,
    finish,
    markDoneAndBack,
    minimumAnswersRequired,
  } = useCourseTestEngine({ id, scope, testId, location, navigate });

  // Hook for connect question touch & drag
  const {
    isMobile,
    selectedImage,
    activeDropZone,
    showImageModal,
    setShowImageModal,
    modalImage,
    dragItem,
    setDragItem,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTouchEnter,
    handleTouchLeave,
    handleDragStart,
    handleDragOver,
    handleDrop,
    removeConnection,
    openImageModal,
  } = useConnectDnD(setAnswers);

  // إذا كان يتحقق من الاختبار السابق
  if (checkingPreviousTest) {
    return (
      <section className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-t-2 border-b-2 rounded-full animate-spin border-primary" />
          <p className="text-text">{t("courses.checkingPreviousTest", "Checking previous test results...")}</p>
        </div>
      </section>
    );
  }

  // إذا كان هناك اختبار سابق، عرض النتيجة
  if (previousTestResult) {
    return (
      <PreviousTestResult
        test={test}
        previousTestResult={previousTestResult}
        navigate={navigate}
        t={t}
        location={location}
        id={id}
        scope={scope}
        onRetake={startNewAttempt}
      />
    );
  }

  if (loading) {
    return (
      <section className="min-h-[50vh] flex items-center justify-center">
        <div className="w-16 h-16 border-t-2 border-b-2 rounded-full animate-spin border-primary" />
      </section>
    );
  }

  if (error || !test) {
    return (
      <section className="min-h-[50vh] flex flex-col items-center justify-center gap-3 text-text">
        <div className="text-red-600">
          {t("common.error", "Error")}: {error || t("courses.testNotFound", "Test not found")}
        </div>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-white rounded bg-primary"
        >
          {t("common.back", "Back")}
        </button>
      </section>
    );
  }

  return (
    <section className="min-h-screen px-4 py-8 bg-background text-text">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-primary hover:text-secondary"
          >
            <FaArrowLeft /> {t("common.back", "Back")}
          </button>
        </div>

        <div className="overflow-hidden border shadow rounded-2xl bg-surface border-border">
          <TestHeader test={test} idx={idx} t={t} totalQuestions={activeQuizzes?.length} />

          <TestQuestionCard
            currentQuestion={currentQuestion}
            answers={answers}
            setAnswers={setAnswers}
            dragItem={dragItem}
            setDragItem={setDragItem}
            isMobile={isMobile}
            activeDropZone={activeDropZone}
            selectedImage={selectedImage}
            handleTouchStart={handleTouchStart}
            handleTouchMove={handleTouchMove}
            handleTouchEnd={handleTouchEnd}
            handleTouchEnter={handleTouchEnter}
            handleTouchLeave={handleTouchLeave}
            handleDragStart={handleDragStart}
            handleDragOver={handleDragOver}
            handleDrop={handleDrop}
            removeConnection={removeConnection}
            openImageModal={openImageModal}
            minimumAnswersRequired={minimumAnswersRequired}
            idx={idx}
            setIdx={setIdx}
            activeQuizzes={activeQuizzes}
            finish={finish}
            isSubmitting={isSubmitting}
            results={results}
            scope={scope}
            markDoneAndBack={markDoneAndBack}
            navigate={navigate}
            t={t}
          />
        </div>
      </div>

      <TestModals
        showImageModal={showImageModal}
        setShowImageModal={setShowImageModal}
        modalImage={modalImage}
        pointsPopupData={pointsPopupData}
        setPointsPopupData={setPointsPopupData}
        t={t}
      />
    </section>
  );
}