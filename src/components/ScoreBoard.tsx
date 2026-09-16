import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { MathRenderer } from "./MathRenderer";
import { speechService } from "../services/speechService";
import { exportMistakesToDocx } from "../services/exportService";

interface ScoreBoardProps {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  subjectName: string;
  mistakes: Array<{ question: string; chosen: string; correct: string; topic: string }>;
  onRetake: () => void;
  onBackToDashboard: () => void;
  onOpenDiagnosticWithMistakes: (mistakes: Array<{ question: string; chosen: string; correct: string; topic: string }>) => void;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  score,
  totalQuestions,
  correctAnswers,
  timeSpent,
  subjectName,
  mistakes,
  onRetake,
  onBackToDashboard,
  onOpenDiagnosticWithMistakes
}) => {
  useEffect(() => {
    if (score >= 7) {
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
        speechService.playChime("celebrate");
      } catch (e) {
        // ignore
      }
    } else {
      speechService.playChime("step");
    }
  }, [score]);

  const mins = Math.floor(timeSpent / 60);
  const secs = timeSpent % 60;

  let badgeTitle = "Kiên Trì Bền Bỉ";
  let badgeColor = "bg-blue-100 text-blue-800 border-blue-200";
  let comment = "Em đã rất nỗ lực hoàn thành bài tập. Hãy xem lại các câu sai để bồi đắp kiến thức bị hổng nhé!";

  if (score >= 9) {
    badgeTitle = "Cao Thủ Vượt Đỉnh";
    badgeColor = "bg-amber-100 text-amber-900 border-amber-300";
    comment = "Thật xuất sắc! Em đã nắm rất vững bản chất của chuyên đề này!";
  } else if (score >= 7) {
    badgeTitle = "Vững Vàng Tiến Bước";
    badgeColor = "bg-emerald-100 text-emerald-800 border-emerald-200";
    comment = "Làm tốt lắm em! Chỉ còn một vài điểm nhỏ cần tinh chỉnh nữa là hoàn hảo.";
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Main Score Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md text-center space-y-5">
        <div className="inline-block">
          <span className={`px-4 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${badgeColor}`}>
            🏆 {badgeTitle}
          </span>
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800">
            Kết Quả Bài Kiểm Tra: {subjectName}
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">{comment}</p>
        </div>

        {/* Big Score Circle */}
        <div className="relative w-36 h-36 mx-auto rounded-full bg-gradient-to-tr from-blue-600 to-amber-500 p-1.5 shadow-xl flex items-center justify-center">
          <div className="w-full h-full bg-white rounded-full flex flex-col items-center justify-center">
            <span className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
              {score}
            </span>
            <span className="text-xs font-bold text-slate-400">trên 10 điểm</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto pt-2">
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl">
            <div className="text-xs text-slate-500 font-medium">Số câu đúng</div>
            <div className="text-lg font-bold text-emerald-600 mt-0.5">
              {correctAnswers}/{totalQuestions}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl">
            <div className="text-xs text-slate-500 font-medium">Thời gian làm</div>
            <div className="text-lg font-bold text-slate-800 mt-0.5">
              {mins}p {secs}s
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-3 rounded-2xl">
            <div className="text-xs text-slate-500 font-medium">Tỷ lệ chính xác</div>
            <div className="text-lg font-bold text-blue-600 mt-0.5">
              {Math.round((correctAnswers / totalQuestions) * 100)}%
            </div>
          </div>
        </div>

        {/* Diagnostic CTA if mistakes exist */}
        {mistakes.length > 0 && (
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl max-w-lg mx-auto text-left flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center text-base shrink-0">
              <i className="fa-solid fa-stethoscope"></i>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-rose-900 text-sm">
                Phát hiện {mistakes.length} câu chưa chính xác!
              </h4>
              <p className="text-xs text-rose-700 mt-0.5">
                Hãy để Bác Sĩ Toán AI chẩn đoán xem em đang bị hổng định nghĩa hay công thức từ lớp dưới nào.
              </p>
              <button
                onClick={() => onOpenDiagnosticWithMistakes(mistakes)}
                className="mt-2.5 px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs inline-flex items-center gap-1.5 transition-colors"
              >
                <i className="fa-solid fa-wand-magic-sparkles"></i>
                Bác sĩ AI chẩn đoán & kê đơn thuốc 5 phút
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-100">
          <button
            onClick={onRetake}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors flex items-center gap-2"
          >
            <i className="fa-solid fa-rotate-right"></i>
            Làm lại bài thi
          </button>

          <button
            onClick={onBackToDashboard}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-xs transition-colors flex items-center gap-2"
          >
            <i className="fa-solid fa-house"></i>
            Về trang chủ chuyên đề
          </button>
        </div>
      </div>

      {/* Review Mistakes Section */}
      {mistakes.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <i className="fa-solid fa-triangle-exclamation text-amber-500"></i>
              Chi tiết các câu cần lưu ý
            </h3>
            <button
              onClick={() => exportMistakesToDocx(mistakes, "Học sinh")}
              className="text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-colors border border-blue-200 flex items-center gap-2"
            >
              <i className="fa-solid fa-file-word text-blue-600"></i>
              Xuất Phiếu Bài Tập (.docx)
            </button>
          </div>

          <div className="space-y-3">
            {mistakes.map((m, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2 text-sm">
                <div className="font-semibold text-slate-800">
                  <span className="text-slate-500 mr-2">Câu {idx + 1}:</span>
                  <MathRenderer content={m.question} />
                </div>
                <div className="flex flex-wrap gap-4 text-xs pt-1">
                  <div className="text-rose-700">
                    <strong>Đáp án em chọn:</strong> <MathRenderer content={m.chosen} />
                  </div>
                  <div className="text-emerald-700">
                    <strong>Đáp án đúng:</strong> <MathRenderer content={m.correct} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
