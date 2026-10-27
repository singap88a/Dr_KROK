import React from "react";
import { FaHandPointer, FaArrowsAlt } from "react-icons/fa";

export default function ConnectQuestion({
  currentQuestion,
  answers,
  setAnswers,
  isMobile,
  t,
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
  minimumAnswersRequired
}) {
  return (
    <div className="space-y-6">
      {/* Mobile Instructions */}
      {isMobile && (
        <div className="p-4 mb-4 text-center border border-yellow-200 rounded-lg bg-yellow-50">
          <div className="flex items-center justify-center gap-2 mb-2">
            <FaHandPointer className="text-yellow-600" />
            <span className="font-medium text-yellow-800">
              {t("testYourself.test.mobileInstructions", "Mobile Instructions")}
            </span>
          </div>
          <p className="text-sm text-yellow-700">
            {t("testYourself.test.tapHoldToDrag", "Tap and hold an image, then drag it to the matching text box.")}
          </p>
        </div>
      )}

      <div className="max-w-5xl p-4 mx-auto border shadow-md bg-gradient-to-br from-surface to-accent border-border rounded-2xl">
        <h3 className="mb-4 text-lg font-bold text-center text-text">
          {t("testYourself.test.connectInstruction", "Match each image with its correct text by dragging.")}
        </h3>

        {/* Layout: Texts (Left) + Images (Right) */}
        <div className="grid items-start justify-center grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Left Column — Text Cards */}
          <div className="space-y-3">
            <h4 className="pb-1 text-sm font-semibold border-b text-primary border-primary/40">
              {t("testYourself.test.texts", "Texts")}
            </h4>

            {currentQuestion.shuffledTexts ? (
              currentQuestion.shuffledTexts.map(({ key, text }) => {
                const isDropped = answers[currentQuestion.id] && answers[currentQuestion.id][key];
                const isActiveDropZone = activeDropZone?.questionId === currentQuestion.id && activeDropZone?.textKey === key;
                
                return (
                  <div
                    key={key}
                    className={`relative flex flex-col justify-between w-full max-w-[220px] mx-auto bg-white dark:bg-gray-900 border rounded-lg shadow-sm transition-all duration-300 ${
                      isActiveDropZone 
                        ? 'ring-2 ring-primary scale-105 bg-primary/10' 
                        : 'hover:shadow-md hover:scale-[1.01] border-border'
                    }`}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={(e) => handleTouchEnd(e, currentQuestion.id, key)}
                    onTouchEnter={() => handleTouchEnter(currentQuestion.id, key)}
                    onTouchLeave={handleTouchLeave}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, currentQuestion.id, key)}
                  >
                    {/* Text Content */}
                    <div className="flex flex-col items-center justify-center p-3 text-center">
                      <p className="text-text text-[15px] leading-snug font-bold">
                        {text}
                      </p>
                    </div>

                    {/* Drop Zone */}
                    <div
                      className={`p-2 border-t rounded-b-lg transition-all duration-300 flex items-center justify-center min-h-[60px]
                      ${
                        isDropped
                          ? "border-green-400 bg-green-50 dark:bg-green-900/30 shadow-inner"
                          : isActiveDropZone
                          ? "border-primary bg-primary/20 border-dashed"
                          : "border-dashed border-border bg-surface hover:border-primary hover:bg-accent"
                      }`}
                    >
                      {isDropped ? (
                        <div className="relative flex items-center justify-center w-full h-full group">
                          <img
                            src={currentQuestion[`${isDropped}_image`]}
                            alt="Dropped image"
                            className="object-cover w-full h-20 transition-transform duration-300 rounded-md cursor-pointer group-hover:scale-105"
                            onClick={() => isMobile && openImageModal(currentQuestion[`${isDropped}_image`])}
                          />
                          <button
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center shadow-md hover:bg-red-600"
                            onClick={() => removeConnection(currentQuestion.id, key)}
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div className="text-center text-text-muted">
                          {isMobile ? (
                            <>
                              <FaHandPointer className="w-4 h-4 mx-auto mb-1 opacity-40" />
                              <p className="text-[11px] font-medium">
                                {t("testYourself.test.dropHereMobile", "Drop image here")}
                              </p>
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4 mx-auto mb-1 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                              </svg>
                              <p className="text-[11px] font-medium">
                                {t("testYourself.test.dropHere", "Drop image here")}
                              </p>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-text-muted">{t("testYourself.noTexts", "No texts available")}</p>
            )}
          </div>

          {/* Right Column — Image Cards */}
          <div className="space-y-3">
            <h4 className="pb-1 text-sm font-semibold border-b text-primary border-primary/40">
              {t("testYourself.test.images", "Images")}
            </h4>

            {currentQuestion.shuffledImages ? (
              currentQuestion.shuffledImages.map(({ key, image }) => {
                const isUsed = answers[currentQuestion.id] && Object.values(answers[currentQuestion.id]).includes(key);

                return (
                  <div
                    key={key}
                    draggable={!isMobile && !isUsed}
                    onDragStart={(e) => !isMobile && handleDragStart(e, currentQuestion.id, key)}
                    onTouchStart={(e) => isMobile && !isUsed && handleTouchStart(e, currentQuestion.id, key)}
                    onTouchMove={handleTouchMove}
                    className={`w-full max-w-[220px] mx-auto bg-white dark:bg-gray-900 border rounded-lg shadow-sm transition-all duration-300 ${
                      isUsed
                        ? "border-gray-300 bg-gray-100 cursor-not-allowed opacity-50"
                        : isMobile
                        ? "border-dashed border-primary cursor-pointer active:scale-95 active:shadow-inner active:bg-accent"
                        : "border-dashed border-border cursor-grab hover:border-primary hover:shadow-md active:cursor-grabbing"
                    } ${selectedImage?.answerKey === key ? 'ring-2 ring-primary scale-105' : ''}`}
                  >
                    <div className="w-full h-[100px] rounded-lg overflow-hidden">
                      <img
                        src={image}
                        alt="Draggable image"
                        className="object-cover w-full h-full rounded-lg"
                        onClick={() => isMobile && openImageModal(image)}
                      />
                    </div>
                    {isMobile && !isUsed && (
                      <div className="p-1 text-xs text-center text-text-muted">
                        <FaArrowsAlt className="inline w-3 h-3 mr-1" />
                        {t("testYourself.test.tapAndDrag", "Tap & drag")}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-center text-text-muted">{t("testYourself.noImages", "No images available")}</p>
            )}
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-accent text-text">
            <span className="text-sm font-medium">
              {t('testYourself.test.connectedPairs', 'Connected pairs:')} {Object.keys(answers[currentQuestion.id] || {}).length} / {currentQuestion.totalPairs || 0}
            </span>
          </div>
          <div className="mt-2 text-xs text-text-muted">
            {t('testYourself.test.minimumPairs', 'Minimum pairs to connect:')} {minimumAnswersRequired}
          </div>
        </div>
      </div>
    </div>
  );
}
