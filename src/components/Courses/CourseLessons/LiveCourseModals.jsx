import React from "react";
import PurchaseModal from "../ContentModals/PurchaseModal";
import ImagePopup from "../ContentModals/ImagePopup";
import PDFPopup from "../ContentModals/PDFPopup";
import VideoPopup from "../ContentModals/VideoPopup";
import { QuizModal } from "../QuizSystem/QuizModal";
import { ResultsModal } from "../QuizSystem/ResultsModal";

export default function LiveCourseModals({
  showPurchaseModal,
  closePurchaseModal,
  courseId,
  showImagePopup,
  selectedImage,
  setShowImagePopup,
  showFilesPopup,
  selectedFile,
  setShowFilesPopup,
  showVideoPopup,
  selectedVideo,
  setShowVideoPopup,
  quizModal,
  setQuizModal,
  resultsModal,
  setResultsModal,
  onQuizSubmit,
}) {
  return (
    <>
      <PurchaseModal
        show={showPurchaseModal}
        onClose={closePurchaseModal}
        courseId={courseId}
        isLive={true}
      />

      <ImagePopup
        show={showImagePopup}
        image={selectedImage}
        onClose={() => setShowImagePopup(false)}
      />

      <PDFPopup
        show={showFilesPopup}
        file={selectedFile}
        onClose={() => setShowFilesPopup(false)}
      />

      <VideoPopup
        show={showVideoPopup}
        video={selectedVideo}
        onClose={() => setShowVideoPopup(false)}
      />

      {quizModal?.isOpen && (
        <QuizModal
          isOpen={quizModal.isOpen}
          onClose={() => setQuizModal((prev) => ({ ...prev, isOpen: false }))}
          quiz={quizModal.currentQuiz}
          test={quizModal.currentTest}
          questionIndex={quizModal.currentQuestionIndex}
          onSubmit={onQuizSubmit}
        />
      )}

      {resultsModal?.isOpen && (
        <ResultsModal
          isOpen={resultsModal.isOpen}
          onClose={() => setResultsModal((prev) => ({ ...prev, isOpen: false }))}
          test={resultsModal.test}
          totalQuestions={resultsModal.totalQuestions}
          correctAnswers={resultsModal.correctAnswers}
          score={resultsModal.score}
        />
      )}
    </>
  );
}
