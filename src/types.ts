/**
 * Data Schema and TypeScript interfaces for Trợ lý Tự học Toán THPT GDPT 2018
 */

export type GradeLevel = 10 | 11 | 12;

export interface Subject {
  id: string;
  grade: GradeLevel;
  name: string;
  icon: string;
  category: "Đại số & Giải tích" | "Hình học & Đo lường" | "Thống kê & Xác suất" | "Chuyên đề học tập";
  description: string;
  questionsCount: number;
  completedCount: number;
  bookReference?: string; // Ví dụ: "SGK Kết nối tri thức - Chương I"
  chapterNumber?: number;
}

export type QuestionDifficulty = "Nhận biết" | "Thông hiểu" | "Vận dụng" | "Vận dụng cao";

export interface Question {
  id: string;
  subjectId: string;
  grade: GradeLevel;
  content: string;
  type: "multiple_choice" | "true_false" | "short_answer";
  options: string[];
  correctAnswer: number; // Index in options (0, 1, 2, 3)
  explanation: string;
  difficulty: QuestionDifficulty;
  prerequisiteHint?: string; // Lỗ hổng lớp dưới liên quan (ví dụ: Kỹ năng biến đổi phân thức lớp 8)
  realLifeAnalogy?: string; // Ví dụ đời sống gần gũi cho học sinh vùng cao
  bookSource?: string; // Ví dụ: "SGK Toán 10 KNTT - Bài 16", "SBT Toán 12 KNTT"
}

export interface Session {
  id: string;
  subjectId: string;
  subjectName: string;
  score: number; // out of 10
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number; // in seconds
  date: string; // ISO format or formatted string
}

export interface WeakTopic {
  topicId: string;
  topicName: string;
  missedCount: number;
  rootCauseGrade: number; // Ví dụ lỗ hổng gốc từ lớp 9
  advice: string;
}

export interface ProgressData {
  totalAttempts: number;
  averageScore: number;
  streakDays: number;
  lastActiveDate: string;
  dailyGoalMinutes: number;
  todayMinutesSpent: number;
  weakTopics: WeakTopic[];
  badges: string[]; // ["Khởi đầu kiên định", "7 ngày kiên trì", "Xoá sổ mất gốc", ...]
}

export interface AppSettings {
  theme: "light" | "dark";
  soundEnabled: boolean;
  speechVoiceRate: number; // 0.8 to 1.2 (default 0.85 for ethnic learners)
  autoSave: boolean;
  selectedModel: string;
  customApiKey: string;
  preferredDialect: "standard" | "simple_ethnic"; // Phong cách giải thích đơn giản hóa
  fontSize: "normal" | "large" | "xlarge"; // Cỡ chữ to thân thiện, dễ đọc
  villageFriendlyMode: boolean; // Chế độ Trợ Năng Bản Làng (nút to, giọng đọc 1 chạm, từ ngữ mộc mạc)
  autoReadAloud: boolean; // Tự động đọc câu trả lời của thầy cô AI
}

export interface AppData {
  subjects: Subject[];
  questions: Question[];
  sessions: Session[];
  progress: ProgressData;
  settings: AppSettings;
}

export interface SocraticStep {
  stepNumber: number;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai" | "system";
  text: string;
  timestamp: string;
  image?: string;
  stepHint?: number; // 1 to 7
  mathFormula?: string;
  isAudioPlaying?: boolean;
}

export interface GlossaryTerm {
  id: string;
  term: string;
  grade: GradeLevel;
  standardDef: string; // Định nghĩa chuẩn GDPT 2018
  simpleDef: string; // Dân dã dễ hiểu
  analogy: string; // Ví dụ nương rẫy, nhà sàn, đời sống thực tế
  relatedFormula?: string;
  bookSource?: string; // Ví dụ: "SGK Toán 10 KNTT - Trang 103"
}
