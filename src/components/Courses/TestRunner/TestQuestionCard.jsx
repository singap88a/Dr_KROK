import React from "react";
import MatchQuestion from "./MatchQuestion";
import ConnectQuestion from "./ConnectQuestion";
import MultipleChoiceQuestion from "./MultipleChoiceQuestion";

export default function TestQuestionCard({
  currentQuestion,
  answers,
  setAnswers,
  dragItem,
  setDragItem,
  isMobile,
  activeDropZone,
  selectedImage,
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
  minimumAnswersRequired,
  idx,
  setIdx,
  activeQuizzes,
  finish,
  isSubmitting,
  results,
  scope,
  markDoneAndBack,
  navigate,
  t,
}) {
  return (
    <div className="p-6">
      <div
        className="p-4 mb-4 border rounded bg-accent border-border"
        dangerouslySetInnerHTML={{ __html: currentQuestion?.title || "" }}
      />

      {/* Body */}
      {currentQuestion?.type === "match" ? (
        <MatchQuestion
          currentQuestion={currentQuestion}
          answers={answers}
          setAnswers={setAnswers}
          dragItem={dragItem}
          setDragItem={setDragItem}
          t={t}
        />
      ) : currentQuestion?.type === "connect" ? (
        <ConnectQuestion
          currentQuestion={currentQuestion}
          answers={answers}
          setAnswers={setAnswers}
          isMobile={isMobile}
          t={t}
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
        />
      ) : (
        <MultipleChoiceQuestion
          currentQuestion={currentQuestion}
          answers={answers}
          setAnswers={setAnswers}
        />
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-8">
        <button
          disabled={idx === 0}
          onClick={() => setIdx((v) => Math.max(0, v - 1))}
          className={`px-4 py-2 rounded border ${
            idx === 0
              ? "opacity-50 cursor-not-allowed"
              : "border-border hover:border-primary"
          }`}
        >
          {t("courses.prev", "Previous")}
        </button>
        {idx === (activeQuizzes?.length || 1) - 1 ? (
          <button
            onClick={finish}
            disabled={
              isSubmitting ||
              (currentQuestion?.type === "connect" &&
                Object.keys(answers[currentQuestion.id] || {}).length <
                  minimumAnswersRequired)
            }
            className={`px-4 py-2 text-white rounded ${
              isSubmitting ||
              (currentQuestion?.type === "connect" &&
                Object.keys(answers[currentQuestion.id] || {}).length <
                  minimumAnswersRequired)
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-primary hover:bg-secondary"
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{t("common.loading", "Loading...")}</span>
              </div>
            ) : (
              t("courses.finishTest", "Finish Test")
            )}
          </button>
        ) : (
          <button
            onClick={() => setIdx((v) => v + 1)}
            disabled={
              currentQuestion?.type === "connect" &&
              Object.keys(answers[currentQuestion.id] || {}).length <
                minimumAnswersRequired
            }
            className={`px-4 py-2 text-white rounded ${
              currentQuestion?.type === "connect" &&
              Object.keys(answers[currentQuestion.id] || {}).length <
                minimumAnswersRequired
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-primary hover:bg-secondary"
            }`}
          >
            {t("courses.next", "Next")}
          </button>
        )}
      </div>

      {results && (
        <div className="p-4 mt-6 border rounded bg-accent border-border">
          <div className="mb-1 text-text">
            {t("courses.score", "Score")}: {Math.round(results.percentage)}%
          </div>
          <div className="flex gap-2 mt-3">
            {(scope === "lesson" || scope === "section") && (
              <button
                onClick={markDoneAndBack}
                className="px-4 py-2 text-white rounded bg-secondary hover:opacity-90"
              >
                {scope === "lesson"
                  ? t("courses.markLessonDone", "Mark lesson as done")
                  : t("courses.markSectionDone", "Mark section as done")}
              </button>
            )}
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 border rounded border-border hover:border-primary"
            >
              {t("common.close", "Close")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
