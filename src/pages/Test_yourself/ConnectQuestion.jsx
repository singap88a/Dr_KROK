import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import he from 'he';
import { FaHandPointer, FaArrowsAlt, FaTimes, FaExpand } from 'react-icons/fa';

const ConnectQuestion = ({ question, userAnswer, onAnswerSelect, shuffledQuestions }) => {
  const { t } = useTranslation();
  const [dragItem, setDragItem] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeDropZone, setActiveDropZone] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [modalImage, setModalImage] = useState(null);

  // اكتشاف إذا كان الجهاز موبايل
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // استخدام السؤال المعدل مسبقاً من الـ parent
  const displayQuestion = shuffledQuestions && shuffledQuestions[question.id] 
    ? shuffledQuestions[question.id] 
    : question;

  // Touch Handlers للموبايل
  const handleTouchStart = (e, questionId, answerKey) => {
    if (!isMobile) return;
    
    e.preventDefault();
    setSelectedImage({
      questionId,
      answerKey,
      image: question[`${answerKey}_image`]
    });
  };

  const handleTouchMove = (e) => {
    if (!isMobile || !selectedImage) return;
    e.preventDefault();
  };

  const handleTouchEnd = (e, questionId, textKey) => {
    if (!isMobile || !selectedImage) return;
    
    e.preventDefault();
    
    if (selectedImage.questionId === questionId) {
      onAnswerSelect(questionId, {
        ...userAnswer,
        [textKey]: selectedImage.answerKey,
      });
    }
    
    setSelectedImage(null);
    setActiveDropZone(null);
  };

  const handleTouchEnter = (questionId, textKey) => {
    if (!isMobile || !selectedImage) return;
    setActiveDropZone({ questionId, textKey });
  };

  const handleTouchLeave = () => {
    if (!isMobile || !selectedImage) return;
    setActiveDropZone(null);
  };

  // Drag Handlers للديسكتوب
  const handleDragStart = (e, questionId, answerKey) => {
    if (isMobile) return;
    
    setDragItem({ questionId, answerKey });
    e.dataTransfer.setData('text/plain', `${questionId}-${answerKey}`);
  };

  const handleDragOver = (e) => {
    if (isMobile) return;
    e.preventDefault();
  };

  const handleDrop = (e, questionId, textKey) => {
    if (isMobile) return;
    
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

  // دالة لعرض الصورة في مودال
  const openImageModal = (imageSrc) => {
    setModalImage(imageSrc);
    setShowImageModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Mobile Instructions */}
      {isMobile && (
        <div className="p-4 mb-4 text-center border border-blue-200 rounded-lg bg-blue-50">
          <div className="flex items-center justify-center gap-2 mb-2">
            <FaHandPointer className="text-blue-600" />
            <span className="font-medium text-blue-800">
              {t('testYourself.test.mobileInstructions', 'Mobile Instructions')}
            </span>
          </div>
          <p className="text-sm text-blue-700">
            {t('testYourself.test.tapHoldToDrag', 'Tap and hold an image, then drag it to the matching text box. Tap images to enlarge.')}
          </p>
        </div>
      )}

      <div className="max-w-6xl p-4 mx-auto border shadow-lg bg-gradient-to-br from-surface to-accent border-border rounded-2xl">
        <h3 className="mb-2 text-lg font-bold text-center text-text md:text-xl">
          {t('testYourself.test.connectInstruction', 'Match each image with its correct text by dragging.')}
        </h3>
        
        {question.title && (
          <div
            className="p-3 mb-4 text-base font-semibold text-center border text-text bg-surface rounded-xl border-border md:p-4 md:mb-6 md:text-lg"
            dangerouslySetInnerHTML={{ __html: he.decode(question.title.replace(/<[^>]*>/g, '')) }}
          />
        )}
        
        <div className="mb-4 text-xs text-center text-text-secondary md:text-sm">
          {t('testYourself.test.minimumPairs', 'Minimum pairs to connect:')} {Math.min(2, displayQuestion.totalPairs || 0)}
        </div>

        {/* Mobile Layout - Vertical Stack */}
        {isMobile ? (
          <div className="space-y-6">
            {/* Images Section */}
            <div className="space-y-3">
              <h4 className="pb-2 text-base font-semibold border-b text-primary border-primary/40">
                {t('testYourself.test.images', 'Images')}
              </h4>

              {displayQuestion.shuffledImages ? (
                <div className="grid grid-cols-2 gap-3">
                  {displayQuestion.shuffledImages.map(({ key, image }) => {
                    const isUsed = userAnswer && Object.values(userAnswer).includes(key);

                    return (
                      <div
                        key={key}
                        className={`relative bg-white dark:bg-gray-900 border-2 rounded-lg shadow-sm transition-all duration-200 active:scale-95
                          ${
                            isUsed
                              ? 'border-gray-300 bg-gray-100 opacity-60'
                              : selectedImage?.answerKey === key
                              ? 'border-primary bg-primary/10 ring-2 ring-primary'
                              : 'border-dashed border-border active:bg-accent'
                          }`}
                        onTouchStart={(e) => !isUsed && handleTouchStart(e, question.id, key)}
                        onTouchMove={handleTouchMove}
                      >
                        <div className="w-full h-20 overflow-hidden rounded-lg">
                          <img
                            src={image}
                            alt="Draggable image"
                            className="object-cover w-full h-full rounded-lg"
                            onClick={() => !isUsed && openImageModal(image)}
                          />
                        </div>
                        {!isUsed && (
                          <div className="absolute bottom-1 right-1">
                            <FaArrowsAlt className="w-3 h-3 text-text-muted" />
                          </div>
                        )}
                        {!isUsed && (
                          <div className="p-1 text-[10px] text-center text-text-muted bg-accent/50">
                            {t('testYourself.test.tapAndDrag', 'Tap & drag')}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-text-muted">No images available</p>
              )}
            </div>

            {/* Texts Section */}
            <div className="space-y-3">
              <h4 className="pb-2 text-base font-semibold border-b text-primary border-primary/40">
                {t('testYourself.test.texts', 'Texts')}
              </h4>

              {displayQuestion.shuffledTexts ? (
                displayQuestion.shuffledTexts.map(({ key, text }) => {
                  const isDropped = userAnswer && userAnswer[key];
                  const isActiveDropZone = 
                    activeDropZone?.questionId === question.id && 
                    activeDropZone?.textKey === key;
                  
                  return (
                    <div
                      key={key}
                      className={`relative bg-white dark:bg-gray-900 border-2 rounded-lg shadow-sm transition-all duration-200
                        ${
                          isActiveDropZone 
                            ? 'ring-2 ring-primary scale-105 bg-primary/10 border-primary' 
                            : isDropped
                            ? 'border-green-400 bg-green-50 dark:bg-green-900/30'
                            : 'border-dashed border-border'
                        }`}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={(e) => handleTouchEnd(e, question.id, key)}
                      onTouchEnter={() => handleTouchEnter(question.id, key)}
                      onTouchLeave={handleTouchLeave}
                    >
                      {/* Text Content */}
                      <div className="flex flex-col items-center justify-center p-3 text-center min-h-[60px]">
                        <p className="text-text text-[14px] leading-snug font-bold">{text}</p>
                      </div>

                      {/* Drop Zone */}
                      <div className={`p-2 border-t rounded-b-lg transition-all duration-300 flex items-center justify-center min-h-[50px]
                        ${
                          isDropped
                            ? 'border-green-400 bg-green-50 dark:bg-green-900/30'
                            : isActiveDropZone
                            ? 'border-primary bg-primary/20 border-dashed'
                            : 'border-dashed border-border bg-surface'
                        }`}
                      >
                        {isDropped ? (
                          <div className="relative flex items-center justify-center w-full h-full">
                            <img
                              src={question[`${userAnswer[key]}_image`]}
                              alt="Dropped image"
                              className="object-cover w-full h-12 transition-transform duration-300 rounded-md"
                              onClick={() => openImageModal(question[`${userAnswer[key]}_image`])}
                            />
                            <button
                              className="absolute flex items-center justify-center w-5 h-5 text-[10px] text-white transition-colors bg-red-500 rounded-full shadow-lg -top-1 -right-1 hover:bg-red-600"
                              onClick={() => removeConnection(key)}
                            >
                              ×
                            </button>
                            <div className="absolute top-1 left-1">
                              <FaExpand className="w-3 h-3 text-white drop-shadow-md" />
                            </div>
                          </div>
                        ) : (
                          <div className="text-center text-text-muted">
                            <FaHandPointer className="w-4 h-4 mx-auto mb-1 opacity-40" />
                            <p className="text-[10px] font-medium">
                              {t('testYourself.test.dropHereMobile', 'Drop image here')}
                            </p>
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
          </div>
        ) : (
          /* Desktop Layout - Horizontal Grid */
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
        )}
        
        {/* Progress Indicator */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-accent text-text">
            <span className="text-sm font-medium">
              {t('testYourself.test.connectedPairs', 'Connected pairs:')} {Object.keys(userAnswer || {}).length} / {displayQuestion.totalPairs || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Image Modal for Mobile */}
      {showImageModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-lg mx-4">
            <button
              className="absolute top-0 right-0 z-10 p-3 text-white translate-x-2 -translate-y-2 bg-red-500 rounded-full hover:bg-red-600"
              onClick={() => setShowImageModal(false)}
            >
              <FaTimes />
            </button>
            <img
              src={modalImage}
              alt="Enlarged view"
              className="rounded-lg max-h-[80vh] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectQuestion;