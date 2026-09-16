import React, { useState } from "react";
import { diagnoseMistakesAI } from "../services/geminiService";
import { MathRenderer } from "./MathRenderer";
import { speechService } from "../services/speechService";
import { WeakTopic } from "../types";

interface DiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
  customApiKey: string;
  initialMistakes?: Array<{ question: string; chosen: string; correct: string; topic: string }>;
  onSaveWeakTopic?: (weakTopic: WeakTopic) => void;
}

export const DiagnosticModal: React.FC<DiagnosticModalProps> = ({
  isOpen,
  onClose,
  customApiKey,
  initialMistakes = [],
  onSaveWeakTopic
}) => {
  const [mistakesInput, setMistakesInput] = useState<Array<{ question: string; chosen: string; correct: string; topic: string }>>(
    initialMistakes.length > 0
      ? initialMistakes
      : [
          {
            question: "Tìm tiệm cận đứng của đồ thị hàm số y = (2x - 3)/(x + 1)",
            chosen: "x = 1 (do nhìn nhầm mẫu số)",
            correct: "x = -1 (mẫu số x + 1 = 0 => x = -1)",
            topic: "Hàm số Lớp 12"
          }
        ]
  );

  const [diagnosticResult, setDiagnosticResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRunDiagnostic = async () => {
    setIsLoading(true);
    speechService.playChime("click");
    try {
      const result = await diagnoseMistakesAI(mistakesInput, customApiKey);
      setDiagnosticResult(result);
      speechService.playChime("celebrate");

      if (onSaveWeakTopic) {
        onSaveWeakTopic({
          topicId: `weak-${Date.now()}`,
          topicName: mistakesInput[0]?.topic || "Kiến thức đại số cần bổ trợ",
          missedCount: mistakesInput.length,
          rootCauseGrade: 10,
          advice: "Ôn lại các kỹ thuật giải phương trình mẫu số và điều kiện xác định."
        });
      }
    } catch (err: any) {
      speechService.playChime("wrong");
      alert(err.message || "Lỗi khi chẩn đoán lỗ hổng kiến thức.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-rose-500 to-amber-500 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-lg shadow-inner">
              <i className="fa-solid fa-stethoscope text-amber-200"></i>
            </div>
            <div>
              <h3 className="font-bold text-base">Bác Sĩ Chẩn Đoán Lỗ Hổng Kiến Thức</h3>
              <p className="text-xs text-rose-100">Tìm chính xác nguyên nhân mất gốc từ các lớp dưới</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex items-start gap-2">
            <i className="fa-solid fa-circle-info text-amber-600 mt-0.5"></i>
            <div>
              <strong>Nguyên lý chẩn đoán:</strong> Hầu hết học sinh sợ học Toán 12 không phải do Toán 12 quá khó, mà là do bị quên một công thức nhỏ ở Lớp 8 hoặc Lớp 9. Bác Sĩ AI sẽ giúp em khoanh vùng đúng điểm tắc nghẽn này!
            </div>
          </div>

          {/* Current Mistakes List */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Câu hỏi cần chẩn đoán ({mistakesInput.length} câu):
            </label>
            <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
              {mistakesInput.map((m, idx) => (
                <div key={idx} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs">
                  <div className="font-semibold text-slate-800 line-clamp-1">{m.question}</div>
                  <div className="text-slate-500 mt-0.5">
                    Lỗi sai: <span className="text-rose-600 font-medium">{m.chosen}</span> • Đúng là: <span className="text-emerald-600 font-medium">{m.correct}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trigger Button */}
          {!diagnosticResult && (
            <button
              onClick={handleRunDiagnostic}
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-rose-600 to-amber-500 hover:opacity-95 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm"
            >
              {isLoading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i>
                  Đang phân tích các lỗi sai và tìm gốc rễ...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-wand-magic-sparkles"></i>
                  Bắt đầu chẩn đoán & Kê đơn thuốc bù đắp ngay
                </>
              )}
            </button>
          )}

          {/* Diagnostic Result */}
          {diagnosticResult && (
            <div className="bg-slate-50 border-2 border-emerald-300 rounded-xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-bold text-emerald-800 text-sm flex items-center gap-1.5">
                  <i className="fa-solid fa-circle-check text-emerald-600"></i>
                  Kết quả chẩn đoán từ Bác Sĩ AI
                </span>
                <button
                  onClick={handleRunDiagnostic}
                  disabled={isLoading}
                  className="text-xs text-blue-600 font-semibold hover:underline"
                >
                  Phân tích lại
                </button>
              </div>

              <div className="text-slate-700 text-sm">
                <MathRenderer content={diagnosticResult} />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
