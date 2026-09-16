import React, { useState } from "react";
import { GLOSSARY_TERMS } from "../data/mockData";
import { MathRenderer } from "./MathRenderer";
import { speechService } from "../services/speechService";
import { GradeLevel } from "../types";

interface GlossaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAskTutorTerm: (term: string) => void;
}

export const GlossaryModal: React.FC<GlossaryModalProps> = ({
  isOpen,
  onClose,
  onAskTutorTerm
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<GradeLevel | "all">("all");
  const [activeSpeakingId, setActiveSpeakingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredTerms = GLOSSARY_TERMS.filter((term) => {
    const matchesSearch =
      term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
      term.simpleDef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      term.analogy.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = selectedGrade === "all" || term.grade === selectedGrade;
    return matchesSearch && matchesGrade;
  });

  const handleSpeakTerm = (id: string, text: string) => {
    if (activeSpeakingId === id) {
      speechService.stopSpeaking();
      setActiveSpeakingId(null);
      return;
    }
    setActiveSpeakingId(id);
    speechService.speak(
      text,
      1.0,
      undefined,
      () => setActiveSpeakingId(null),
      () => setActiveSpeakingId(null)
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-xs">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-blue-700 to-amber-500 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-lg shadow-inner">
              <i className="fa-solid fa-book-open-reader text-amber-300"></i>
            </div>
            <div>
              <h3 className="font-bold text-base">Từ Điển Thuật Ngữ Toán Dân Dã & Vùng Cao</h3>
              <p className="text-xs text-blue-100">Xóa rào cản thuật ngữ trừu tượng bằng hình ảnh thực tế</p>
            </div>
          </div>
          <button
            onClick={() => {
              speechService.stopSpeaking();
              onClose();
            }}
            className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Filter bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <i className="fa-solid fa-magnifying-glass absolute left-3 top-3 text-slate-400 text-xs"></i>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm thuật ngữ: đạo hàm, tích phân, vectơ..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl">
            {(["all", 10, 11, 12] as const).map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGrade(g)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                  selectedGrade === g
                    ? "bg-white text-blue-700 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {g === "all" ? "Tất cả" : `Lớp ${g}`}
              </button>
            ))}
          </div>
        </div>

        {/* Term Cards List */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4">
          {filteredTerms.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <i className="fa-solid fa-magnifying-glass text-3xl mb-2"></i>
              <p className="text-sm">Không tìm thấy thuật ngữ phù hợp với từ khóa.</p>
            </div>
          ) : (
            filteredTerms.map((term) => (
              <div
                key={term.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:shadow-md transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-slate-900 text-base sm:text-lg">
                        {term.term}
                      </h4>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">
                        Lớp {term.grade}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSpeakTerm(term.id, `${term.term}. ${term.simpleDef}. Ví dụ: ${term.analogy}`)}
                      className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors ${
                        activeSpeakingId === term.id
                          ? "bg-amber-500 text-white animate-pulse"
                          : "bg-slate-100 text-slate-600 hover:bg-amber-100 hover:text-amber-800"
                      }`}
                      title="Nghe đọc giải thích này"
                    >
                      <i className={`fa-solid ${activeSpeakingId === term.id ? "fa-volume-xmark" : "fa-volume-high"}`}></i>
                      <span className="hidden sm:inline">Nghe đọc</span>
                    </button>

                    <button
                      onClick={() => {
                        onClose();
                        onAskTutorTerm(term.term);
                      }}
                      className="px-2.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-semibold flex items-center gap-1"
                      title="Hỏi sâu hơn với gia sư AI"
                    >
                      <i className="fa-solid fa-robot"></i>
                      <span className="hidden sm:inline">Hỏi thêm</span>
                    </button>
                  </div>
                </div>

                {/* Simple explanation badge */}
                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs sm:text-sm text-slate-800 space-y-1">
                  <div className="font-bold text-amber-800 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                    <i className="fa-solid fa-seedling text-amber-600"></i>
                    Nói dân dã dễ hiểu:
                  </div>
                  <p className="leading-relaxed font-medium">{term.simpleDef}</p>
                </div>

                {/* Everyday Analogy */}
                <div className="p-3 bg-emerald-50/60 border border-emerald-200/70 rounded-xl text-xs sm:text-sm text-emerald-950 space-y-1">
                  <div className="font-bold text-emerald-800 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                    <i className="fa-solid fa-mountain-sun text-emerald-600"></i>
                    Hình ảnh thực tế đời sống:
                  </div>
                  <p className="leading-relaxed">{term.analogy}</p>
                </div>

                {/* Standard Math Definition & Formula */}
                <div className="text-xs text-slate-500 space-y-1 pt-1">
                  <div>
                    <strong>Định nghĩa chuẩn GDPT 2018:</strong>
                  </div>
                  <div className="text-slate-700">
                    <MathRenderer content={term.standardDef} />
                  </div>
                  {term.relatedFormula && (
                    <div className="p-2 bg-slate-50 rounded-lg text-center font-mono text-xs text-slate-800 mt-2">
                      <MathRenderer content={`$$${term.relatedFormula}$$`} />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={() => {
              speechService.stopSpeaking();
              onClose();
            }}
            className="px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
