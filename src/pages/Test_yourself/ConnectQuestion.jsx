import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import he from 'he';

const ConnectQuestion = ({ question, userAnswer, onAnswerSelect, shuffledQuestions }) => {
  const { t } = useTranslation();
  const [dragItem, setDragItem] = useState(null);

  // استخدام السؤال المعدل مسبقاً من الـ parent
  const displayQuestion = shuffledQuestions && shuffledQuestions[question.id] 
    ? shuffledQuestions[question.id] 
    : question;

  const handleDragStart = (e, questionId, answerKey) => {
    setDragItem({ questionId, answerKey });
    e.dataTransfer.setData('text/plain', `${questionId}-${answerKey}`);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, questionId, textKey) => {
    e.preventDefault();
    if (dragItem && dragItem.questionId === questionId) {
      onAnswerSelect(questionId, {
        ...userAnswer,
        [textKey]: dragItem.answerKey
      });
    }
    setDragItem(null);
  };

  // دالة لإزالة التوصيل
  const removeConnection = (textKey) => {
    const newAnswers = { ...userAnswer };
    delete newAnswers[textKey];
    onAnswerSelect(question.id, Object.keys(newAnswers).length > 0 ? newAnswers : undefined);
  };

  return (
    <div className="space-y-6">
      <div className="max-w-6xl p-6 mx-auto border shadow-lg bg-gradient-to-br from-surface to-accent border-border rounded-2xl">
        <h3 className="mb-2 text-xl font-bold text-center text-text">
          {t('testYourself.test.connectInstruction', 'Match each image with its correct text by dragging.')}
        </h3>
        
        {question.title && (
          <div
            className="p-4 mb-6 text-lg font-semibold text-center border text-text bg-surface rounded-xl border-border"
            dangerouslySetInnerHTML={{ __html: he.decode(question.title.replace(/<[^>]*>/g, '')) }}
          />
        )}
        
        <div className="mb-4 text-sm text-center text-text-secondary">
          {t('testYourself.test.minimumPairs', 'Minimum pairs to connect:')} {Math.min(2, displayQuestion.totalPairs || 0)}
        </div>

        <div className="grid items-start justify-center grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left Column — Text Cards */}
          <div className="space-y-4">
            <h4 className="pb-2 text-lg font-semibold border-b text-primary border-primary/40">
              {t('testYourself.test.texts', 'Texts')}
            </h4>

            {displayQuestion.shuffledTexts ? (
              displayQuestion.shuffledTexts.map(({ key, text }) => {
                const isDropped = userAnswer && userAnswer[key];
                
                return (
                  <div
                    key={key}
                    className="relative flex flex-col justify-between w-full max-w-[280px] mx-auto bg-white dark:bg-gray-900 border-2 border-border rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                  >
                    <div className="flex flex-col items-center justify-center p-4 text-center min-h-[80px]">
                      <p className="text-text text-[16px] leading-snug font-bold">{text}</p>
                    </div>

                    <div
                      className={`p-3 border-t rounded-b-xl transition-all duration-300 flex items-center justify-center min-h-[70px]
                        ${
                          isDropped
                            ? 'border-green-400 bg-green-50 dark:bg-green-900/30 shadow-inner'
                            : 'border-dashed border-border bg-surface hover:border-primary hover:bg-accent'
                        }`}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, question.id, key)}
                    >
                      {isDropped ? (
                        <div className="relative flex items-center justify-center w-full h-full group">
                          <img
                            src={question[`${userAnswer[key]}_image`]}
                            alt="Dropped image"
                            className="object-cover w-full h-24 transition-transform duration-300 rounded-lg cursor-pointer group-hover:scale-105"
                            onClick={() => removeConnection(key)}
                          />
                          <button
                            className="absolute flex items-center justify-center w-6 h-6 text-xs text-white transition-colors bg-red-500 rounded-full shadow-lg -top-2 -right-2 hover:bg-red-600"
                            onClick={() => removeConnection(key)}
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div className="text-center text-text-muted">
                          <svg
                            className="w-6 h-6 mx-auto mb-2 opacity-40"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          <p className="text-[12px] font-medium">{t('testYourself.test.dropHere', 'Drop image here')}</p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-text-muted">No texts available</p>
            )}
          </div>

          {/* Right Column — Image Cards */}
          <div className="space-y-4">
            <h4 className="pb-2 text-lg font-semibold border-b text-primary border-primary/40">
              {t('testYourself.test.images', 'Images')}
            </h4>

            {displayQuestion.shuffledImages ? (
              displayQuestion.shuffledImages.map(({ key, image }) => {
                const isUsed = userAnswer && Object.values(userAnswer).includes(key);

                return (
                  <div
                    key={key}
                    draggable={!isUsed}
                    onDragStart={(e) => handleDragStart(e, question.id, key)}
                    className={`w-full max-w-[280px] mx-auto bg-white dark:bg-gray-900 border-2 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg hover:scale-[1.02]
                      ${
                        isUsed
                          ? 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-60'
                          : 'border-dashed border-border cursor-grab hover:border-primary active:cursor-grabbing'
                      }`}
                  >
                    <div className="w-full h-[120px] rounded-lg overflow-hidden">
                      <img
                        src={image}
                        alt="Draggable image"
                        className="object-cover w-full h-full rounded-lg"
                      />
                    </div>
                    {!isUsed && (
                      <div className="p-2 text-xs text-center rounded-b-lg text-text-muted bg-accent">
                        {t('testYourself.test.dragMe', 'Drag me')}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-center text-text-muted">No images available</p>
            )}
          </div>
        </div>
        
        {/* Progress Indicator */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-accent text-text">
            <span className="text-sm font-medium">
              {t('testYourself.test.connectedPairs', 'Connected pairs:')} {Object.keys(userAnswer || {}).length} / {displayQuestion.totalPairs || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectQuestion;