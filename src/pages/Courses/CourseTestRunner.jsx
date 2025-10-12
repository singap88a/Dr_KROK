import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useApi } from "../../context/ApiContext";
import { FaArrowLeft } from "react-icons/fa";

export default function CourseTestRunner() {
  const { id, scope, testId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { getVideoCourseById, completeLessonProgress, addStudentTest } = useApi();

  const passedState = location.state || {};
  const [test, setTest] = useState(passedState.test || null);
  const [lessonId, setLessonId] = useState(passedState.lessonId || null);

  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [time, setTime] = useState(0);
  const [results, setResults] = useState(null);
  const [dragItem, setDragItem] = useState(null);
  const [loading, setLoading] = useState(!test);
  const [error, setError] = useState("");

  // Load course and discover test if not provided
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      if (test) return;
      try {
        setLoading(true);
        const data = await getVideoCourseById(id, true);
        if (!mounted) return;
        if (scope === 'final') {
          const found = (data.final_tests || []).find((t) => String(t.id) === String(testId));
          setTest(found || null);
        } else {
          // find inside lessons
          let foundLessonId = null;
          let foundTest = null;
          for (const l of data.lessons || []) {
            const arr = l.lesson_end_tests || [];
            const hit = arr.find((t) => String(t.id) === String(testId));
            if (hit) { foundLessonId = l.id; foundTest = hit; break; }
          }
          setLessonId(foundLessonId);
          setTest(foundTest);
        }
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || 'Failed to load test');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [id, scope, testId, test, getVideoCourseById]);

  // timer
  useEffect(() => {
    if (results) return;
    const timer = setInterval(() => setTime((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, [results]);

  const currentQuestion = useMemo(() => (test?.quizzes || [])[idx], [test, idx]);

  const formatTime = (s) => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  const finish = async () => {
    const quizzes = test?.quizzes || [];
    const total = quizzes.reduce((acc, q) => acc + parseInt(q.question_score || 1), 0);
    let earned = 0;
    const questions = [];
    for (const q of quizzes) {
      let isCorrect = false;
      let studentAnswer = '';
      if (q.type === 'match') {
        let correct = 0;
        for (let n = 1; n <= 4; n++) {
          if (answers[`${q.id}_${n}`] && answers[`${q.id}_${n}`] === q[`match_${n}`]) correct++;
        }
        isCorrect = correct === 4;
        studentAnswer = Object.keys(answers).filter(k => k.startsWith(`${q.id}_`)).map(k => answers[k]).join(', ');
      } else {
        studentAnswer = answers[q.id] || '';
        isCorrect = answers[q.id] === q.correct_answer;
      }
      if (isCorrect) earned += parseInt(q.question_score || 1);
      questions.push({
        question_id: q.id,
        student_answer: studentAnswer,
        correct_answer: q.correct_answer || '',
        is_correct: isCorrect
      });
    }
    const percentage = total > 0 ? (earned / total) * 100 : 0;
    const resultsData = { total_score: total, student_score: earned, total_questions: quizzes.length, questions };

    // Submit to API for lesson tests
    if (scope === 'lesson') {
      try {
        await addStudentTest({
          test_id: test.id,
          student_score: earned,
          total_score: total,
          result_status: 1, // Assuming 1 for completed
          total_questions: quizzes.length,
          questions
        });
      } catch (error) {
        console.error('Failed to submit test results:', error);
        // Continue anyway
      }
    }

    setResults({ total, earned, percentage, questions });

    // If final test, navigate to results page
    if (scope === 'final') {
      setTimeout(() => {
        navigate(`/courses/${id}/final-results`, {
          replace: true,
          state: { results: { total, earned, percentage, answers }, test }
        });
      }, 1000); // Brief delay to show results
    } else if (scope === 'lesson') {
      // Navigate to lesson test results page
      setTimeout(() => {
        navigate(`/courses/${id}/lesson-results`, {
          replace: true,
          state: { results: resultsData, test, lessonId }
        });
      }, 1000);
    }
  };

  const markDoneAndBack = async () => {
    if (scope === 'lesson' && lessonId) {
      try {
        await completeLessonProgress(id, lessonId, 'quiz');
      } catch (e) {
        console.warn('Failed to complete lesson progress:', e);
      }
    }
    navigate(`/courses/${id}/lessons`, { replace: true, state: { lessonCompleted: true, lessonId } });
  };

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
        <div className="text-red-600">{t('common.error','Error')}: {error || t('courses.testNotFound','Test not found')}</div>
        <button onClick={() => navigate(-1)} className="px-4 py-2 text-white rounded bg-primary">{t('common.back','Back')}</button>
      </section>
    );
  }

  return (
    <section className="min-h-screen px-4 py-8 bg-background text-text">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-primary hover:text-secondary">
            <FaArrowLeft /> {t('common.back','Back')}
          </button>
        </div>

        <div className="overflow-hidden border shadow rounded-2xl bg-surface border-border">
          <div className="p-6 text-white bg-primary">
            <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
              <h1 className="text-2xl font-bold">{test.name || t('courses.test','Test')}</h1>
              <div className="flex items-center gap-3 text-sm">
                <span>{t('courses.question','Question')} {idx + 1} {t('courses.of','of')} {test.quizzes?.length || 0}</span>
                <span className="px-2 py-1 rounded bg-white/20">{formatTime(time)}</span>
              </div>
            </div>
            <div className="w-full h-2 mt-4 rounded-full bg-white/30">
              <div className="h-2 bg-white rounded-full" style={{ width: `${((idx + 1) / (test.quizzes?.length || 1)) * 100}%` }} />
            </div>
          </div>

          <div className="p-6">
            <div className="p-4 mb-4 border rounded bg-accent border-border" dangerouslySetInnerHTML={{ __html: currentQuestion?.title || '' }} />

            {/* Body */}
            {currentQuestion?.type === 'match' ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  {['answer_1','answer_2','answer_3','answer_4'].map((key) => {
                    const text = currentQuestion[key];
                    const img = currentQuestion[`${key}_image`];
                    if (!text && !img) return null;
                    return (
                      <div key={key} draggable onDragStart={() => setDragItem(key)} className="p-3 border-2 border-dashed rounded cursor-grab bg-surface border-border hover:border-primary">
                        {text && <div className="text-text">{text}</div>}
                        {img && <img src={img} alt="answer" className="mt-2 rounded max-h-32" />}
                      </div>
                    );
                  })}
                </div>
                <div className="space-y-3">
                  {[1,2,3,4].map((n) => {
                    const targetKey = `target_${n}`;
                    const current = answers[`${currentQuestion.id}_${n}`];
                    return (
                      <div key={targetKey} onDragOver={(e) => e.preventDefault()} onDrop={() => { if (dragItem) { setAnswers(s => ({ ...s, [`${currentQuestion.id}_${n}`]: dragItem })); setDragItem(null); } }} className={`p-3 border-2 rounded min-h-[64px] flex items-center justify-between ${current ? 'border-secondary bg-secondary/10' : 'border-dashed border-border bg-surface'}`}>
                        <span className="text-sm text-text-muted">{currentQuestion[targetKey] || t('courses.dropHere','Drop here')}</span>
                        {current && <span className="px-2 py-1 text-xs text-white rounded bg-secondary">{current.replace('answer_','A')}</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {['answer_1','answer_2','answer_3','answer_4'].map((key) => {
                  const text = currentQuestion[key];
                  const img = currentQuestion[`${key}_image`];
                  if (!text && !img) return null;
                  const selected = answers[currentQuestion.id] === key;
                  return (
                    <button key={key} onClick={() => setAnswers(s => ({ ...s, [currentQuestion.id]: key }))} className={`w-full text-left p-3 border rounded ${selected ? 'border-primary bg-primary/10' : 'border-border hover:border-primary'}`}>
                      {text && <div className="text-text">{text}</div>}
                      {img && <img src={img} alt="answer" className="mt-2 rounded max-h-40" />}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="flex items-center justify-between mt-8">
              <button disabled={idx === 0} onClick={() => setIdx((v) => Math.max(0, v - 1))} className={`px-4 py-2 rounded border ${idx === 0 ? 'opacity-50 cursor-not-allowed' : 'border-border hover:border-primary'}`}>{t('courses.prev','Previous')}</button>
              {idx === (test.quizzes?.length || 1) - 1 ? (
                <button onClick={finish} className="px-4 py-2 text-white rounded bg-primary hover:bg-secondary">{t('courses.finishTest','Finish Test')}</button>
              ) : (
                <button onClick={() => setIdx((v) => v + 1)} className="px-4 py-2 text-white rounded bg-primary hover:bg-secondary">{t('courses.next','Next')}</button>
              )}
            </div>

            {results && (
              <div className="p-4 mt-6 border rounded bg-accent border-border">
                <div className="mb-1 text-text">{t('courses.score','Score')}: {Math.round(results.percentage)}%</div>
                <div className="flex gap-2 mt-3">
                  {scope === 'lesson' && (
                    <button onClick={markDoneAndBack} className="px-4 py-2 text-white rounded bg-secondary hover:opacity-90">{t('courses.markLessonDone','Mark lesson as done')}</button>
                  )}
                  <button onClick={() => navigate(-1)} className="px-4 py-2 border rounded border-border hover:border-primary">{t('common.close','Close')}</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}


