import React from "react";
import { SOCRATIC_STEPS } from "../data/mockData";

interface SocraticGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartTutor: () => void;
}

export const SocraticGuideModal: React.FC<SocraticGuideModalProps> = ({
  isOpen,
  onClose,
  onStartTutor
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-blue-700 to-amber-500 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-lg shadow-inner">
              <i className="fa-solid fa-brain text-amber-300"></i>
            </div>
            <div>
              <h3 className="font-bold text-base">Phương Pháp Socratic 7 Bước Là Gì?</h3>
              <p className="text-xs text-blue-100">Vì sao Thầy giáo AI nhất quyết không giải hộ?</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-sm text-slate-700">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-900 leading-relaxed">
            <strong>💡 Lời tâm sự từ Thầy giáo Socratic:</strong> "Nếu thầy chép sẵn bài giải cho em, em sẽ thấy 'dễ hiểu' ngay lúc đó nhưng vào phòng thi em sẽ lại quên sạch. Phương pháp Socratic (Nhà triết học Socrates) dùng các câu hỏi gợi mở để <strong>chính bộ não của em tự tìm ra đường đi</strong>. Tự mình vượt qua được một ngọn đèo thì từ đó về sau đèo nào em cũng đi được!"
          </div>

          <div className="space-y-3">
            {SOCRATIC_STEPS.map((step) => (
              <div
                key={step.stepNumber}
                className="flex items-start gap-3.5 p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-amber-500 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
                  {step.stepNumber}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-sm">{step.title}</h4>
                    <span className="text-[11px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                      {step.subtitle}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-xl"
          >
            Đã hiểu
          </button>
          <button
            onClick={() => {
              onClose();
              onStartTutor();
            }}
            className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs flex items-center gap-2"
          >
            <i className="fa-solid fa-robot"></i>
            Trải nghiệm cùng Thầy giáo Socratic ngay
          </button>
        </div>
      </div>
    </div>
  );
};
