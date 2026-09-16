import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";

export const MathGame: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [score, setScore] = useState(0);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(0);
  const [options, setOptions] = useState<number[]>([]);

  const generateQuestion = () => {
    const operations = ['+', '-', '*'];
    const op = operations[Math.floor(Math.random() * operations.length)];
    let a, b, ans;

    if (op === '+') {
      a = Math.floor(Math.random() * 50) + 10;
      b = Math.floor(Math.random() * 50) + 10;
      ans = a + b;
    } else if (op === '-') {
      a = Math.floor(Math.random() * 50) + 20;
      b = Math.floor(Math.random() * 20) + 1;
      ans = a - b;
    } else {
      a = Math.floor(Math.random() * 10) + 2;
      b = Math.floor(Math.random() * 10) + 2;
      ans = a * b;
    }

    setQuestion(`${a} ${op} ${b} = ?`);
    setAnswer(ans);

    // Generate options
    const opts = [ans];
    while (opts.length < 4) {
      const wrong = ans + Math.floor(Math.random() * 10) - 5;
      if (!opts.includes(wrong) && wrong !== ans) {
        opts.push(wrong);
      }
    }
    setOptions(opts.sort(() => Math.random() - 0.5));
  };

  const startGame = () => {
    setIsPlaying(true);
    setScore(0);
    setTimeLeft(60);
    generateQuestion();
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && isPlaying) {
      setIsPlaying(false);
      if (score > 5) {
        confetti({ particleCount: 100, spread: 70 });
      }
    }
    return () => clearTimeout(timer);
  }, [timeLeft, isPlaying, score]);

  const handleAnswer = (selected: number) => {
    if (selected === answer) {
      setScore((prev) => prev + 1);
    } else {
      setScore((prev) => Math.max(0, prev - 1));
    }
    generateQuestion();
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-gradient-to-br from-indigo-50 to-purple-100 rounded-3xl shadow-lg border border-purple-200 text-center">
      <h2 className="text-3xl font-black text-purple-900 mb-4">🏆 Đấu Trường 60s</h2>
      <p className="text-sm text-purple-700 mb-6">Trò chơi rèn luyện phản xạ tính toán cực nhanh. Trả lời đúng +1 điểm, sai -1 điểm.</p>
      
      {!isPlaying && timeLeft === 60 ? (
        <button onClick={startGame} className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-lg shadow-md transition-transform active:scale-95">
          🚀 Bắt Đầu Ngay
        </button>
      ) : !isPlaying && timeLeft === 0 ? (
        <div className="space-y-4">
          <div className="text-2xl font-bold text-slate-800">Hết Giờ!</div>
          <div className="text-4xl font-black text-purple-700">Điểm của bạn: {score}</div>
          <button onClick={startGame} className="mt-4 px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md transition-transform active:scale-95">
            🔄 Chơi lại
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center px-4">
            <div className="text-xl font-bold text-rose-600">⏱️ {timeLeft}s</div>
            <div className="text-xl font-bold text-emerald-600">⭐ {score}</div>
          </div>
          
          <div className="py-10 bg-white rounded-2xl shadow-inner border border-slate-200">
            <div className="text-5xl font-black text-slate-800 tracking-wider">
              {question}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(opt)}
                className="py-4 bg-white hover:bg-purple-50 text-purple-900 border-2 border-purple-300 rounded-2xl text-2xl font-black shadow-sm transition-transform active:scale-95"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
