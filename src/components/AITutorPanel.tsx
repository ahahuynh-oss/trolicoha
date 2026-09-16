import React, { useState, useRef, useEffect } from "react";
import { ChatMessage, GradeLevel } from "../types";
import { SOCRATIC_STEPS } from "../data/mockData";
import { askSocraticTutor, scanMathProblemImage } from "../services/geminiService";
import { speechService } from "../services/speechService";
import { MathRenderer } from "./MathRenderer";
import { CameraModal } from "./CameraModal";

interface AITutorPanelProps {
  currentGrade: GradeLevel;
  customApiKey: string;
  useSimpleDialect: boolean;
  onToggleDialect: (val: boolean) => void;
  onStudyTimeSpent: (minutes: number) => void;
  onOpenSettings: () => void;
  fontSize?: "normal" | "large" | "xlarge";
  villageFriendlyMode?: boolean;
}

export const AITutorPanel: React.FC<AITutorPanelProps> = ({
  currentGrade,
  customApiKey,
  useSimpleDialect,
  onToggleDialect,
  onStudyTimeSpent,
  onOpenSettings,
  fontSize = "large",
  villageFriendlyMode = true
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      sender: "ai",
      text: `Chào em! Thầy cô là **Gia Sư AI Toán Bản Làng GDPT 2018**. 

Thầy cô ở đây để **dẫn dắt em từng bước Socratic**, kiên nhẫn đồng hành cùng em, **tuyệt đối không làm hộ hay chép đáp án** để em tự tin làm chủ tư duy của mình.

🌾 **Dành riêng cho em:**
1. Em **không cần gõ bàn phím**: Hãy chạm vào nút Micro to màu đỏ bên dưới để nói bằng tiếng Việt, hoặc chụp ảnh bài tập trong vở!
2. Mỗi câu giảng đều có nút **"🔊 Nghe giọng đọc"** đọc chậm rãi, rõ ràng từng lời.
3. Mọi khái niệm trừu tượng đều được giải thích bằng hình ảnh ruộng bậc thang, con suối, nhà sàn, máng tre gần gũi.

👉 **Hãy bấm nói hoặc gửi bài toán em đang vướng mắc để cùng thầy cô bắt đầu nhé!**`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      stepHint: 1
    }
  ]);

  const [inputText, setInputText] = useState("");
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeSpeakingMsgId, setActiveSpeakingMsgId] = useState<string | null>(null);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [problemContext, setProblemContext] = useState<string>("");
  const [autoRead, setAutoRead] = useState(true);

  const chatEndRef = useRef<HTMLDivElement>(null);

  const getTextSizeClass = () => {
    if (fontSize === "xlarge") return "text-base sm:text-lg lg:text-xl";
    if (fontSize === "large") return "text-sm sm:text-base lg:text-lg";
    return "text-xs sm:text-sm";
  };

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Track study time (every 60s active in tutor adds 1 min)
  useEffect(() => {
    const timer = setInterval(() => {
      onStudyTimeSpent(1);
    }, 60000);
    return () => clearInterval(timer);
  }, [onStudyTimeSpent]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend ?? inputText).trim();
    if (!text || isLoading) return;

    speechService.playChime("click");
    setInputText("");

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      stepHint: currentStep
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const activeContext = problemContext || text;
      if (!problemContext) {
        setProblemContext(text);
      }

      const responseText = await askSocraticTutor({
        problemContext: activeContext,
        studentInput: text,
        currentStep,
        grade: currentGrade,
        useSimpleDialect,
        userApiKey: customApiKey
      });

      speechService.playChime("step");

      // Auto advance step when student makes good progress or when completed
      let nextStep = currentStep;
      if (text.toLowerCase().includes("bước tiếp") || text.toLowerCase().includes("tiếp tục") || text.toLowerCase().includes("xong bước")) {
        nextStep = Math.min(7, currentStep + 1);
        setCurrentStep(nextStep);
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        stepHint: nextStep
      };

      setMessages((prev) => [...prev, aiMsg]);

      // If auto-read is enabled, speak the answer slowly & clearly for ethnic learners
      if (autoRead) {
        setActiveSpeakingMsgId(aiMsg.id);
        speechService.speak(
          responseText,
          0.85,
          undefined,
          () => setActiveSpeakingMsgId(null),
          () => setActiveSpeakingMsgId(null)
        );
      }
    } catch (err: any) {
      console.error("AI Tutor error:", err);
      speechService.playChime("wrong");
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: "system",
        text: `⚠️ **Thông báo:** ${err.message || "Không thể kết nối với gia sư AI."} 
        \n👉 Nếu em chưa có API Key, hãy bấm vào nút **Cài đặt / API Key** trên thanh trên cùng để thêm key hoàn toàn miễn phí nhé.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Voice recording toggle
  const toggleVoiceRecording = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
      return;
    }

    speechService.playChime("click");
    const started = speechService.startListening(
      (transcript, isFinal) => {
        setInputText(transcript);
        if (isFinal) {
          setIsListening(false);
          handleSendMessage(transcript);
        }
      },
      (err) => {
        console.warn("Speech error:", err);
        setIsListening(false);
        alert(err.message || "Không thể nhận diện giọng nói. Hãy kiểm tra micro.");
      },
      () => {
        setIsListening(false);
      }
    );

    if (started) {
      setIsListening(true);
    }
  };

  // Text-To-Speech playback
  const handleSpeak = (msg: ChatMessage) => {
    if (activeSpeakingMsgId === msg.id) {
      speechService.stopSpeaking();
      setActiveSpeakingMsgId(null);
      return;
    }

    setActiveSpeakingMsgId(msg.id);
    speechService.speak(
      msg.text,
      1.0,
      undefined,
      () => setActiveSpeakingMsgId(null),
      () => setActiveSpeakingMsgId(null)
    );
  };

  // Handle image capture from camera modal
  const handleImageCaptured = async (base64Image: string) => {
    setShowCameraModal(false);
    setIsLoading(true);

    speechService.playChime("click");

    const userMsg: ChatMessage = {
      id: `user-img-${Date.now()}`,
      sender: "user",
      text: "📸 [Đã gửi ảnh bài toán từ camera/tệp ảnh]",
      image: base64Image,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      stepHint: 1
    };

    setMessages((prev) => [...prev, userMsg]);

    try {
      const ocrResult = await scanMathProblemImage(base64Image, currentGrade, customApiKey);
      setProblemContext(ocrResult);
      setCurrentStep(1);
      speechService.playChime("step");

      const aiMsg: ChatMessage = {
        id: `ai-ocr-${Date.now()}`,
        sender: "ai",
        text: ocrResult,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        stepHint: 1
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      speechService.playChime("wrong");
      const errMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: "system",
        text: `⚠️ **Không thể quét ảnh:** ${err.message || "Đã xảy ra lỗi khi đọc ảnh."}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, errMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetChat = () => {
    speechService.stopSpeaking();
    setActiveSpeakingMsgId(null);
    setCurrentStep(1);
    setProblemContext("");
    setMessages([
      {
        id: `msg-reset-${Date.now()}`,
        sender: "ai",
        text: `Đã làm mới buổi học! Em muốn cùng thầy chinh phục bài toán nào tiếp theo? Em có thể gõ đề bài hoặc chụp ảnh nhé!`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        stepHint: 1
      }
    ]);
  };

  const currentStepObj = SOCRATIC_STEPS.find((s) => s.stepNumber === currentStep) || SOCRATIC_STEPS[0];

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col h-[calc(100vh-140px)] min-h-[550px] bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
      {/* Socratic Step Header Bar */}
      <div className="bg-slate-900 text-white p-3 sm:px-5 border-b border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          {/* Active Step Info */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-amber-500 flex items-center justify-center text-white text-base shadow-md">
              <i className={`fa-solid ${currentStepObj.icon}`}></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Bước {currentStep}/7: {currentStepObj.title}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 hidden sm:inline-block">
                  {currentStepObj.subtitle}
                </span>
              </div>
              <p className="text-xs text-slate-300 line-clamp-1 max-w-xl">
                {currentStepObj.description}
              </p>
            </div>
          </div>

          {/* Stepper Buttons & Controls */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            {/* Simple dialect toggle */}
            <button
              onClick={() => onToggleDialect(!useSimpleDialect)}
              title="Chuyển chế độ giải thích đơn giản hóa / ví dụ nương rẫy đời sống"
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 ${
                useSimpleDialect
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                  : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
              }`}
            >
              <i className="fa-solid fa-mountain-sun text-amber-400"></i>
              <span className="hidden sm:inline">Ví dụ gần gũi vùng cao</span>
              <span className="sm:hidden">Dân dã</span>
            </button>

            {/* Step navigation */}
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
              <button
                disabled={currentStep <= 1}
                onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                className="px-2 py-1 text-xs text-slate-300 hover:text-white disabled:opacity-30"
                title="Lùi lại 1 bước"
              >
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              <span className="px-2 text-xs font-mono text-amber-300 font-bold">
                {currentStep}/7
              </span>
              <button
                disabled={currentStep >= 7}
                onClick={() => setCurrentStep((prev) => Math.min(7, prev + 1))}
                className="px-2 py-1 text-xs text-slate-300 hover:text-white disabled:opacity-30"
                title="Sang bước tiếp theo"
              >
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>

            {/* Reset Button */}
            <button
              onClick={handleResetChat}
              title="Bắt đầu bài toán mới"
              className="p-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs flex items-center gap-1 transition-colors"
            >
              <i className="fa-solid fa-rotate-right"></i>
              <span className="hidden sm:inline">Bài mới</span>
            </button>
          </div>
        </div>

        {/* 7-Step Progress Segmented Line */}
        <div className="grid grid-cols-7 gap-1 mt-2.5 pt-2 border-t border-slate-800/80">
          {SOCRATIC_STEPS.map((step) => {
            const isCompleted = step.stepNumber < currentStep;
            const isCurrent = step.stepNumber === currentStep;
            return (
              <button
                key={step.stepNumber}
                onClick={() => setCurrentStep(step.stepNumber)}
                className="group flex flex-col items-center cursor-pointer transition-all"
                title={`Bước ${step.stepNumber}: ${step.title}`}
              >
                <div
                  className={`h-1.5 w-full rounded-full transition-all ${
                    isCurrent
                      ? "bg-gradient-to-r from-blue-500 to-amber-500 shadow-sm shadow-amber-500/50"
                      : isCompleted
                      ? "bg-emerald-500"
                      : "bg-slate-700"
                  }`}
                />
                <span
                  className={`text-[10px] mt-1 font-semibold hidden md:block transition-colors ${
                    isCurrent ? "text-amber-400 font-bold" : isCompleted ? "text-emerald-400" : "text-slate-500"
                  }`}
                >
                  B{step.stepNumber}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 p-3 sm:p-5 overflow-y-auto bg-slate-50/60 space-y-4">
        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          const isSystem = msg.sender === "system";

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 sm:gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs text-sm ${
                  isUser
                    ? "bg-blue-600 text-white"
                    : isSystem
                    ? "bg-amber-500 text-white"
                    : "bg-gradient-to-tr from-blue-700 to-amber-500 text-white"
                }`}
              >
                {isUser ? (
                  <i className="fa-solid fa-user"></i>
                ) : isSystem ? (
                  <i className="fa-solid fa-circle-exclamation"></i>
                ) : (
                  <i className="fa-solid fa-graduation-cap"></i>
                )}
              </div>

              {/* Message Content Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-3.5 sm:p-4 shadow-xs ${
                  isUser
                    ? "bg-blue-600 text-white rounded-tr-xs"
                    : isSystem
                    ? "bg-amber-50 border border-amber-200 text-amber-900 rounded-tl-xs"
                    : "bg-white border border-slate-200 text-slate-800 rounded-tl-xs"
                }`}
              >
                {/* Header tag inside bubble */}
                {!isUser && !isSystem && (
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-xs text-slate-500">
                    <span className="font-bold text-blue-700 flex items-center gap-1.5">
                      <i className="fa-solid fa-brain text-amber-500"></i>
                      Thầy giáo Socratic (Bước {msg.stepHint || currentStep}/7)
                    </span>
                    <button
                      onClick={() => handleSpeak(msg)}
                      title={activeSpeakingMsgId === msg.id ? "Dừng đọc" : "Đọc bằng giọng nói tiếng Việt"}
                      className={`px-2 py-0.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-colors ${
                        activeSpeakingMsgId === msg.id
                          ? "bg-amber-500 text-white animate-pulse"
                          : "bg-slate-100 text-slate-600 hover:bg-blue-100 hover:text-blue-700"
                      }`}
                    >
                      <i className={`fa-solid ${activeSpeakingMsgId === msg.id ? "fa-volume-xmark" : "fa-volume-high"}`}></i>
                      <span>{activeSpeakingMsgId === msg.id ? "Đang đọc..." : "Nghe"}</span>
                    </button>
                  </div>
                )}

                {/* Optional Attached Image */}
                {msg.image && (
                  <div className="mb-3 rounded-xl overflow-hidden border border-white/20 max-w-sm">
                    <img src={msg.image} alt="Bài toán đã tải lên" className="w-full h-auto object-cover max-h-56" />
                  </div>
                )}

                {/* Text Content */}
                {isUser ? (
                  <div className={`text-white ${getTextSizeClass()} leading-relaxed whitespace-pre-wrap`}>
                    {msg.text}
                  </div>
                ) : (
                  <div className={getTextSizeClass()}>
                    <MathRenderer content={msg.text} />
                  </div>
                )}

                <div
                  className={`text-[10px] mt-1.5 text-right ${
                    isUser ? "text-blue-100" : "text-slate-400"
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-700 to-amber-500 text-white flex items-center justify-center text-sm shadow-xs">
              <i className="fa-solid fa-brain animate-bounce"></i>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-3.5 shadow-xs flex items-center gap-2 text-slate-600 text-xs sm:text-sm font-semibold">
              <i className="fa-solid fa-spinner fa-spin text-blue-600"></i>
              <span>Thầy cô đang suy nghĩ câu hỏi gợi mở cho em...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Socratic Quick Action Prompt Chips - Ethnic Learner Oriented */}
      <div className="px-3 py-2 bg-amber-50/80 border-t border-amber-200/80 overflow-x-auto flex items-center gap-2 scrollbar-none">
        <span className="text-xs font-bold text-amber-900 whitespace-nowrap hidden sm:inline">
          🌾 Hỏi nhanh:
        </span>
        <button
          onClick={() => handleSendMessage("Thầy cô giải thích bằng ví dụ nương rẫy hoặc đời sống bản làng cho em dễ hiểu với ạ!")}
          className="px-3 py-1.5 bg-white hover:bg-amber-100 border border-amber-300 text-amber-950 text-xs sm:text-sm font-bold rounded-full whitespace-nowrap shadow-2xs transition-colors flex items-center gap-1.5"
        >
          <span>🌾</span> Cho ví dụ nương rẫy bản làng
        </button>
        <button
          onClick={() => handleSendMessage("Bài này bước 1 cần làm gì trước ạ? Thầy cô chỉ manh mối đầu tiên giúp em với!")}
          className="px-3 py-1.5 bg-white hover:bg-blue-100 border border-blue-300 text-blue-950 text-xs sm:text-sm font-bold rounded-full whitespace-nowrap shadow-2xs transition-colors flex items-center gap-1.5"
        >
          <span>🪜</span> Bước 1 làm gì trước ạ?
        </button>
        <button
          onClick={() => handleSendMessage("Em bị mất gốc kiến thức phần này từ lớp dưới, thầy cô nhắc lại thật chậm từ đầu giúp em nhé!")}
          className="px-3 py-1.5 bg-white hover:bg-rose-100 border border-rose-300 text-rose-950 text-xs sm:text-sm font-bold rounded-full whitespace-nowrap shadow-2xs transition-colors flex items-center gap-1.5"
        >
          <span>🐢</span> Em mất gốc, giảng thật chậm giúp em
        </button>
        <button
          onClick={() => handleSendMessage("Em đã hiểu bước này rồi, cho em sang bước tiếp theo với ạ!")}
          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-full whitespace-nowrap shadow-xs transition-colors flex items-center gap-1.5"
        >
          <span>⏩</span> Sang bước {Math.min(7, currentStep + 1)}/7
        </button>
      </div>

      {/* Accessible Big Voice & Camera Touch Bar for Ethnic Students */}
      <div className="p-3 sm:p-4 bg-slate-50 border-t border-slate-200 space-y-3">
        {/* Big Buttons Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Big Voice Button */}
          <button
            type="button"
            id="btn-voice-input-big"
            onClick={toggleVoiceRecording}
            className={`py-3 px-4 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-md transition-all active:scale-98 ${
              isListening
                ? "bg-rose-600 text-white animate-pulse ring-4 ring-rose-300"
                : "bg-gradient-to-r from-rose-500 to-amber-500 text-white hover:from-rose-600 hover:to-amber-600"
            }`}
          >
            <span className="text-xl">{isListening ? "🔴" : "🎙️"}</span>
            <span>
              {isListening
                ? "Đang lắng nghe em nói... (Bấm để gửi)"
                : "Bấm vào đây để nói (Không cần gõ phím)"}
            </span>
          </button>

          {/* Big Camera Button */}
          <button
            type="button"
            id="btn-trigger-camera-big"
            onClick={() => setShowCameraModal(true)}
            className="py-3 px-4 rounded-2xl font-black text-sm sm:text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white flex items-center justify-center gap-2.5 shadow-md transition-all active:scale-98"
          >
            <span className="text-xl">📸</span>
            <span>Chụp ảnh trang vở / sách bài tập</span>
          </button>
        </div>

        {/* Text Input Row (as backup for students who want to type) and Auto-read toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              id="input-socratic-chat"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={
                isListening
                  ? "Đang lắng nghe giọng nói của em..."
                  : "Hoặc gõ câu hỏi / câu trả lời vào đây..."
              }
              className={`w-full py-2.5 pl-3.5 pr-10 text-sm sm:text-base bg-white border rounded-xl focus:outline-none transition-all ${
                isListening
                  ? "border-rose-400 ring-2 ring-rose-200 text-rose-900"
                  : "border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
              }`}
            />
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Auto Read Aloud Toggle */}
            <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-100 select-none">
              <input
                type="checkbox"
                checked={autoRead}
                onChange={(e) => setAutoRead(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded focus:ring-amber-400"
              />
              <span>🔊 Tự động đọc to</span>
            </label>

            {/* Send Button */}
            <button
              type="button"
              id="btn-send-socratic-msg"
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isLoading}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md disabled:opacity-40 transition-all flex items-center gap-1.5"
            >
              <span>Gửi</span>
              <i className="fa-solid fa-paper-plane text-xs"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Camera Modal */}
      <CameraModal
        isOpen={showCameraModal}
        onClose={() => setShowCameraModal(false)}
        onImageCaptured={handleImageCaptured}
      />
    </div>
  );
};
