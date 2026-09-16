import React, { useState } from "react";
import { AppData, AppSettings } from "../types";
import { speechService } from "../services/speechService";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  appData: AppData;
  onImportData: (data: AppData) => void;
  onResetData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  appData,
  onImportData,
  onResetData
}) => {
  const [apiKeyInput, setApiKeyInput] = useState(settings.customApiKey || "");
  const [showPassword, setShowPassword] = useState(false);
  const [model, setModel] = useState(settings.selectedModel || "gemini-2.5-flash");
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled);
  const [voiceRate, setVoiceRate] = useState(settings.speechVoiceRate || 1.0);
  const [dialect, setDialect] = useState(settings.preferredDialect || "simple_ethnic");
  const [villageFriendlyMode, setVillageFriendlyMode] = useState(settings.villageFriendlyMode !== false);
  const [fontSize, setFontSize] = useState(settings.fontSize || "large");
  const [saveToast, setSaveToast] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    speechService.playChime("click");
    const updated: AppSettings = {
      ...settings,
      customApiKey: apiKeyInput.trim(),
      selectedModel: model,
      soundEnabled,
      speechVoiceRate: voiceRate,
      preferredDialect: dialect,
      villageFriendlyMode,
      fontSize
    };

    localStorage.setItem("gemini_api_key", apiKeyInput.trim());
    onUpdateSettings(updated);

    setSaveToast(true);
    setTimeout(() => {
      setSaveToast(false);
      onClose();
    }, 800);
  };

  // Export JSON Backup
  const handleExportJSON = () => {
    speechService.playChime("click");
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `toan-socratic-backup-${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON Backup
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.subjects && parsed.questions) {
          onImportData(parsed);
          speechService.playChime("celebrate");
          alert("Khôi phục dữ liệu thành công!");
          onClose();
        } else {
          throw new Error("Tệp sao lưu không đúng định dạng!");
        }
      } catch (err: any) {
        alert("Lỗi khi nhập dữ liệu: " + err.message);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-xs">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
              <i className="fa-solid fa-gear"></i>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">Cài Đặt & Cấu Hình AI</h3>
              <p className="text-xs text-slate-500">Quản lý API Key, Model Gemini và Dữ liệu học tập</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <i className="fa-solid fa-xmark text-lg"></i>
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5 text-sm">
          {/* API Key section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-700 flex items-center gap-1.5">
                <i className="fa-solid fa-key text-amber-500"></i>
                Google Gemini API Key
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-600 hover:underline flex items-center gap-1"
              >
                Lấy khóa miễn phí <i className="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
              </a>
            </div>

            <div className="relative">
              <input
                id="input-gemini-api-key"
                type={showPassword ? "text" : "password"}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="Dán AI Studio API Key của bạn (AIzaSy...)"
                className="w-full pl-3.5 pr-10 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 text-sm"
                title={showPassword ? "Ẩn khóa" : "Hiện khóa"}
              >
                <i className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
              </button>
            </div>
            <p className="text-[11px] text-slate-500">
              * Ghi chú: Hệ thống đã tích hợp sẵn API Key môi trường phía máy chủ. Tuy nhiên em có thể nhập thêm API Key riêng tại đây (được lưu an toàn trong LocalStorage trình duyệt).
            </p>
          </div>

          {/* Model selection */}
          <div className="space-y-2">
            <label className="font-bold text-slate-700 flex items-center gap-1.5">
              <i className="fa-solid fa-microchip text-blue-600"></i>
              Mô hình AI Gemini
            </label>
            <select
              id="select-gemini-model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-200"
            >
              <option value="gemini-2.5-flash">Gemini 2.5 Flash (Khuyên dùng - Phản hồi siêu nhanh & chuẩn Toán)</option>
              <option value="gemini-3.5-flash">Gemini 3.5 Flash (Thế hệ mới, đa phương tiện)</option>
              <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (Tiết kiệm băng thông vùng cao)</option>
              <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro Preview (Suy luận sâu toán học nâng cao)</option>
            </select>
          </div>

          {/* Dialect / Explaining Style */}
          <div className="space-y-2">
            <label className="font-bold text-slate-700 flex items-center gap-1.5">
              <i className="fa-solid fa-language text-emerald-600"></i>
              Phong cách diễn đạt của Thầy giáo AI
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDialect("simple_ethnic")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  dialect === "simple_ethnic"
                    ? "border-amber-500 bg-amber-50/60 text-amber-950 font-bold ring-1 ring-amber-400"
                    : "border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="text-xs">🌾 Dân dã & Vùng cao</div>
                <div className="text-[11px] font-normal text-slate-500 mt-0.5">Dùng ví dụ nương rẫy, nhà sàn, leo dốc để xóa sợ hãi</div>
              </button>

              <button
                type="button"
                onClick={() => setDialect("standard")}
                className={`p-3 rounded-xl border text-left transition-all ${
                  dialect === "standard"
                    ? "border-blue-500 bg-blue-50/60 text-blue-950 font-bold ring-1 ring-blue-400"
                    : "border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="text-xs">📐 Chuẩn mực GDPT</div>
                <div className="text-[11px] font-normal text-slate-500 mt-0.5">Thuật ngữ sư phạm chuẩn sách giáo khoa 2018</div>
              </button>
            </div>
          </div>

          {/* Village Friendly & Accessibility Controls */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 flex items-center gap-1.5 text-xs sm:text-sm">
                  <span>🌾</span> Chế độ Bản Làng Thân Thiện (Hỗ trợ vùng cao)
                </span>
                <p className="text-[11px] text-slate-500">
                  Nút bấm to, ưu tiên giọng nói tiếng Việt, tự động đọc to, giải thích hình tượng đời sống
                </p>
              </div>
              <input
                type="checkbox"
                checked={villageFriendlyMode}
                onChange={(e) => setVillageFriendlyMode(e.target.checked)}
                className="w-5 h-5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
              />
            </div>

            {/* Font size choice */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 text-xs sm:text-sm flex items-center gap-1.5">
                <i className="fa-solid fa-text-height text-indigo-600"></i>
                Cỡ chữ hiển thị
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setFontSize("normal")}
                  className={`py-2 px-3 rounded-xl border text-center text-xs font-bold transition-all ${
                    fontSize === "normal"
                      ? "bg-indigo-50 border-indigo-500 text-indigo-900"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Vừa (100%)
                </button>
                <button
                  type="button"
                  onClick={() => setFontSize("large")}
                  className={`py-2 px-3 rounded-xl border text-center text-xs font-bold transition-all ${
                    fontSize === "large"
                      ? "bg-amber-50 border-amber-500 text-amber-900"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  To (125%)
                </button>
                <button
                  type="button"
                  onClick={() => setFontSize("xlarge")}
                  className={`py-2 px-3 rounded-xl border text-center text-xs font-bold transition-all ${
                    fontSize === "xlarge"
                      ? "bg-emerald-50 border-emerald-500 text-emerald-900"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  Rất to (150%)
                </button>
              </div>
            </div>
          </div>

          {/* Sound & Voice Controls */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <i className="fa-solid fa-volume-high text-blue-600"></i>
                Hiệu ứng âm thanh & chúc mừng
              </span>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={(e) => setSoundEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Tốc độ đọc giọng nói tiếng Việt (TTS):</span>
                <span className="font-bold text-blue-600">{voiceRate}x</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.2"
                step="0.1"
                value={voiceRate}
                onChange={(e) => setVoiceRate(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Data Backup & Restore */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="font-bold text-slate-700 flex items-center gap-1.5">
              <i className="fa-solid fa-database text-purple-600"></i>
              Sao lưu & Khôi phục Dữ liệu (JSON)
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleExportJSON}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <i className="fa-solid fa-download"></i>
                Xuất file JSON (Export)
              </button>

              <label className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
                <i className="fa-solid fa-upload"></i>
                Nhập file JSON (Import)
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={() => {
                  if (confirm("Em có chắc chắn muốn đặt lại dữ liệu mẫu ban đầu không?")) {
                    onResetData();
                    onClose();
                  }
                }}
                className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold"
              >
                Đặt lại dữ liệu gốc
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-emerald-600 font-semibold">
            {saveToast && "✓ Đã lưu cài đặt thành công!"}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-200 rounded-xl"
            >
              Hủy
            </button>
            <button
              type="button"
              id="btn-save-settings"
              onClick={handleSave}
              className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
            >
              Lưu thay đổi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
