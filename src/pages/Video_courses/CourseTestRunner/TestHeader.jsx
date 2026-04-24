import React from "react";

export default function TestHeader({ test, idx, t }) {
  const total = test?.quizzes?.length || 1;
  const progress = ((idx + 1) / total) * 100;

  return (
    <div className="p-6 text-white bg-primary">
      <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
        <h1 className="text-2xl font-bold">
          {test?.name || t("courses.test", "Test")}
        </h1>
        <div className="flex items-center gap-3 text-sm">
          <span>
            {t("courses.question", "Question")} {idx + 1}{" "}
            {t("courses.of", "of")} {total}
          </span>
        </div>
      </div>
      <div className="w-full h-2 mt-4 rounded-full bg-white/30">
        <div
          className="h-2 bg-white rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
