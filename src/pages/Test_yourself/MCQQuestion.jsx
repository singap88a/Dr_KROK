import React, { useMemo } from 'react';

const MCQQuestion = ({ question, userAnswer, onAnswerSelect, shuffledAnswers }) => {
  // استخدام الإجابات المخلوطة الممررة من الكومبوننت الأب، أو استخراجها ديناميكياً
  const answersToDisplay = useMemo(() => {
    if (shuffledAnswers) return shuffledAnswers;
    
    const dynamicAnswers = [];
    let i = 1;
    while (question[`answer_${i}`] || question[`answer_${i}_image`]) {
      dynamicAnswers.push(`answer_${i}`);
      i++;
    }
    return dynamicAnswers;
  }, [shuffledAnswers, question]);

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: question.title }} />
      
      <div className="space-y-4">
        {answersToDisplay.map((answerKey) => {
          const answerText = question[answerKey];
          const answerImage = question[`${answerKey}_image`];
          
          if (!answerText && !answerImage) return null;
          
          return (
            <div 
              key={answerKey}
              className={`p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                userAnswer === answerKey 
                  ? 'border-primary bg-blue-50 dark:bg-blue-900/20 shadow-md transform scale-105' 
                  : 'border-border hover:border-primary hover:bg-accent hover:shadow-sm'
              }`}
              onClick={() => onAnswerSelect(question.id, answerKey)}
            >
              <div className="flex items-start">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 mt-1 flex-shrink-0 ${
                  userAnswer === answerKey ? 'border-primary bg-primary' : 'border-text-muted'
                }`}>
                  {userAnswer === answerKey && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1">
                  {answerText && <div className="font-medium text-text">{answerText}</div>}
                  {answerImage && (
                    <img 
                      src={answerImage} 
                      alt="Answer" 
                      className="mx-auto mt-3 rounded-lg shadow-sm w-full object-contain"
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default MCQQuestion;