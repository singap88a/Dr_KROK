import React from "react";

export default function MultipleChoiceQuestion({ currentQuestion, answers, setAnswers }) {
  if (!currentQuestion) return null;

  const answerKeys = (() => {
    const keys = [];
    let i = 1;
    while (currentQuestion[`answer_${i}`] || currentQuestion[`answer_${i}_image`]) {
      keys.push(`answer_${i}`);
      i++;
    }
    return keys;
  })();

  return (
    <div className="space-y-4">
      {answerKeys.map((key) => {
        const text = currentQuestion[key];
        const img = currentQuestion[`${key}_image`];
        if (!text && !img) return null;
        const selected = answers[currentQuestion.id] === key;
        
        return (
          <div
            key={key}
            className={`p-5 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
              selected
                ? "border-primary bg-blue-50 dark:bg-blue-900/20 shadow-md transform scale-105"
                : "border-border hover:border-primary hover:bg-accent hover:shadow-sm"
            }`}
            onClick={() =>
              setAnswers((s) => ({ ...s, [currentQuestion.id]: key }))
            }
          >
            <div className="flex items-start">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 mt-1 flex-shrink-0 ${
                  selected ? "border-primary bg-primary" : "border-text-muted"
                }`}
              >
                {selected && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
              <div className="flex-1">
                {text && <div className="font-medium text-text">{text}</div>}
                {img && (
                  <img
                    src={img}
                    alt="Answer"
                    className="mx-auto mt-3 rounded-lg shadow-sm max-h-48"
                  />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
