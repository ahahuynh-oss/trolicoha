import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { GradeLevel, Question } from "../types";
import { MathRenderer } from "./MathRenderer";
import { speechService } from "../services/speechService";

interface DailyChallengeProps {
  currentGrade: GradeLevel;
  allQuestions: Question[];
  onFinishSession: (score: number, total: number, correct: number, timeSpent: number) => void;
  onAskTutorAboutQuestion: (questionText: string) => void;
  fontSize?: "normal" | "large" | "xlarge";
}

export const DailyChallenge: React.FC<DailyChallengeProps> = ({
  currentGrade,
  allQuestions,
  onFinishSession,
  onAskTutorAboutQuestion,
  fontSize = "large"
}) => {
  // Filter questions for current grade
  const gradeQuestions = allQuestions.filter((q) => q.grade === currentGrade);
  const challengeQuestions = gradeQuestions.slice(0, 3); // 3 focused questions for 15 min

  const [phase, setPhase] = useState<"intro" | "core" | "practice" | "summary">("intro");
  const [secondsRemaining, setSecondsRemaining] = useState<number>(15 * 60); // 15 mins
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [revealedExplanations, setRevealedExplanations] = useState<{ [key: number]: boolean }>({});
  const [timeSpent, setTimeSpent] = useState<number>(0);
  const [isSpeakingQuestion, setIsSpeakingQuestion] = useState<boolean>(false);

  const getTextSizeClass = () => {
    if (fontSize === "xlarge") return "text-lg sm:text-xl";
    if (fontSize === "large") return "text-base sm:text-lg";
    return "text-sm sm:text-base";
  };

  const handleReadCurrentQuestion = () => {
    if (isSpeakingQuestion) {
      speechService.stopSpeaking();
      setIsSpeakingQuestion(false);
      return;
    }
    const currentQ = challengeQuestions[currentQIndex];
    if (!currentQ) return;
    setIsSpeakingQuestion(true);
    const plainText = `Câu hỏi số ${currentQIndex + 1}. ` + currentQ.content.replace(/[\$\\]/g, "");
    speechService.speak(
      plainText,
      0.85,
      undefined,
      () => setIsSpeakingQuestion(false),
      () => setIsSpeakingQuestion(false)
    );
  };

  // Timer tick
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
        setTimeSpent((prev) => prev + 1);
      }, 1000);
    } else if (secondsRemaining === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      speechService.playChime("wrong");
      alert("⏰ Hết 15 phút tự học hôm nay rồi! Thầy rất tự hào về sự kiên trì của em!");
      handleCompleteChallenge();
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, secondsRemaining]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStart = () => {
    speechService.playChime("click");
    setPhase("core");
    setIsTimerRunning(true);
  };

  const handleNextToPractice = () => {
    speechService.playChime("step");
    setPhase("practice");
    setCurrentQIndex(0);
  };

  const handleSelectOption = (optIdx: number) => {
    speechService.playChime("click");
    setSelectedAnswers((prev) => ({ ...prev, [currentQIndex]: optIdx }));
    setRevealedExplanations((prev) => ({ ...prev, [currentQIndex]: true }));

    const currentQ = challengeQuestions[currentQIndex];
    if (optIdx === currentQ.correctAnswer) {
      speechService.playChime("correct");
    } else {
      speechService.playChime("wrong");
    }
  };

  const handleNextQuestion = () => {
    speechService.playChime("click");
    if (currentQIndex < challengeQuestions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
    } else {
      handleCompleteChallenge();
    }
  };

  const handleCompleteChallenge = () => {
    setIsTimerRunning(false);
    setPhase("summary");

    let correctCount = 0;
    challengeQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        correctCount += 1;
      }
    });

    const score = Math.round((correctCount / challengeQuestions.length) * 10 * 10) / 10;

    // Confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      speechService.playChime("celebrate");
    } catch (e) {
      // ignore
    }

    onFinishSession(score, challengeQuestions.length, correctCount, timeSpent);
  };

  const currentQ = challengeQuestions[currentQIndex];
  const isAnswered = selectedAnswers[currentQIndex] !== undefined;
  const isCorrect = isAnswered && selectedAnswers[currentQIndex] === currentQ.correctAnswer;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      {/* 15-Minute Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-600 to-amber-500 rounded-2xl p-4 sm:p-6 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-2xl shadow-inner">
            <i className="fa-solid fa-stopwatch text-amber-300"></i>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-lg sm:text-xl">Lộ Trình 15 Phút Tự Học Mỗi Ngày</h2>
              <span className="text-xs bg-amber-400 text-slate-900 font-bold px-2 py-0.5 rounded-full">
                Lớp {currentGrade} GDPT 2018
              </span>
            </div>
            <p className="text-xs sm:text-sm text-blue-100 mt-0.5">
              3 phút kiến thức cốt lõi • 7 phút rèn 3 bài tập • 5 phút đúc kết chẩn đoán
            </p>
          </div>
        </div>

        {/* Timer Widget */}
        <div className="flex items-center gap-3 bg-black/25 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
          <div className="text-center">
            <div className="text-[10px] text-amber-200 font-semibold uppercase tracking-wider">Đồng hồ đếm ngược</div>
            <div className="text-2xl font-black font-mono tracking-wider text-white">
              {formatTimer(secondsRemaining)}
            </div>
          </div>
          {phase !== "intro" && phase !== "summary" && (
            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors text-sm"
              title={isTimerRunning ? "Tạm dừng" : "Tiếp tục"}
            >
              <i className={`fa-solid ${isTimerRunning ? "fa-pause" : "fa-play"}`}></i>
            </button>
          )}
        </div>
      </div>

      {/* PHASE 1: INTRO */}
      {phase === "intro" && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 text-center space-y-5">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-3xl mx-auto mb-3">
              <i className="fa-solid fa-mountain"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-800">
              Chỉ Cần 15 Phút Mỗi Ngày Để Thoát Khỏi Mất Gốc!
            </h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Các nhà giáo dục chương trình mới 2018 đã chứng minh: Học 15 phút tập trung cao độ mỗi ngày sẽ giúp não bộ hình thành liên kết bền vững hơn là nhồi nhét nhiều tiếng trước kỳ thi.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-left">
            <div className="bg-blue-50/70 border border-blue-200/80 p-3.5 rounded-xl">
              <div className="font-bold text-xs text-blue-700 uppercase">Phần 1 (3 Phút)</div>
              <div className="font-semibold text-slate-800 text-sm mt-1">Cốt lõi bản chất</div>
              <p className="text-xs text-slate-600 mt-1">Ôn lại công thức với ví dụ đời sống gần gũi nhất.</p>
            </div>
            <div className="bg-amber-50/70 border border-amber-200/80 p-3.5 rounded-xl">
              <div className="font-bold text-xs text-amber-700 uppercase">Phần 2 (7 Phút)</div>
              <div className="font-semibold text-slate-800 text-sm mt-1">3 bài tập then chốt</div>
              <p className="text-xs text-slate-600 mt-1">Tự tay làm, có hướng dẫn Socratic từng bước.</p>
            </div>
            <div className="bg-emerald-50/70 border border-emerald-200/80 p-3.5 rounded-xl">
              <div className="font-bold text-xs text-emerald-700 uppercase">Phần 3 (5 Phút)</div>
              <div className="font-semibold text-slate-800 text-sm mt-1">Đúc kết & Chẩn đoán</div>
              <p className="text-xs text-slate-600 mt-1">Phát hiện lỗ hổng lớp dưới và tăng chuỗi Streak.</p>
            </div>
          </div>

          <button
            type="button"
            id="btn-start-daily-15"
            onClick={handleStart}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-amber-500 text-white font-bold rounded-xl shadow-md hover:opacity-95 text-base inline-flex items-center gap-2"
          >
            <i className="fa-solid fa-play"></i>
            Bắt đầu 15 phút hôm nay ngay!
          </button>
        </div>
      )}

      {/* PHASE 2: CORE KNOWLEDGE (3 MINS) */}
      {phase === "core" && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="text-xs font-bold uppercase text-blue-600 flex items-center gap-1.5">
              <i className="fa-solid fa-lightbulb text-amber-500"></i>
              Phần 1: Khắc Sâu Bản Chất Cốt Lõi (3 phút)
            </span>
            <span className="text-xs text-slate-400">Bước 1/3</span>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 space-y-3">
            <h4 className="font-bold text-base text-slate-800 flex items-center gap-2">
              <i className="fa-solid fa-bookmark text-blue-600"></i>
              Toán Lớp {currentGrade}: Điểm mấu chốt không được quên
            </h4>

            {currentGrade === 12 ? (
              <div className="space-y-2 text-sm text-slate-700">
                <div>
                  <MathRenderer content="**Khảo sát hàm số:** Cực trị là điểm mà tại đó đạo hàm $y' = 0$ (hoặc không xác định) và $y'$ phải *đổi dấu* khi đi qua nó!" />
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                  🌾 <strong>Ví dụ bản làng:</strong> Cực đại là đỉnh của một ngọn núi (bạn đi lên dốc rồi đổ dốc xuống). Cực tiểu là đáy thung lũng (bạn đi xuống dốc rồi lại leo dốc lên).
                </div>
              </div>
            ) : currentGrade === 11 ? (
              <div className="space-y-2 text-sm text-slate-700">
                <div>
                  <MathRenderer content="**Đạo hàm hàm hợp:** Khi tính đạo hàm của hàm số chứa biểu thức con $u(x)$, công thức luôn là $(f(u))' = u' \cdot f'(u)$." />
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                  🌾 <strong>Ví dụ bản làng:</strong> Giống như bóc củ hành hoặc bóc lớp vỏ bánh chưng: phải cởi lớp áo ngoài rồi mới tới lớp nhân bên trong.
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-sm text-slate-700">
                <div>
                  <MathRenderer content="**Tọa độ đỉnh Parabol $y = ax^2 + bx + c$:** Luôn có hoành độ đỉnh là $x = -\frac{b}{2a}$." />
                </div>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                  🌾 <strong>Ví dụ bản làng:</strong> Máng nước bằng thân tre uốn cong: điểm võng thấp nhất chính là đỉnh Parabol.
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleNextToPractice}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs text-sm flex items-center gap-2"
            >
              <span>Đã hiểu, sang làm 3 bài tập (7 phút)</span>
              <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>
        </div>
      )}

      {/* PHASE 3: PRACTICE (7 MINS) */}
      {phase === "practice" && currentQ && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-5">
          {/* Question Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                Câu {currentQIndex + 1}/{challengeQuestions.length}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Mức độ: <span className="font-semibold text-slate-700">{currentQ.difficulty}</span>
              </span>
              <button
                onClick={handleReadCurrentQuestion}
                className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  isSpeakingQuestion
                    ? "bg-amber-500 text-white animate-pulse"
                    : "bg-amber-100 text-amber-900 hover:bg-amber-200"
                }`}
                title="Đọc câu hỏi to rõ bằng giọng nói"
              >
                <i className={`fa-solid ${isSpeakingQuestion ? "fa-volume-xmark" : "fa-volume-high"}`}></i>
                <span>{isSpeakingQuestion ? "Dừng đọc" : "🔊 Đọc câu hỏi"}</span>
              </button>
            </div>
            <button
              onClick={() => onAskTutorAboutQuestion(currentQ.content)}
              className="text-xs text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg border border-blue-200"
            >
              <i className="fa-solid fa-robot text-amber-500"></i>
              Hỏi gia sư Socratic về câu này
            </button>
          </div>

          {/* Question Content */}
          <div className={`${getTextSizeClass()} font-semibold text-slate-900 leading-relaxed`}>
            <MathRenderer content={currentQ.content} />
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedAnswers[currentQIndex] === idx;
              const isCorrectAnswer = idx === currentQ.correctAnswer;
              const showResult = isAnswered;

              let btnStyle = "border-slate-200 bg-slate-50 hover:bg-blue-50/50 text-slate-700";
              if (showResult) {
                if (isCorrectAnswer) {
                  btnStyle = "border-emerald-500 bg-emerald-50 text-emerald-900 font-bold";
                } else if (isSelected && !isCorrectAnswer) {
                  btnStyle = "border-rose-400 bg-rose-50 text-rose-900";
                }
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full text-left p-3.5 rounded-xl border-2 transition-all flex items-center gap-3 ${btnStyle}`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      showResult && isCorrectAnswer
                        ? "bg-emerald-600 text-white"
                        : showResult && isSelected && !isCorrectAnswer
                        ? "bg-rose-600 text-white"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <div className="flex-1 text-sm sm:text-base">
                    <MathRenderer content={opt} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation Banner */}
          {revealedExplanations[currentQIndex] && (
            <div
              className={`p-4 rounded-xl border text-sm space-y-2 ${
                isCorrect ? "bg-emerald-50/70 border-emerald-200" : "bg-amber-50/70 border-amber-200"
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-xs uppercase">
                {isCorrect ? (
                  <span className="text-emerald-700 flex items-center gap-1">
                    <i className="fa-solid fa-circle-check text-emerald-600"></i> Chính xác! Tuyệt vời lắm em!
                  </span>
                ) : (
                  <span className="text-rose-700 flex items-center gap-1">
                    <i className="fa-solid fa-circle-xmark text-rose-600"></i> Chưa đúng rồi, xem gợi ý giải thích nhé!
                  </span>
                )}
              </div>

              <div className="text-slate-700">
                <MathRenderer content={currentQ.explanation} />
              </div>

              {currentQ.prerequisiteHint && (
                <div className="pt-2 border-t border-slate-200/60 text-xs text-rose-700">
                  <strong>⚠️ Lỗ hổng cần lưu ý:</strong> {currentQ.prerequisiteHint}
                </div>
              )}

              {currentQ.realLifeAnalogy && (
                <div className="text-xs text-amber-800">
                  <strong>🌾 Ví dụ thực tế:</strong> {currentQ.realLifeAnalogy}
                </div>
              )}
            </div>
          )}

          {/* Navigation Button */}
          {isAnswered && (
            <div className="flex justify-end">
              <button
                onClick={handleNextQuestion}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs text-sm flex items-center gap-2"
              >
                <span>
                  {currentQIndex < challengeQuestions.length - 1 ? "Câu tiếp theo" : "Xem tổng kết 15 phút"}
                </span>
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>
          )}
        </div>
      )}

      {/* PHASE 4: SUMMARY & CELEBRATION */}
      {phase === "summary" && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 text-white flex items-center justify-center text-3xl mx-auto shadow-md">
            <i className="fa-solid fa-trophy"></i>
          </div>

          <div>
            <h3 className="text-2xl font-black text-slate-800">
              Hoàn Thành 15 Phút Tự Học Hôm Nay! 🎉
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              Thầy ghi nhận sự nỗ lực vượt bậc của em. Mỗi ngày 15 phút là con đường ngắn nhất để làm chủ môn Toán!
            </p>
          </div>

          {/* Stats Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg mx-auto">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="text-xs text-slate-500 font-semibold">Thời gian học</div>
              <div className="text-lg font-bold text-slate-800">{Math.floor(timeSpent / 60)} phút {timeSpent % 60}s</div>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div className="text-xs text-emerald-700 font-semibold">Số câu đúng</div>
              <div className="text-lg font-bold text-emerald-700">
                {challengeQuestions.filter((_, idx) => selectedAnswers[idx] === challengeQuestions[idx].correctAnswer).length}/{challengeQuestions.length}
              </div>
            </div>
            <div className="col-span-2 sm:col-span-1 p-3 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="text-xs text-amber-700 font-semibold">Chuỗi ngày (Streak)</div>
              <div className="text-lg font-bold text-amber-700 flex items-center justify-center gap-1">
                <i className="fa-solid fa-fire text-amber-500"></i> +1 Ngày
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setPhase("intro");
                setSelectedAnswers({});
                setRevealedExplanations({});
                setSecondsRemaining(15 * 60);
              }}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm"
            >
              Luyện thêm 15 phút nữa
            </button>
            <button
              onClick={() => onAskTutorAboutQuestion("Em vừa hoàn thành 15 phút học hôm nay, thầy có lời khuyên gì để em củng cố kiến thức tốt hơn không?")}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-amber-500 text-white font-bold rounded-xl shadow-md hover:opacity-95 text-sm flex items-center gap-2"
            >
              <i className="fa-solid fa-robot"></i>
              Nhận xét cá nhân hóa từ gia sư AI
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
