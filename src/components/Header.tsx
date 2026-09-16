import React from "react";
import { GradeLevel } from "../types";

interface HeaderProps {
  currentGrade: GradeLevel;
  onGradeChange: (grade: GradeLevel) => void;
  streakDays: number;
  todayMinutes: number;
  dailyGoalMinutes: number;
  activeTab: "dashboard" | "tutor" | "daily15" | "subjects" | "quiz" | "score" | "math-lab";
  onTabChange: (tab: "dashboard" | "tutor" | "daily15" | "subjects" | "quiz" | "score" | "math-lab") => void;
  fontSize: "normal" | "large" | "xlarge";
  onCycleFontSize: () => void;
  villageFriendlyMode: boolean;
  onToggleVillageMode: () => void;
  onOpenSettings: () => void;
  onOpenGlossary: () => void;
  onOpenDiagnostic: () => void;
  onOpenGuide: () => void;
  currentUser?: any;
  onLogin?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentGrade,
  onGradeChange,
  streakDays,
  todayMinutes,
  dailyGoalMinutes,
  activeTab,
  onTabChange,
  fontSize,
  onCycleFontSize,
  villageFriendlyMode,
  onToggleVillageMode,
  onOpenSettings,
  onOpenGlossary,
  onOpenDiagnostic,
  onOpenGuide,
  currentUser,
  onLogin,
  onLogout
}) => {
  const getFontSizeLabel = () => {
    if (fontSize === "xlarge") return "Chữ rất to (A++)";
    if (fontSize === "large") return "Chữ to (A+)";
    return "Chữ vừa (A)";
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200/60 shadow-xs">
      {/* Top village friendly banner if active */}
      {villageFriendlyMode && (
        <div className="hidden md:flex bg-gradient-to-r from-amber-600 via-amber-500 to-emerald-600 text-white px-3 py-1 text-xs font-semibold items-center justify-between shadow-inner">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1">
              🌾 BẢN LÀNG DỄ DÙNG
            </span>
            <span>
              Chế độ trợ năng đặc biệt: Nút bấm to bản, giọng đọc tiếng Việt 1 chạm, ví dụ nương rẫy mộc mạc!
            </span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Main top bar */}
        <div className="flex items-center justify-between h-16 sm:h-18 gap-2">
          {/* Logo & Highland Slogan */}
          <div
            id="logo-home-trigger"
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none"
            onClick={() => onTabChange("dashboard")}
            title="Về trang chủ bản làng"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-amber-600 via-emerald-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-amber-600/20 shrink-0">
              <span className="text-xl">🏔️</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-xl text-slate-900 tracking-tight">
                  Toán Bản Làng
                </span>
                <span className="px-2 py-0.5 text-[11px] font-bold bg-amber-100 text-amber-900 rounded-full border border-amber-300">
                  GDPT 2018
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden md:block font-medium">
                Gia sư AI 7 bước • Dành riêng cho học sinh vùng cao & mất gốc
              </p>
            </div>
          </div>

          {/* Grade Selector (Big & Touch Friendly) */}
          <div className="flex items-center bg-amber-50/80 p-1 rounded-2xl border border-amber-200/80 shadow-2xs">
            {([10, 11, 12] as GradeLevel[]).map((g) => (
              <button
                key={g}
                id={`btn-select-grade-${g}`}
                onClick={() => onGradeChange(g)}
                className={`px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                  currentGrade === g
                    ? "bg-amber-500 text-white shadow-sm scale-102"
                    : "text-amber-900 hover:bg-amber-100/70"
                }`}
              >
                Lớp {g}
              </button>
            ))}
          </div>

          {/* Accessibility & Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Village Mode Toggle Button */}
            <button
              id="btn-toggle-village-mode"
              onClick={onToggleVillageMode}
              title={villageFriendlyMode ? "Đang bật chế độ Bản Làng Dễ Dùng" : "Bật chế độ Bản Làng Dễ Dùng"}
              className={`hidden md:flex px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-xl border transition-all items-center gap-1.5 shadow-2xs ${
                villageFriendlyMode
                  ? "bg-amber-500 text-white border-amber-600 ring-2 ring-amber-300"
                  : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-amber-50"
              }`}
            >
              <span>🌾</span>
              <span>
                {villageFriendlyMode ? "Bản Làng (Bật)" : "Bản Làng"}
              </span>
            </button>

            {/* Font Size Scaler Button */}
            <button
              id="btn-cycle-font-size"
              onClick={onCycleFontSize}
              title="Đổi cỡ chữ to hơn để dễ đọc"
              className="hidden md:flex px-2 sm:px-2.5 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition-all items-center gap-1"
            >
              <i className="fa-solid fa-font text-xs"></i>
              <span>{getFontSizeLabel()}</span>
            </button>

            {/* Streak Counter */}
            <div className="hidden xl:flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
              <span className="text-base animate-bounce">🔥</span>
              <span className="text-xs font-bold text-amber-900">{streakDays} ngày</span>
              <div className="h-3 w-px bg-amber-200"></div>
              <span className="text-xs text-slate-600">
                Mục tiêu: <strong className="text-slate-900">{todayMinutes}/{dailyGoalMinutes}p</strong>
              </span>
            </div>

            <button
              id="btn-open-game-tab"
              onClick={() => onTabChange("game")}
              title="Mini game Toán học"
              className="hidden lg:flex p-2 sm:px-2.5 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-xl transition-colors text-xs font-semibold items-center gap-1"
            >
              <i className="fa-solid fa-gamepad text-amber-600 text-sm"></i>
              <span>Giải trí</span>
            </button>

            {/* Socratic Guide Button */}
            <button
              id="btn-open-guide-modal"
              onClick={onOpenGuide}
              title="Tìm hiểu phương pháp học Socratic 7 bước"
              className="hidden lg:flex p-2 sm:px-2.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-colors text-xs font-semibold items-center gap-1"
            >
              <i className="fa-solid fa-brain text-blue-600 text-sm"></i>
              <span>7 bước Socratic</span>
            </button>

            {/* Auth Button */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <img src={currentUser.photoURL || `https://ui-avatars.com/api/?name=${currentUser.displayName}`} alt="Avatar" className="w-8 h-8 rounded-full border border-slate-200" title={currentUser.displayName} />
                <button
                  onClick={onLogout}
                  title="Đăng xuất"
                  className="w-9 h-9 sm:w-auto sm:px-3 py-1.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-all flex items-center justify-center gap-1"
                >
                  <i className="fa-solid fa-right-from-bracket"></i>
                </button>
              </div>
            ) : (
              <button
                onClick={onLogin}
                className="hidden sm:flex w-9 h-9 sm:w-auto sm:px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl border border-blue-700 transition-all items-center justify-center gap-1 shadow-sm"
              >
                <i className="fa-brands fa-google"></i>
                <span>Đăng nhập</span>
              </button>
            )}

            {/* Settings & API Key */}
            <button
              id="btn-header-settings"
              onClick={onOpenSettings}
              title="Cài đặt âm thanh, cỡ chữ và API Key"
              className="px-3 py-1.5 text-xs sm:text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <i className="fa-solid fa-gear text-slate-600"></i>
              <span className="hidden sm:inline">Cài đặt</span>
            </button>
          </div>
        </div>

        {/* Primary Navigation Row - Large, High-Contrast Touch Targets (Desktop only, Mobile uses Bottom Nav) */}
        <div className="hidden md:flex items-center justify-between border-t border-slate-100 py-2 overflow-x-auto gap-1 sm:gap-2 scrollbar-none">
          <div className="flex items-center gap-1 sm:gap-2 w-full">
            {/* Tab 1: Trang chủ Bản Làng */}
            <button
              id="tab-nav-dashboard"
              onClick={() => onTabChange("dashboard")}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === "dashboard"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-transparent"
              }`}
            >
              <i className="fa-solid fa-house text-sm"></i>
              <span>Trang Chủ</span>
            </button>

            {/* Tab 2: Thầy Cô AI Socratic (Nói & Chụp ảnh) */}
            <button
              id="tab-nav-tutor"
              onClick={() => onTabChange("tutor")}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === "tutor"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-transparent"
              }`}
            >
              <i className="fa-solid fa-microphone text-rose-500"></i>
              <span>Thầy Cô AI (Nói / Chụp Vở)</span>
            </button>

            {/* Tab 3: 15 Phút Tự Học */}
            <button
              id="tab-nav-daily15"
              onClick={() => onTabChange("daily15")}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === "daily15"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-transparent"
              }`}
            >
              <i className="fa-solid fa-stopwatch text-amber-500"></i>
              <span>15 Phút Tự Học</span>
            </button>

            {/* Tab 4: Chuyên Đề SGK */}
            <button
              id="tab-nav-subjects"
              onClick={() => onTabChange("subjects")}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === "subjects" || activeTab === "quiz" || activeTab === "score"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-transparent"
              }`}
            >
              <i className="fa-solid fa-book text-indigo-500"></i>
              <span>Chuyên Đề Lớp {currentGrade}</span>
            </button>

            {/* Tab 5: Từ Điển Dân Dã */}
            <button
              id="tab-nav-glossary"
              onClick={onOpenGlossary}
              className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-200 transition-all flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>📖</span>
              <span>Từ Điển Bản Làng</span>
            </button>

            {/* Tab 6: Bác Sĩ Bắt Bệnh */}
            <button
              id="tab-nav-diagnostic"
              onClick={onOpenDiagnostic}
              className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200 transition-all flex items-center gap-1.5 whitespace-nowrap"
            >
              <i className="fa-solid fa-stethoscope text-rose-500"></i>
              <span>Bác Sĩ Bắt Bệnh Toán</span>
            </button>

            {/* Tab 7: Math Lab */}
            <button
              id="tab-nav-math-lab"
              onClick={() => onTabChange("math-lab")}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === "math-lab"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-transparent"
              }`}
            >
              <i className="fa-solid fa-flask text-purple-500"></i>
              <span>Phòng Thí Nghiệm</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

