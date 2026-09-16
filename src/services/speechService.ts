/**
 * Speech Recognition, Text-to-Speech & Web Audio Synth Service
 */

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private recognition: any = null;
  private audioCtx: AudioContext | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      if ("speechSynthesis" in window) {
        this.synth = window.speechSynthesis;
        if (this.synth.onvoiceschanged !== undefined) {
          this.synth.onvoiceschanged = () => {
            try {
              this.synth?.getVoices();
            } catch (e) {}
          };
        }
      }
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRec) {
        this.recognition = new SpeechRec();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = "vi-VN";
      }
    }
  }

  // Web Audio Synthesizer for UI sound effects
  private getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
    }
    if (this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  playChime(type: "correct" | "wrong" | "step" | "click" | "celebrate") {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === "correct") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.25); // G5
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === "step") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === "wrong") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.2);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === "celebrate") {
        // Arpeggio
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.type = "sine";
          o.frequency.value = freq;
          o.connect(g);
          g.connect(ctx.destination);
          const t = now + idx * 0.1;
          g.gain.setValueAtTime(0.2, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
          o.start(t);
          o.stop(t + 0.35);
        });
      } else {
        // click
        osc.type = "sine";
        osc.frequency.setValueAtTime(800, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      }
    } catch (e) {
      console.warn("Audio Context playback error:", e);
    }
  }

  // Text-To-Speech (Tiếng Việt)
  speak(
    text: string,
    rate = 1.0,
    onStart?: () => void,
    onEnd?: () => void,
    onError?: () => void
  ) {
    if (!this.synth) {
      onError?.();
      return;
    }

    this.stopSpeaking();

    // Clean markdown and LaTeX tags for clearer voice reading
    const cleanText = text
      .replace(/\$\$[\s\S]*?\$\$/g, " công thức toán học ")
      .replace(/\$([^\$]+)\$/g, " $1 ")
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, " $1 phần $2 ")
      .replace(/\\sqrt\{([^}]+)\}/g, " căn bậc hai của $1 ")
      .replace(/\\cdot/g, " nhân ")
      .replace(/[#*_`~>-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (!cleanText) {
      onEnd?.();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "vi-VN";
    utterance.rate = rate || 0.95; // Nhẹ nhàng, chậm rãi vừa vặn cho học sinh
    utterance.pitch = 1.18; // Cao độ trong trẻo, tự nhiên của giọng nữ

    // Pick a Vietnamese FEMALE voice if available
    const voices = this.synth.getVoices();
    const viVoices = voices.filter((v) => {
      const l = (v.lang || "").toLowerCase().replace("_", "-");
      return l.startsWith("vi");
    });

    // Tìm kiếm các giọng nữ tiếng Việt phổ biến trên Edge, Chrome, Windows, Android, iOS:
    // "Microsoft HoaiMy Online (Natural) - Vietnamese (Vietnam)" -> Giọng nữ chuẩn cao cấp của Microsoft
    // "Google tiếng Việt"
    // Các giọng có tên chứa "female", "nữ", "hoaimy", "linh", "mai", "chi", "phuong", "my"
    let femaleVoice = viVoices.find((v) => {
      const name = (v.name || "").toLowerCase();
      return (
        name.includes("hoaimy") ||
        name.includes("female") ||
        name.includes("nữ") ||
        name.includes("nu") ||
        name.includes("linh") ||
        name.includes("mai") ||
        name.includes("chi") ||
        name.includes("phuong") ||
        name.includes("my") ||
        name.includes("google")
      );
    });

    // Nếu không tìm thấy theo tên, ưu tiên giọng đầu tiên trong danh sách tiếng Việt
    if (!femaleVoice && viVoices.length > 0) {
      femaleVoice = viVoices[0];
    }

    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    utterance.onstart = () => {
      onStart?.();
    };

    utterance.onend = () => {
      this.currentUtterance = null;
      onEnd?.();
    };

    utterance.onerror = (e) => {
      console.warn("TTS Error:", e);
      this.currentUtterance = null;
      onError?.();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
      this.currentUtterance = null;
    }
  }

  isSpeaking(): boolean {
    return Boolean(this.synth?.speaking);
  }

  // Speech to Text (Voice input)
  startListening(
    onResult: (text: string, isFinal: boolean) => void,
    onError: (err: any) => void,
    onEnd: () => void
  ): boolean {
    if (!this.recognition) {
      onError(new Error("Trình duyệt không hỗ trợ nhận diện giọng nói (SpeechRecognition). Vui lòng dùng Chrome hoặc gõ phím."));
      return false;
    }

    this.recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      if (final) {
        onResult(final, true);
      } else if (interim) {
        onResult(interim, false);
      }
    };

    this.recognition.onerror = (e: any) => {
      onError(e);
    };

    this.recognition.onend = () => {
      onEnd();
    };

    try {
      this.recognition.start();
      return true;
    } catch (e) {
      console.warn("Recognition already started or error:", e);
      return false;
    }
  }

  stopListening() {
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
    }
  }
}

export const speechService = new SpeechService();
