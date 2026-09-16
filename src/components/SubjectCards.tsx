import React from "react";
import { GradeLevel, Subject } from "../types";

interface SubjectCardsProps {
  currentGrade: GradeLevel;
  subjects: Subject[];
  onSelectSubjectForQuiz: (subject: Subject) => void;
  onAskTutorSubject: (subjectName: string) => void;
}

export const SubjectCards: React.FC<SubjectCardsProps> = ({
  currentGrade,
  subjects,
  onSelectSubjectForQuiz,
  onAskTutorSubject
}) => {
  const gradeSubjects = subjects.filter((s) => s.grade === currentGrade);

  // Group by category
  const categories = ["Đại số & Giải tích", "Hình học & Đo lường", "Thống kê & Xác suất"] as const;

  return (
    <div className="w-full space-y-8">
      {categories.map((cat) => {
        const catSubjects = gradeSubjects.filter((s) => s.category === cat);
        if (catSubjects.length === 0) return null;

        return (
          <div key={cat} className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <span className="w-2 h-5 rounded-full bg-blue-600 inline-block"></span>
              <h3 className="font-bold text-slate-800 text-base sm:text-lg">{cat}</h3>
              <span className="text-xs text-slate-500 font-medium">({catSubjects.length} chuyên đề)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {catSubjects.map((sub) => {
                const percent = Math.min(100, Math.round((sub.completedCount / sub.questionsCount) * 100));

                return (
                  <div
                    key={sub.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top icon and badge */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <i className={`fa-solid ${sub.icon}`}></i>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
                          {sub.questionsCount} câu hỏi
                        </span>
                      </div>

                      {/* Name & Description */}
                      <h4 className="font-bold text-slate-800 text-base group-hover:text-blue-600 transition-colors">
                        {sub.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {sub.description}
                      </p>

                      {/* Progress Bar */}
                      <div className="mt-4 space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold text-slate-500">
                          <span>Tiến độ hoàn thành</span>
                          <span className="text-blue-600">{percent}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-amber-500 rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
                      <button
                        id={`btn-quiz-${sub.id}`}
                        onClick={() => onSelectSubjectForQuiz(sub)}
                        className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <i className="fa-solid fa-play text-xs"></i>
                        Luyện tập ngay
                      </button>

                      <button
                        onClick={() => onAskTutorSubject(sub.name)}
                        title="Hỏi gia sư AI về chuyên đề này"
                        className="p-2 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-xl border border-slate-200 transition-colors text-xs flex items-center justify-center"
                      >
                        <i className="fa-solid fa-robot"></i>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
