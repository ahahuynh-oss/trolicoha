import React, { useState, useEffect } from "react";
import { Question, Subject } from "../types";
import { MathRenderer } from "./MathRenderer";
import { speechService } from "../services/speechService";

interface QuestionCardProps {
  subject: Subject;
  questions: Question[];
  onFinishQuiz: (score: number, total: number, correct: number, timeSpent: number, mistakes: Array<{ question: string; chosen: string; correct: string; topic: string }>) => void;
  onExitQuiz: () => void;
  onAskSocratic: (questionContent: string) => void;
  fontSize?: "normal" | "large" | "xlarge";
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  subject,
  questions,
  onFinishQuiz,
  onExitQuiz,
  onAskSocratic,
  fontSize = "large"
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [secondsLeft, setSecondsLeft] = useState(15 * 60); // 15 mins test
  const [isPaused, setIsPaused] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isReadingQuestion, setIsReadingQuestion] = useState(false);

  const getTextSizeClass = () => {
    if (fontSize === "xlarge") return "text-lg sm:text-xl";
    if (fontSize === "large") return "text-base sm:text-lg";
    return "text-sm sm:text-base";
  };

  const handleReadQuestionAloud = () => {
    if (isReadingQuestion) {
      speechService.stopSpeaking();
      setIsReadingQuestion(false);
      return;
    }
    const currentQ = questions[currentIndex] || questions[0];
    const plainText = `Câu hỏi số ${currentIndex + 1}. ` + currentQ.content.replace(/[\$\\]/g, "");
    setIsReadingQuestion(true);
    speechService.speak(
      plainText,
      0.85,
      undefined,
      () => setIsReadingQuestion(false),
      () => setIsReadingQuestion(false)
    );
  };

  // Timer
  useEffect(() => {
    let interval: any = null;
    if (!isPaused && !isSubmitted && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
        setTimeSpent((prev) => prev + 1);
      }, 1000);
    } else if (secondsLeft === 0 && !isSubmitted) {
      handleAutoSubmit();
    }
    return () => clearInterval(interval);
  }, [isPaused, isSubmitted, secondsLeft]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSelect = (optionIndex: number) => {
    if (isSubmitted) return;
    speechService.playChime("click");
    setSelectedAnswers((prev) => ({ ...prev, [currentIndex]: optionIndex }));
  };

  const handleAutoSubmit = () => {
    setIsSubmitted(true);
    let correctCount = 0;
    const mistakes: Array<{ question: string; chosen: string; correct: string; topic: string }> = [];

    questions.forEach((q, idx) => {
      const chosen = selectedAnswers[idx];
      if (chosen === q.correctAnswer) {
        correctCount += 1;
      } else {
        mistakes.push({
          question: q.content,
          chosen: chosen !== undefined ? q.options[chosen] : "Chưa chọn",
          correct: q.options[q.correctAnswer],
          topic: subject.name
        });
      }
    });

    const score = Math.round((correctCount / questions.length) * 10 * 10) / 10;
    onFinishQuiz(score, questions.length, correctCount, timeSpent, mistakes);
  };

  const currentQ = questions[currentIndex] || questions[0];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* Test Control Header */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onExitQuiz}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
            title="Thoát bài kiểm tra"
          >
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-800 text-base sm:text-lg">{subject.name}</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">
                Lớp {subject.grade}
              </span>
            </div>
            <div className="text-xs text-slate-500">
              Câu {currentIndex + 1} trên tổng số {questions.length} câu
            </div>
          </div>
        </div>

        {/* Timer & Submit */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 font-mono text-sm font-bold text-slate-800">
            <i className="fa-solid fa-clock text-amber-500"></i>
            <span>{formatTimer(secondsLeft)}</span>
            <button
              onClick={() => setIsPaused(!isPaused)}
              className="text-slate-400 hover:text-slate-600 text-xs ml-1"
              title={isPaused ? "Tiếp tục" : "Tạm dừng"}
            >
              <i className={`fa-solid ${isPaused ? "fa-play" : "fa-pause"}`}></i>
            </button>
          </div>

          <button
            id="btn-submit-quiz"
            onClick={handleAutoSubmit}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-amber-500 hover:opacity-95 text-white font-bold rounded-xl text-xs sm:text-sm shadow-xs transition-all flex items-center gap-1.5"
          >
            <i className="fa-solid fa-paper-plane"></i>
            <span>Nộp bài</span>
          </button>
        </div>
      </div>

      {/* Question Stepper Indicator */}
      <div className="flex items-center gap-1.5 overflow-x-auto p-2 bg-white rounded-xl border border-slate-200 scrollbar-none">
        {questions.map((q, idx) => {
          const isAnswered = selectedAnswers[idx] !== undefined;
          const isCurrent = idx === currentIndex;
          return (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(idx)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center justify-center ${
                isCurrent
                  ? "bg-blue-600 text-white shadow-xs"
                  : isAnswered
                  ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Question Card Box */}
      <div className="bg-white rounded-2xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
              {currentQ.difficulty}
            </span>
            <button
              onClick={handleReadQuestionAloud}
              className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors ${
                isReadingQuestion
                  ? "bg-amber-500 text-white animate-pulse"
                  : "bg-amber-100 text-amber-900 hover:bg-amber-200"
              }`}
              title="Đọc câu hỏi to rõ bằng giọng nói"
            >
              <i className={`fa-solid ${isReadingQuestion ? "fa-volume-xmark" : "fa-volume-high"}`}></i>
              <span>{isReadingQuestion ? "Dừng đọc" : "🔊 Đọc đề bài cho em nghe"}</span>
            </button>
          </div>

          <button
            onClick={() => onAskSocratic(currentQ.content)}
            className="text-xs text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-colors border border-blue-200"
          >
            <i className="fa-solid fa-robot text-amber-500"></i>
            Chuyển câu này sang Gia sư Socratic 7 bước
          </button>
        </div>

        {/* Content with Math Renderer */}
        <div className={`${getTextSizeClass()} font-semibold text-slate-900 leading-relaxed`}>
          <MathRenderer content={currentQ.content} />
        </div>

        {/* Options */}
        <div className="space-y-3">
          {currentQ.options.map((option, idx) => {
            const isSelected = selectedAnswers[currentIndex] === idx;

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3.5 ${
                  isSelected
                    ? "border-blue-600 bg-blue-50/70 text-blue-950 font-semibold shadow-xs"
                    : "border-slate-200 hover:border-slate-300 bg-slate-50/60 text-slate-800"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-base shrink-0 transition-colors ${
                    isSelected ? "bg-blue-600 text-white shadow-xs" : "bg-white border-2 border-slate-300 text-slate-700"
                  }`}
                >
                  {String.fromCharCode(65 + idx)}
                </div>
                <div className={`flex-1 ${getTextSizeClass()}`}>
                  <MathRenderer content={option} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Navigation bottom row */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <button
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs sm:text-sm disabled:opacity-40 flex items-center gap-2"
          >
            <i className="fa-solid fa-chevron-left"></i>
            <span>Câu trước</span>
          </button>

          {currentIndex < questions.length - 1 ? (
            <button
              onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-xs flex items-center gap-2"
            >
              <span>Câu tiếp</span>
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          ) : (
            <button
              onClick={handleAutoSubmit}
              className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-xs flex items-center gap-2 hover:opacity-95"
            >
              <i className="fa-solid fa-check"></i>
              <span>Hoàn thành bài thi</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
