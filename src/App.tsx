import React, { useState, useEffect } from "react";
import { GradeLevel, AppData, AppSettings, Subject, WeakTopic } from "./types";
import { INITIAL_APP_DATA } from "./data/mockData";
import { Header } from "./components/Header";
import { ProgressDashboard } from "./components/ProgressDashboard";
import { AITutorPanel } from "./components/AITutorPanel";
import { DailyChallenge } from "./components/DailyChallenge";
import { SubjectCards } from "./components/SubjectCards";
import { QuestionCard } from "./components/QuestionCard";
import { ScoreBoard } from "./components/ScoreBoard";
import { SettingsModal } from "./components/SettingsModal";
import { GlossaryModal } from "./components/GlossaryModal";
import { DiagnosticModal } from "./components/DiagnosticModal";
import { SocraticGuideModal } from "./components/SocraticGuideModal";
import { speechService } from "./services/speechService";
import { subscribeToAuth, loginWithGoogle, logoutUser, syncDataToCloud, fetchCloudData } from "./services/firebase";
import { MathGame } from "./components/MathGame";

const STORAGE_KEY_DATA = "toan_socratic_app_data_v1";
const STORAGE_KEY_SETTINGS = "toan_socratic_settings_v1";

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Load initial app data
  const [appData, setAppData] = useState<AppData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DATA);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Could not load stored data:", e);
    }
    return INITIAL_APP_DATA;
  });

  // Load initial settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Could not load stored settings:", e);
    }
    return {
      customApiKey: localStorage.getItem("gemini_api_key") || "",
      selectedModel: "gemini-2.5-flash",
      soundEnabled: true,
      speechVoiceRate: 1.0,
      preferredDialect: "simple_ethnic",
      villageFriendlyMode: true,
      fontSize: "large",
      autoReadAloud: true
    };
  });

  const handleCycleFontSize = () => {
    const current = settings.fontSize || "large";
    const nextSize = current === "normal" ? "large" : current === "large" ? "xlarge" : "normal";
    speechService.playChime("click");
    setSettings((prev) => ({ ...prev, fontSize: nextSize }));
  };

  const handleToggleVillageMode = (val: boolean) => {
    speechService.playChime("click");
    setSettings((prev) => ({ ...prev, villageFriendlyMode: val }));
  };

  // Current Grade Level (10, 11, 12)
  const [currentGrade, setCurrentGrade] = useState<GradeLevel>(() => {
    return appData?.userProfile?.gradeLevel || 12;
  });

  // Navigation State
  const [activeTab, setActiveTab] = useState<"dashboard" | "tutor" | "daily15" | "subjects" | "subject-detail" | "quiz" | "score" | "math-lab" | "game">("dashboard");

  // Quiz Mode State
  const [activeQuizSubject, setActiveQuizSubject] = useState<Subject | null>(null);
  const [activeQuizResult, setActiveQuizResult] = useState<{
    score: number;
    total: number;
    correct: number;
    timeSpent: number;
    mistakes: Array<{ question: string; chosen: string; correct: string; topic: string }>;
  } | null>(null);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [isDiagnosticOpen, setIsDiagnosticOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [diagnosticMistakes, setDiagnosticMistakes] = useState<Array<{ question: string; chosen: string; correct: string; topic: string }>>([]);

  // Auto-save app data to LocalStorage and Cloud
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(appData));
      if (currentUser) {
        syncDataToCloud(currentUser.uid, appData);
      }
    } catch (e) {
      console.error("Failed to save to localStorage:", e);
    }
  }, [appData, currentUser]);

  // Auth Effect
  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (user) => {
      setCurrentUser(user);
      if (user) {
        const cloudData = await fetchCloudData(user.uid);
        if (cloudData) {
          setAppData(cloudData);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Auto-save settings to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error("Failed to save settings:", e);
    }
  }, [settings]);

  // Handle grade change
  const handleGradeChange = (grade: GradeLevel) => {
    speechService.playChime("click");
    setCurrentGrade(grade);
    setAppData((prev) => ({
      ...prev,
      userProfile: {
        ...(prev.userProfile || { name: "Học sinh", gradeLevel: grade }),
        gradeLevel: grade
      }
    }));
  };

  // Handle minutes spent
  const handleStudyTimeSpent = (minutes: number) => {
    setAppData((prev) => ({
      ...prev,
      progress: {
        ...prev.progress,
        todayMinutesSpent: prev.progress.todayMinutesSpent + minutes
      }
    }));
  };

  // Start 15-min daily challenge
  const handleStart15Min = () => {
    speechService.playChime("click");
    setActiveTab("daily15");
  };

  // Finish 15-minute challenge
  const handleFinish15Min = (score: number, total: number, correct: number, timeSpent: number) => {
    const mins = Math.max(1, Math.ceil(timeSpent / 60));
    setAppData((prev) => {
      const newAttempts = prev.progress.totalAttempts + 1;
      const newAvg = Math.round(((prev.progress.averageScore * prev.progress.totalAttempts + score) / newAttempts) * 10) / 10;
      const newStreak = prev.progress.streakDays + 1;
      const newBadges = [...prev.progress.badges];
      if (newStreak >= 5 && !newBadges.includes("Chiến Binh 5 Ngày Liên Tiếp")) {
        newBadges.push("Chiến Binh 5 Ngày Liên Tiếp");
      }

      return {
        ...prev,
        progress: {
          ...prev.progress,
          streakDays: newStreak,
          totalAttempts: newAttempts,
          averageScore: newAvg,
          todayMinutesSpent: prev.progress.todayMinutesSpent + mins,
          badges: newBadges
        },
        sessions: [
          {
            id: `ses-${Date.now()}`,
            subjectId: `daily-15-${currentGrade}`,
            subjectName: `Lộ trình 15 phút Lớp ${currentGrade}`,
            score,
            totalQuestions: total,
            correctAnswers: correct,
            date: new Date().toLocaleDateString("vi-VN"),
            timeSpentSeconds: timeSpent
          },
          ...prev.sessions
        ]
      };
    });
  };

  // Start a Quiz for a specific Subject
  const handleSelectSubjectForQuiz = (subject: Subject) => {
    speechService.playChime("click");
    setActiveQuizSubject(subject);
    setActiveTab("quiz");
  };

  // Finish Quiz
  const handleFinishQuiz = (
    score: number,
    total: number,
    correct: number,
    timeSpent: number,
    mistakes: Array<{ question: string; chosen: string; correct: string; topic: string }>
  ) => {
    const mins = Math.max(1, Math.ceil(timeSpent / 60));

    // Update subject progress
    if (activeQuizSubject) {
      setAppData((prev) => {
        const updatedSubjects = prev.subjects.map((sub) => {
          if (sub.id === activeQuizSubject.id) {
            return {
              ...sub,
              completedCount: Math.min(sub.questionsCount, sub.completedCount + correct)
            };
          }
          return sub;
        });

        const newAttempts = prev.progress.totalAttempts + 1;
        const newAvg = Math.round(((prev.progress.averageScore * prev.progress.totalAttempts + score) / newAttempts) * 10) / 10;

        return {
          ...prev,
          subjects: updatedSubjects,
          progress: {
            ...prev.progress,
            totalAttempts: newAttempts,
            averageScore: newAvg,
            todayMinutesSpent: prev.progress.todayMinutesSpent + mins
          },
          sessions: [
            {
              id: `ses-${Date.now()}`,
              subjectId: activeQuizSubject.id,
              subjectName: activeQuizSubject.name,
              score,
              totalQuestions: total,
              correctAnswers: correct,
              date: new Date().toLocaleDateString("vi-VN"),
              timeSpentSeconds: timeSpent
            },
            ...prev.sessions
          ]
        };
      });
    }

    setActiveQuizResult({
      score,
      total,
      correct,
      timeSpent,
      mistakes
    });
    setActiveTab("score");
  };

  // Ask Socratic Tutor about a specific question or subject
  const handleAskTutor = (text: string) => {
    speechService.playChime("click");
    setActiveTab("tutor");
    // Trigger prompt directly in panel
  };

  // Save detected weak topic
  const handleSaveWeakTopic = (weakTopic: WeakTopic) => {
    setAppData((prev) => {
      const exists = prev.progress.weakTopics.some((w) => w.topicName === weakTopic.topicName);
      if (exists) return prev;
      return {
        ...prev,
        progress: {
          ...prev.progress,
          weakTopics: [weakTopic, ...prev.progress.weakTopics]
        }
      };
    });
  };

  // Reset data to initial mock data
  const handleResetData = () => {
    setAppData(INITIAL_APP_DATA);
    localStorage.removeItem(STORAGE_KEY_DATA);
    speechService.playChime("celebrate");
  };

  // Questions for active quiz
  const currentQuizQuestions = activeQuizSubject
    ? appData.questions.filter((q) => q.subjectId === activeQuizSubject.id)
    : appData.questions.filter((q) => q.grade === currentGrade);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800 font-sans antialiased selection:bg-amber-200">
      {/* Top Application Header */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => {
          speechService.playChime("click");
          setActiveTab(tab);
        }}
        currentGrade={currentGrade}
        onGradeChange={handleGradeChange}
        streakDays={appData.progress.streakDays}
        todayMinutes={appData.progress.todayMinutesSpent}
        dailyGoalMinutes={appData.progress.dailyGoalMinutes || 15}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenGlossary={() => setIsGlossaryOpen(true)}
        onOpenDiagnostic={() => {
          setDiagnosticMistakes([]);
          setIsDiagnosticOpen(true);
        }}
        onOpenGuide={() => setIsGuideOpen(true)}
        villageFriendlyMode={settings.villageFriendlyMode !== false}
        onToggleVillageMode={handleToggleVillageMode}
        fontSize={settings.fontSize || "large"}
        onCycleFontSize={handleCycleFontSize}
        onStartVoiceTutor={() => {
          speechService.playChime("click");
          setActiveTab("tutor");
        }}
        currentUser={currentUser}
        onLogin={loginWithGoogle}
        onLogout={logoutUser}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-3 sm:p-5 lg:p-6 flex flex-col">
        {activeTab === "dashboard" && (
          <ProgressDashboard
            appData={appData}
            currentGrade={currentGrade}
            onStart15Min={handleStart15Min}
            onOpenTutor={() => {
              speechService.playChime("click");
              setActiveTab("tutor");
            }}
            onOpenSubjects={() => {
              speechService.playChime("click");
              setActiveTab("subjects");
            }}
            onOpenDiagnostic={() => {
              setDiagnosticMistakes([]);
              setIsDiagnosticOpen(true);
            }}
            onOpenGlossary={() => setIsGlossaryOpen(true)}
            onStartVoiceTutor={() => {
              speechService.playChime("click");
              setActiveTab("tutor");
            }}
            onStartCameraScan={() => {
              speechService.playChime("click");
              setActiveTab("tutor");
            }}
            villageFriendlyMode={settings.villageFriendlyMode !== false}
          />
        )}

        {activeTab === "tutor" && (
          <AITutorPanel
            currentGrade={currentGrade}
            customApiKey={settings.customApiKey}
            useSimpleDialect={settings.preferredDialect === "simple_ethnic"}
            onToggleDialect={(val) =>
              setSettings((prev) => ({
                ...prev,
                preferredDialect: val ? "simple_ethnic" : "standard"
              }))
            }
            onStudyTimeSpent={handleStudyTimeSpent}
            onOpenSettings={() => setIsSettingsOpen(true)}
            fontSize={settings.fontSize || "large"}
            villageFriendlyMode={settings.villageFriendlyMode !== false}
          />
        )}

        {activeTab === "daily15" && (
          <DailyChallenge
            currentGrade={currentGrade}
            allQuestions={appData.questions}
            onFinishSession={handleFinish15Min}
            onAskTutorAboutQuestion={handleAskTutor}
            fontSize={settings.fontSize || "large"}
          />
        )}

        {activeTab === "subjects" && (
          <SubjectCards
            currentGrade={currentGrade}
            subjects={appData.subjects}
            onSelectSubjectForQuiz={handleSelectSubjectForQuiz}
            onAskTutorSubject={handleAskTutor}
          />
        )}

        {activeTab === "quiz" && activeQuizSubject && (
          <QuestionCard
            subject={activeQuizSubject}
            questions={currentQuizQuestions.length > 0 ? currentQuizQuestions : appData.questions.slice(0, 5)}
            onFinishQuiz={handleFinishQuiz}
            onExitQuiz={() => setActiveTab("subjects")}
            onAskSocratic={handleAskTutor}
            fontSize={settings.fontSize || "large"}
          />
        )}

        {activeTab === "score" && activeQuizResult && activeQuizSubject && (
          <ScoreBoard
            score={activeQuizResult.score}
            totalQuestions={activeQuizResult.total}
            correctAnswers={activeQuizResult.correct}
            timeSpent={activeQuizResult.timeSpent}
            subjectName={activeQuizSubject.name}
            mistakes={activeQuizResult.mistakes}
            onRetake={() => setActiveTab("quiz")}
            onBackToDashboard={() => setActiveTab("dashboard")}
            onOpenDiagnosticWithMistakes={(mistakes) => {
              setDiagnosticMistakes(mistakes);
              setIsDiagnosticOpen(true);
            }}
          />
        )}

        {activeTab === "math-lab" && (
          <div className="w-full h-[85vh] bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
            <iframe src="/math_lab.html" title="Phòng Thí Nghiệm Toán" className="w-full h-full border-none" allowFullScreen />
          </div>
        )}

        {/* GAMIFICATION - Mini Game */}
        {activeTab === "game" && (
          <div className="p-4 sm:p-6 lg:p-8 mt-16 pb-24 h-full flex flex-col justify-center">
            <MathGame />
          </div>
        )}
      </main>

      {/* Persistent Bottom Mobile Bar for fast switching */}
      <nav className="sm:hidden sticky bottom-0 z-40 bg-white border-t border-slate-200 px-3 py-2 flex items-center justify-around shadow-lg">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold ${
            activeTab === "dashboard" ? "text-blue-600" : "text-slate-500"
          }`}
        >
          <i className="fa-solid fa-chart-pie text-base"></i>
          <span>Tổng quan</span>
        </button>

        <button
          onClick={() => setActiveTab("tutor")}
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold ${
            activeTab === "tutor" ? "text-blue-600" : "text-slate-500"
          }`}
        >
          <div className="w-8 h-8 -mt-4 rounded-full bg-gradient-to-r from-blue-600 to-amber-500 text-white flex items-center justify-center shadow-md">
            <i className="fa-solid fa-brain text-sm"></i>
          </div>
          <span>Gia sư AI</span>
        </button>

        <button
          onClick={() => setActiveTab("daily15")}
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold ${
            activeTab === "daily15" ? "text-blue-600" : "text-slate-500"
          }`}
        >
          <i className="fa-solid fa-stopwatch text-base"></i>
          <span>15 phút</span>
        </button>

        <button
          onClick={() => setActiveTab("subjects")}
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold ${
            activeTab === "subjects" || activeTab === "quiz" ? "text-blue-600" : "text-slate-500"
          }`}
        >
          <i className="fa-solid fa-layer-group text-base"></i>
          <span>Chuyên đề</span>
        </button>

        <button
          onClick={() => setActiveTab("math-lab")}
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold ${
            activeTab === "math-lab" ? "text-blue-600" : "text-slate-500"
          }`}
        >
          <i className="fa-solid fa-flask text-base"></i>
          <span>Thí nghiệm</span>
        </button>

        <button
          onClick={() => setActiveTab("game")}
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold ${
            activeTab === "game" ? "text-amber-600" : "text-slate-500"
          }`}
        >
          <i className={`text-base fa-solid fa-gamepad ${activeTab === "game" ? "animate-bounce" : ""}`}></i>
          <span>Game</span>
        </button>
      </nav>

      {/* Global Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
        appData={appData}
        onImportData={setAppData}
        onResetData={handleResetData}
      />

      <GlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
        onAskTutorTerm={handleAskTutor}
      />

      <DiagnosticModal
        isOpen={isDiagnosticOpen}
        onClose={() => setIsDiagnosticOpen(false)}
        customApiKey={settings.customApiKey}
        initialMistakes={diagnosticMistakes}
        onSaveWeakTopic={handleSaveWeakTopic}
      />

      <SocraticGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onStartTutor={() => setActiveTab("tutor")}
      />
    </div>
  );
}

