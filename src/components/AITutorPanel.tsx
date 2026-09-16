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
      text: `Chào em! Cô là **Gia Sư AI Toán Bản Làng GDPT 2018 (Cô giáo Socratic)**. 

Cô ở đây để **dẫn dắt em từng bước Socratic**, kiên nhẫn đồng hành cùng em, **tuyệt đối không làm hộ hay chép đáp án** để em tự tin làm chủ tư duy của mình.

🌾 **Dành riêng cho em:**
1. Em **không cần gõ bàn phím**: Hãy chạm vào nút Micro to màu đỏ bên dưới để nói bằng tiếng Việt, hoặc chụp ảnh bài tập trong vở!
2. Mỗi câu giảng của cô đều có nút **"🔊 Nghe cô đọc"** phát âm bằng **giọng nữ truyền cảm**, đọc chậm rãi, rõ ràng từng lời.
3. Mọi khái niệm trừu tượng đều được cô giải thích bằng hình ảnh ruộng bậc thang, con suối, nhà sàn, máng tre gần gũi.

👉 **Hãy chạm vào nút nói hoặc chụp ảnh bài toán em đang vướng mắc để cô trò mình bắt đầu nhé!**`,
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
    if (fontSize === "xlarge") return "text-xl sm:text-2xl lg:text-3xl leading-relaxed";
    if (fontSize === "large") return "text-lg sm:text-xl lg:text-2xl leading-relaxed font-medium";
    return "text-base sm:text-lg lg:text-xl leading-relaxed";
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
    <div className="w-full flex-1 flex flex-col h-[calc(100vh-115px)] min-h-[640px] bg-white rounded-3xl shadow-xl border-2 border-slate-200/80 overflow-hidden">
      {/* Socratic Step Header Bar */}
      <div className="bg-slate-900 text-white p-3.5 sm:px-6 border-b border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Active Step Info */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500 via-purple-600 to-amber-500 flex items-center justify-center text-white text-xl shadow-md">
              <i className={`fa-solid ${currentStepObj.icon}`}></i>
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-sm font-extrabold uppercase tracking-wider text-amber-400">
                  Bước {currentStep}/7: {currentStepObj.title}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-200 border border-slate-700 hidden sm:inline-block font-semibold">
                  {currentStepObj.subtitle}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 line-clamp-1 max-w-2xl font-medium">
                {currentStepObj.description}
              </p>
            </div>
          </div>

          {/* Stepper Buttons & Controls */}
          <div className="flex items-center gap-2.5 self-end md:self-auto">
            {/* Simple dialect toggle */}
            <button
              onClick={() => onToggleDialect(!useSimpleDialect)}
              title="Chuyển chế độ giải thích đơn giản hóa / ví dụ nương rẫy đời sống"
              className={`px-3 py-1.5 text-xs sm:text-sm font-bold rounded-xl border transition-all flex items-center gap-1.5 shadow-2xs ${
                useSimpleDialect
                  ? "bg-amber-500/25 text-amber-300 border-amber-500/60 ring-1 ring-amber-400/40"
                  : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
              }`}
            >
              <i className="fa-solid fa-mountain-sun text-amber-400"></i>
              <span className="hidden sm:inline">Ví dụ gần gũi vùng cao</span>
              <span className="sm:hidden">Dân dã</span>
            </button>

            {/* Step navigation */}
            <div className="flex items-center bg-slate-800 rounded-xl p-1 border border-slate-700 shadow-inner">
              <button
                disabled={currentStep <= 1}
                onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                className="px-2.5 py-1 text-xs sm:text-sm text-slate-300 hover:text-white disabled:opacity-30 rounded-lg hover:bg-slate-700 transition-colors"
                title="Lùi lại 1 bước"
              >
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              <span className="px-3 text-xs sm:text-sm font-mono text-amber-300 font-extrabold">
                {currentStep}/7
              </span>
              <button
                disabled={currentStep >= 7}
                onClick={() => setCurrentStep((prev) => Math.min(7, prev + 1))}
                className="px-2.5 py-1 text-xs sm:text-sm text-slate-300 hover:text-white disabled:opacity-30 rounded-lg hover:bg-slate-700 transition-colors"
                title="Sang bước tiếp theo"
              >
                <i className="fa-solid fa-chevron-right"></i>
              </button>
            </div>

            {/* Reset Button */}
            <button
              onClick={handleResetChat}
              title="Bắt đầu bài toán mới"
              className="p-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors border border-slate-700 shadow-xs"
            >
              <i className="fa-solid fa-rotate-right"></i>
              <span className="hidden sm:inline">Bài mới</span>
            </button>
          </div>
        </div>

        {/* 7-Step Progress Segmented Line */}
        <div className="grid grid-cols-7 gap-1.5 mt-3 pt-2.5 border-t border-slate-800/80">
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
                  className={`h-2 w-full rounded-full transition-all ${
                    isCurrent
                      ? "bg-gradient-to-r from-rose-500 via-amber-400 to-amber-500 shadow-md shadow-amber-500/50 scale-102"
                      : isCompleted
                      ? "bg-emerald-500"
                      : "bg-slate-700"
                  }`}
                />
                <span
                  className={`text-[11px] mt-1 font-bold hidden md:block transition-colors ${
                    isCurrent ? "text-amber-400" : isCompleted ? "text-emerald-400" : "text-slate-500"
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
      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto bg-slate-50/70 space-y-6">
        {messages.map((msg) => {
          const isUser = msg.sender === "user";
          const isSystem = msg.sender === "system";

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 sm:gap-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar */}
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md text-base sm:text-xl ${
                  isUser
                    ? "bg-gradient-to-br from-blue-600 to-indigo-700 text-white"
                    : isSystem
                    ? "bg-amber-500 text-white"
                    : "bg-gradient-to-tr from-rose-500 via-purple-600 to-amber-500 text-white"
                }`}
              >
                {isUser ? (
                  <i className="fa-solid fa-user"></i>
                ) : isSystem ? (
                  <i className="fa-solid fa-circle-exclamation"></i>
                ) : (
                  <span>👩‍🏫</span>
                )}
              </div>

              {/* Message Content Bubble */}
              <div
                className={`max-w-[94%] sm:max-w-[88%] lg:max-w-[85%] rounded-3xl p-4 sm:p-6 shadow-sm border-2 ${
                  isUser
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500 rounded-tr-xs"
                    : isSystem
                    ? "bg-amber-50 border-amber-300 text-amber-950 rounded-tl-xs"
                    : "bg-white border-slate-200/90 text-slate-900 rounded-tl-xs"
                }`}
              >
                {/* Header tag inside bubble */}
                {!isUser && !isSystem && (
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 text-xs sm:text-sm text-slate-500">
                    <span className="font-extrabold text-rose-600 flex items-center gap-2 text-sm sm:text-base">
                      <span>👩‍🏫</span>
                      <span>Cô giáo Socratic (Bước {msg.stepHint || currentStep}/7)</span>
                    </span>
                    <button
                      onClick={() => handleSpeak(msg)}
                      title={activeSpeakingMsgId === msg.id ? "Dừng đọc" : "Nghe cô đọc bằng giọng nữ tiếng Việt"}
                      className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                        activeSpeakingMsgId === msg.id
                          ? "bg-rose-600 text-white animate-pulse"
                          : "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                      }`}
                    >
                      <i className={`fa-solid ${activeSpeakingMsgId === msg.id ? "fa-volume-xmark" : "fa-volume-high"}`}></i>
                      <span>{activeSpeakingMsgId === msg.id ? "Đang đọc..." : "🔊 Nghe cô đọc"}</span>
                    </button>
                  </div>
                )}

                {/* Optional Attached Image */}
                {msg.image && (
                  <div className="mb-3 rounded-2xl overflow-hidden border-2 border-slate-200 max-w-md shadow-sm">
                    <img src={msg.image} alt="Bài toán đã tải lên" className="w-full h-auto object-cover max-h-72" />
                  </div>
                )}

                {/* Text Content */}
                {isUser ? (
                  <div className={`text-white ${getTextSizeClass()} leading-relaxed whitespace-pre-wrap font-medium`}>
                    {msg.text}
                  </div>
                ) : (
                  <div className={getTextSizeClass()}>
                    <MathRenderer content={msg.text} />
                  </div>
                )}

                <div
                  className={`text-[11px] mt-2.5 text-right font-medium ${
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
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-rose-500 via-purple-600 to-amber-500 text-white flex items-center justify-center text-xl shadow-md">
              <span>👩‍🏫</span>
            </div>
            <div className="bg-white border-2 border-rose-100 rounded-3xl rounded-tl-xs p-4 sm:p-5 shadow-sm flex items-center gap-3 text-slate-700 text-base sm:text-lg font-bold">
              <i className="fa-solid fa-spinner fa-spin text-rose-600 text-xl"></i>
              <span>Cô giáo đang suy nghĩ câu hỏi gợi mở cho em...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Socratic Quick Action Prompt Chips - Ethnic Learner Oriented */}
      <div className="px-3 sm:px-5 py-2.5 bg-amber-50/90 border-t-2 border-amber-200/80 overflow-x-auto flex items-center gap-2.5 scrollbar-none">
        <span className="text-xs sm:text-sm font-extrabold text-amber-950 whitespace-nowrap hidden sm:inline">
          🌾 Hỏi nhanh cô:
        </span>
        <button
          onClick={() => handleSendMessage("Cô giáo giải thích bằng ví dụ nương rẫy hoặc đời sống bản làng cho em dễ hiểu với ạ!")}
          className="px-3.5 sm:px-4 py-2 bg-white hover:bg-amber-100 border-2 border-amber-300 text-amber-950 text-xs sm:text-sm font-bold rounded-2xl whitespace-nowrap shadow-xs transition-colors flex items-center gap-2"
        >
          <span>🌾</span> Cho ví dụ nương rẫy bản làng
        </button>
        <button
          onClick={() => handleSendMessage("Bài này bước 1 cần làm gì trước ạ? Cô chỉ manh mối đầu tiên giúp em với!")}
          className="px-3.5 sm:px-4 py-2 bg-white hover:bg-blue-100 border-2 border-blue-300 text-blue-950 text-xs sm:text-sm font-bold rounded-2xl whitespace-nowrap shadow-xs transition-colors flex items-center gap-2"
        >
          <span>🪜</span> Bước 1 làm gì trước ạ?
        </button>
        <button
          onClick={() => handleSendMessage("Em bị mất gốc kiến thức phần này từ lớp dưới, cô nhắc lại thật chậm từ đầu giúp em nhé!")}
          className="px-3.5 sm:px-4 py-2 bg-white hover:bg-rose-100 border-2 border-rose-300 text-rose-950 text-xs sm:text-sm font-bold rounded-2xl whitespace-nowrap shadow-xs transition-colors flex items-center gap-2"
        >
          <span>🐢</span> Em mất gốc, cô giảng thật chậm giúp em
        </button>
        <button
          onClick={() => handleSendMessage("Em đã hiểu bước này rồi, cô cho em sang bước tiếp theo với ạ!")}
          className="px-3.5 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-2xl whitespace-nowrap shadow-md transition-colors flex items-center gap-2"
        >
          <span>⏩</span> Sang bước {Math.min(7, currentStep + 1)}/7
        </button>
      </div>

      {/* Accessible Big Voice & Camera Touch Bar */}
      <div className="p-3 sm:p-5 bg-gradient-to-b from-white to-slate-50 border-t-2 border-slate-200 space-y-3.5 shadow-lg">
        {/* Big Buttons Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Big Voice Button */}
          <button
            type="button"
            id="btn-voice-input-big"
            onClick={toggleVoiceRecording}
            className={`py-4 sm:py-5 px-6 rounded-2xl font-black text-base sm:text-xl flex items-center justify-center gap-3 shadow-lg transition-all active:scale-98 ${
              isListening
                ? "bg-rose-600 text-white animate-pulse ring-4 ring-rose-300"
                : "bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 text-white hover:brightness-105"
            }`}
          >
            <span className="text-2xl sm:text-3xl">{isListening ? "🔴" : "🎙️"}</span>
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
            className="py-4 sm:py-5 px-6 rounded-2xl font-black text-base sm:text-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:brightness-105 text-white flex items-center justify-center gap-3 shadow-lg transition-all active:scale-98"
          >
            <span className="text-2xl sm:text-3xl">📸</span>
            <span>Chụp ảnh trang vở / sách bài tập</span>
          </button>
        </div>

        {/* Text Input Row and Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
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
                  : "Hoặc gõ câu hỏi / câu trả lời vào đây rồi bấm Gửi..."
              }
              className={`w-full py-3 sm:py-4 pl-4 pr-12 text-base sm:text-lg bg-white border-2 rounded-2xl focus:outline-none transition-all shadow-inner ${
                isListening
                  ? "border-rose-400 ring-4 ring-rose-200 text-rose-900"
                  : "border-slate-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-200/50"
              }`}
            />
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Auto Read Aloud Toggle */}
            <label className="flex items-center gap-2.5 cursor-pointer bg-white px-4 py-3 sm:py-3.5 rounded-2xl border-2 border-slate-200 text-sm sm:text-base font-bold text-slate-700 hover:bg-slate-100 select-none shadow-xs">
              <input
                type="checkbox"
                checked={autoRead}
                onChange={(e) => setAutoRead(e.target.checked)}
                className="w-5 h-5 text-rose-600 rounded focus:ring-rose-400"
              />
              <span className="flex items-center gap-1.5">
                <span>🔊</span>
                <span>Cô tự động đọc</span>
              </span>
            </label>

            {/* Send Button */}
            <button
              type="button"
              id="btn-send-socratic-msg"
              disabled={isLoading || !inputText.trim()}
              onClick={() => handleSendMessage()}
              className="px-6 sm:px-8 py-3.5 sm:py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 disabled:opacity-40 text-slate-950 font-black rounded-2xl text-base sm:text-lg shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 shrink-0"
            >
              <span>Gửi</span>
              <i className="fa-solid fa-paper-plane text-sm"></i>
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
