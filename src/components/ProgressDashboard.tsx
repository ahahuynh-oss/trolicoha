import React, { useState } from "react";
import { AppData, GradeLevel } from "../types";
import { speechService } from "../services/speechService";
import { RadarChart } from "./RadarChart";

interface ProgressDashboardProps {
  appData: AppData;
  currentGrade: GradeLevel;
  onStart15Min: () => void;
  onOpenTutor?: () => void;
  onOpenSubjects?: () => void;
  onOpenDiagnostic: () => void;
  onOpenGlossary: () => void;
  villageFriendlyMode?: boolean;
  onStartVoiceTutor?: () => void;
  onStartCameraScan?: () => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  appData,
  currentGrade,
  onStart15Min,
  onOpenTutor,
  onOpenSubjects,
  onOpenDiagnostic,
  onOpenGlossary,
  villageFriendlyMode = true,
  onStartVoiceTutor,
  onStartCameraScan
}) => {
  const handleOpenTutor = onOpenTutor || onStartVoiceTutor || onStartCameraScan || (() => {});
  const handleOpenSubjects = onOpenSubjects || (() => {});
  const { progress, sessions } = appData;
  const gradeSessions = sessions.filter((s) => s.subjectId.includes(`sub-${currentGrade}`) || s.subjectName);

  const goalPercent = Math.min(100, Math.round((progress.todayMinutesSpent / progress.dailyGoalMinutes) * 100));
  const [isSpeakingWelcome, setIsSpeakingWelcome] = useState(false);

  const welcomeGreeting = `Chào em! Chúc em một ngày học Toán vui tươi như ánh mặt trời trên nương rẫy. 
Hôm nay em chỉ cần dành ra mười lăm phút tự học. Nếu gặp bài toán khó, em không cần gõ chữ mà hãy bấm nút Micro để nói, hoặc chụp ảnh trang vở bài tập gửi cho thầy cô AI nhé!`;

  const handleToggleSpeakWelcome = () => {
    if (isSpeakingWelcome) {
      speechService.stopSpeaking();
      setIsSpeakingWelcome(false);
      return;
    }
    setIsSpeakingWelcome(true);
    speechService.speak(
      welcomeGreeting,
      0.9,
      undefined,
      () => setIsSpeakingWelcome(false),
      () => setIsSpeakingWelcome(false)
    );
  };

  return (
    <div className="w-full space-y-6">
      {/* Highland Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-emerald-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border-2 border-amber-400/30">
        {/* Background ethnic mountain motif */}
        <div className="absolute -right-10 -bottom-10 opacity-15 pointer-events-none text-9xl">
          🏔️
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-amber-400/25 border border-amber-300/40 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold text-amber-200">
              <span>🌾</span>
              <span>Lớp {currentGrade} • GDPT 2018 Bản Làng Thân Thiện</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              Chào Em! Chúc Em Một Ngày Học Thật Vui Tươi ☀️
            </h2>

            <p className="text-sm sm:text-base text-amber-100 leading-relaxed">
              Toán học không hề đáng sợ! Mỗi ngày chỉ cần <strong>15 phút</strong> như gùi một bó củi nhỏ về nhà. Không hiểu chỗ nào có thể <strong>hỏi bằng giọng nói</strong> hoặc <strong>chụp ảnh trang vở</strong>, thầy cô AI luôn đồng hành kiên nhẫn cùng em.
            </p>

            {/* Read aloud welcome button */}
            <div className="pt-1 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <button
                id="btn-speak-welcome"
                onClick={handleToggleSpeakWelcome}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-2 ${
                  isSpeakingWelcome
                    ? "bg-rose-500 text-white animate-pulse"
                    : "bg-white/20 hover:bg-white/30 text-white border border-white/30"
                }`}
              >
                <i className={`fa-solid ${isSpeakingWelcome ? "fa-volume-xmark" : "fa-volume-high"}`}></i>
                <span>{isSpeakingWelcome ? "Dừng giọng đọc" : "🔊 Đọc lời chào & hướng dẫn"}</span>
              </button>

              <button
                onClick={onStart15Min}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-xl text-sm sm:text-base shadow-lg transition-transform active:scale-95 flex items-center gap-2"
              >
                <span>⏱️</span>
                <span>Bắt đầu 15 phút hôm nay</span>
              </button>
            </div>
          </div>

          {/* Streak & Mountain Journey Tracker */}
          <div className="bg-slate-950/40 backdrop-blur-md border border-amber-300/30 rounded-2xl p-5 w-full sm:w-84 space-y-4 shrink-0 shadow-inner">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-500 text-slate-950 flex items-center justify-center text-2xl font-black shadow-md">
                  🔥
                </div>
                <div>
                  <div className="text-xs text-amber-200 font-semibold uppercase tracking-wider">Chuỗi kiên trì</div>
                  <div className="text-2xl font-black text-white">{progress.streakDays} Ngày</div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-amber-200 font-semibold uppercase tracking-wider">Điểm tự học</div>
                <div className="text-2xl font-black text-amber-300">{progress.averageScore}/10</div>
              </div>
            </div>

            {/* Daily Goal Bar */}
            <div className="space-y-1.5 pt-2 border-t border-white/15">
              <div className="flex justify-between text-xs font-bold text-amber-100">
                <span>Mục tiêu 15 phút hôm nay:</span>
                <span>{progress.todayMinutesSpent} / {progress.dailyGoalMinutes} phút</span>
              </div>
              <div className="h-3 w-full bg-black/30 rounded-full overflow-hidden p-0.5 border border-white/20">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${goalPercent}%` }}
                />
              </div>
              <div className="text-[11px] text-amber-200/80 text-center font-medium">
                {goalPercent >= 100 ? "🎉 Tuyệt vời! Em đã hoàn thành mục tiêu hôm nay!" : "🌾 Cố lên em, mỗi ngày một bước vững chắc!"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* D3 Radar Chart for Proficiency */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-200 shadow-xs space-y-4">
        <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
          <span>📊</span>
          Biểu đồ Năng lực (D3.js)
        </h3>
        <p className="text-sm text-slate-600 mb-4">Dựa trên tỷ lệ câu trả lời đúng của từng chuyên đề</p>
        <RadarChart
          data={appData.subjects.map(s => ({
            axis: s.name.length > 15 ? s.name.substring(0,15) + "..." : s.name,
            value: s.questionsCount > 0 ? (s.completedCount / s.questionsCount) * 100 : 0
          }))}
          width={350}
          height={300}
        />
      </div>

      {/* 4 PRIMARY ACTION CARDS - Big, Visual, High Contrast (Easy for Ethnic Minority Students) */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <span>✨</span>
            <span>Hôm Nay Em Muốn Học Gì? (Chọn 1 trong 4 cách dưới đây)</span>
          </h3>
          <span className="text-xs font-semibold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-300">
            Dễ dùng nhất
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {/* Card 1: 15 Phút Tự Học Mỗi Ngày */}
          <div
            id="card-action-15min"
            onClick={onStart15Min}
            className="group cursor-pointer bg-gradient-to-br from-amber-50 to-amber-100/70 hover:from-amber-100 hover:to-amber-200/80 border-2 border-amber-300 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-2xl shadow-md shrink-0 group-hover:scale-105 transition-transform">
                ⏱️
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg sm:text-xl font-black text-amber-950">
                    15 Phút Tự Học Mỗi Ngày
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500 text-white font-bold">
                    Khuyên dùng
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-amber-900/80 leading-relaxed font-medium">
                  3 phút hiểu bản chất $\rightarrow$ 7 phút làm 3 câu nương rẫy $\rightarrow$ 5 phút đúc kết. Vừa vặn, không mệt mỏi!
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-amber-200/70 flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                <i className="fa-solid fa-play text-amber-600"></i> Bắt đầu ngay (Có đồng hồ 15p)
              </span>
              <span className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm shadow-xs group-hover:translate-x-1 transition-transform">
                <i className="fa-solid fa-arrow-right"></i>
              </span>
            </div>
          </div>

          {/* Card 2: Hỏi Thầy Cô AI Bằng Giọng Nói Hoặc Ảnh Chụp Vở */}
          <div
            id="card-action-tutor"
            onClick={handleOpenTutor}
            className="group cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-100/70 hover:from-blue-100 hover:to-indigo-200/80 border-2 border-blue-300 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl shadow-md shrink-0 group-hover:scale-105 transition-transform">
                🎙️
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg sm:text-xl font-black text-blue-950">
                    Hỏi Bài Bằng Giọng Nói / Chụp Ảnh Vở
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-500 text-white font-bold">
                    Không cần gõ chữ
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-blue-900/80 leading-relaxed font-medium">
                  Em chỉ cần chạm mic nói câu hỏi hoặc chụp ảnh bài tập trong vở. Thầy cô AI sẽ hướng dẫn từng bước Socratic, không giải hộ.
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-blue-200/70 flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900 flex items-center gap-1">
                <i className="fa-solid fa-camera text-blue-600"></i> Mở phòng gia sư (Voice & Camera)
              </span>
              <span className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm shadow-xs group-hover:translate-x-1 transition-transform">
                <i className="fa-solid fa-arrow-right"></i>
              </span>
            </div>
          </div>

          {/* Card 3: Chuyên Đề SGK Lớp 10 - 11 - 12 */}
          <div
            id="card-action-subjects"
            onClick={handleOpenSubjects}
            className="group cursor-pointer bg-gradient-to-br from-emerald-50 to-teal-100/70 hover:from-emerald-100 hover:to-teal-200/80 border-2 border-emerald-300 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-2xl shadow-md shrink-0 group-hover:scale-105 transition-transform">
                📚
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg sm:text-xl font-black text-emerald-950">
                    Học Từng Bài Sách Giáo Khoa Lớp {currentGrade}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-emerald-900/80 leading-relaxed font-medium">
                  Khảo sát hàm số, Hình không gian, Tọa độ Oxyz, Thống kê xác suất. Luyện trắc nghiệm có giải thích chi tiết.
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-emerald-200/70 flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-900 flex items-center gap-1">
                <i className="fa-solid fa-layer-group text-emerald-600"></i> Xem danh sách bài học Lớp {currentGrade}
              </span>
              <span className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-sm shadow-xs group-hover:translate-x-1 transition-transform">
                <i className="fa-solid fa-arrow-right"></i>
              </span>
            </div>
          </div>

          {/* Card 4: Từ Điển Toán Dân Dã & Bác Sĩ Bắt Bệnh */}
          <div
            id="card-action-glossary"
            onClick={onOpenGlossary}
            className="group cursor-pointer bg-gradient-to-br from-rose-50 to-amber-100/70 hover:from-rose-100 hover:to-amber-200/80 border-2 border-rose-300 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-600 text-white flex items-center justify-center text-2xl shadow-md shrink-0 group-hover:scale-105 transition-transform">
                📖
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg sm:text-xl font-black text-rose-950">
                    Từ Điển Bản Làng & Ví Dụ Đời Sống
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500 text-white font-bold">
                    Có giọng đọc
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-rose-900/80 leading-relaxed font-medium">
                  Đạo hàm, vectơ, tích phân, parabol... giải thích mộc mạc bằng hình ảnh dốc đèo, nương ngô, máng tre uốn cong.
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-rose-200/70 flex items-center justify-between">
              <span className="text-xs font-bold text-rose-900 flex items-center gap-1">
                <i className="fa-solid fa-book-open text-rose-600"></i> Tra cứu từ khó ngay
              </span>
              <span className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center text-sm shadow-xs group-hover:translate-x-1 transition-transform">
                <i className="fa-solid fa-arrow-right"></i>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Knowledge Gaps / Doctor Section */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center text-lg shrink-0">
              🩺
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base sm:text-lg">Bác Sĩ Bắt Bệnh Toán Học</h3>
              <p className="text-xs text-slate-500">Giúp em tìm ra kiến thức bị quên từ lớp 7-8-9 để học bù đắp, không sợ mất gốc</p>
            </div>
          </div>

          <button
            onClick={onOpenDiagnostic}
            className="text-xs sm:text-sm font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 self-start sm:self-auto border border-rose-200"
          >
            <i className="fa-solid fa-wand-magic-sparkles"></i>
            Khám lại toàn diện
          </button>
        </div>

        {progress.weakTopics.length === 0 ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs sm:text-sm text-emerald-900 flex items-center gap-3">
            <span className="text-xl">🌿</span>
            <span>Tuyệt vời! Hiện tại em chưa có lỗ hổng kiến thức nào nghiêm trọng. Hãy tiếp tục duy trì 15 phút mỗi ngày nhé!</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {progress.weakTopics.map((wt) => (
              <div
                key={wt.topicId}
                className="p-4 rounded-2xl border-2 border-rose-200 bg-rose-50/40 space-y-2 text-xs sm:text-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="font-black text-rose-950 text-sm sm:text-base">{wt.topicName}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-200 text-rose-900 font-extrabold text-xs shrink-0">
                    Gốc Lớp {wt.rootCauseGrade}
                  </span>
                </div>
                <p className="text-slate-700 leading-relaxed font-medium">
                  <strong>💡 Lời khuyên bồi đắp:</strong> {wt.advice}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Badges & Highland Encouragement Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Badges */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
              <span>🏅</span>
              Huy Hiệu Bản Làng Đã Đạt
            </h3>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              {progress.badges.length} huy hiệu
            </span>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {progress.badges.map((b, idx) => (
              <div
                key={idx}
                className="px-3.5 py-2 bg-amber-50 border border-amber-300 rounded-2xl text-xs sm:text-sm font-bold text-amber-950 flex items-center gap-2 shadow-2xs"
              >
                <span className="text-base">🏆</span>
                <span>{b}</span>
              </div>
            ))}
            <div className="px-3.5 py-2 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl text-xs text-slate-400 flex items-center gap-2">
              <span>🔒</span>
              <span>Chiến Binh 14 Ngày (Đang cố gắng)</span>
            </div>
          </div>
        </div>

        {/* Highland Motivation Box */}
        <div className="bg-gradient-to-br from-amber-50 to-emerald-50 rounded-3xl p-5 sm:p-6 border-2 border-amber-200/80 shadow-xs space-y-3">
          <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
            <span>🌾</span>
            Lời Nhắn Nhủ Từ Bản Làng
          </h3>
          <blockquote className="text-xs sm:text-sm text-slate-700 italic border-l-4 border-amber-500 pl-3 leading-relaxed">
            &ldquo;Con suối nhỏ kiên trì chảy mãi sẽ vượt qua ngọn núi đá để hòa vào dòng sông lớn. Mỗi ngày em hiểu trọn vẹn một bài toán nhỏ, ngày thi THPT em sẽ vững vàng như cây pơ-mu giữa đại ngàn!&rdquo;
          </blockquote>
          <div className="text-[11px] text-amber-900 font-bold text-right">
            — Thầy cô Gia sư Socratic đồng hành cùng em
          </div>
        </div>
      </div>
    </div>
  );
};

