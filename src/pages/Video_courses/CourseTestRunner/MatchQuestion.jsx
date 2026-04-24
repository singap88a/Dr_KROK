import React from "react";

export default function MatchQuestion({ currentQuestion, answers, setAnswers, dragItem, setDragItem }) {
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
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* Left Column: Choices */}
      <div className="space-y-3">
        {answerKeys.map((key, index) => {
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
                  {selected && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
                <div className="flex-1">
                  <div className="mb-1 font-semibold text-primary">{index + 1}.</div>
                  {text && <div className="font-medium text-text">{text}</div>}
                  {img && (
                    <img
                      src={img}
                      alt={`Answer ${index + 1}`}
                      className="mx-auto mt-3 rounded-lg shadow-sm max-h-48"
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Right Column: Drop Targets */}
      <div className="space-y-3">
        {[0, 1, 2, 3].map((n) => {
          const targetKey = `target_${n}`;
          const current = answers[`${currentQuestion.id}_${n}`];
          return (
            <div
              key={targetKey}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => {
                if (dragItem) {
                  setAnswers((s) => ({
                    ...s,
                    [`${currentQuestion.id}_${n}`]: dragItem,
                  }));
                  setDragItem(null);
                }
              }}
              className={`p-3 border-2 rounded min-h-[64px] flex items-center justify-between ${
                current
                  ? "border-secondary bg-secondary/10"
                  : "border-dashed border-border bg-surface"
              }`}
            >
              <span className="text-sm text-text-muted">
                {currentQuestion[targetKey] || "Drop here"}
              </span>
              {current && (
                <span className="px-2 py-1 text-xs text-white rounded bg-secondary">
                  {current.replace("answer_", "A")}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
