/**
 * Gemini AI Integration Service with Dual Architecture (Server Proxy + Client Fallback)
 * Socratic 7-step coaching, Math OCR & Knowledge Gap Diagnosis
 */

const FALLBACK_MODELS = [
  "gemini-2.5-flash",
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
  "gemini-3.1-pro-preview"
];

export interface GeminiCallOptions {
  prompt: string;
  image?: {
    data: string;
    mimeType?: string;
  };
  model?: string;
  systemInstruction?: string;
  temperature?: number;
  userApiKey?: string;
}

export async function callGeminiService(options: GeminiCallOptions): Promise<string> {
  const {
    prompt,
    image,
    model = "gemini-2.5-flash",
    systemInstruction,
    temperature = 0.7,
    userApiKey
  } = options;

  // 1. First attempt: call full-stack server endpoint /api/gemini/generate
  try {
    const res = await fetch("/api/gemini/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        image,
        model,
        systemInstruction,
        temperature,
        userApiKey
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.text) {
        return data.text;
      }
    } else {
      const errData = await res.json().catch(() => ({}));
      console.warn("Server Gemini route error response:", errData);
      if (errData.error && !userApiKey) {
        // If server says API key missing and user has no custom key, throw friendly message
        throw new Error(errData.error);
      }
    }
  } catch (serverErr: any) {
    console.warn("Server proxy failed or running in client-only mode, attempting direct client fallback...", serverErr);
  }

  // 2. Direct client fallback (Required if running on static host or if user entered their own API Key)
  const apiKey = userApiKey || localStorage.getItem("gemini_api_key");
  if (!apiKey) {
    throw new Error("Vui lòng nhập Google Gemini API Key trong phần Cài đặt (nút bánh răng trên thanh công cụ) để kích hoạt trí tuệ nhân tạo!");
  }

  const modelList = [model, ...FALLBACK_MODELS.filter(m => m !== model)];
  let lastError: any = null;

  for (const m of modelList) {
    try {
      const parts: any[] = [];
      if (image && image.data) {
        let base64 = image.data;
        let mime = image.mimeType || "image/jpeg";
        if (base64.includes(";base64,")) {
          const split = base64.split(";base64,");
          mime = split[0].replace("data:", "") || mime;
          base64 = split[1];
        }
        parts.push({
          inlineData: {
            mimeType: mime,
            data: base64
          }
        });
      }
      parts.push({ text: prompt });

      const bodyPayload: any = {
        contents: [{ parts }],
        generationConfig: {
          temperature,
          maxOutputTokens: 4096
        }
      };

      if (systemInstruction) {
        bodyPayload.systemInstruction = {
          parts: [{ text: systemInstruction }]
        };
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bodyPayload)
        }
      );

      if ([500, 503, 504].includes(response.status)) {
        console.warn(`Model ${m} status ${response.status}, trying next fallback...`);
        continue;
      }
      if (response.status === 401 || response.status === 403) {
        throw new Error("API Key không hợp lệ hoặc không có quyền truy cập.");
      }
      if (response.status === 429) {
        throw new Error("Đã hết hạn mức (quota) hoặc vượt quá tần suất gọi API.");
      }
      if (!response.ok) {
        throw new Error(`Lỗi kết nối Gemini API (${response.status})`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text;
    } catch (err: any) {
      lastError = err;
      if (err.message.includes("API Key") || err.message.includes("quota")) {
        throw err;
      }
    }
  }

  throw lastError || new Error("Không thể kết nối với dịch vụ Gemini AI sau các lần thử dự phòng.");
}

/**
 * 7-Step Socratic Tutor Prompt Builder
 */
export async function askSocraticTutor(params: {
  problemContext: string;
  studentInput: string;
  currentStep: number;
  grade: number;
  useSimpleDialect: boolean;
  userApiKey?: string;
}): Promise<string> {
  const { problemContext, studentInput, currentStep, grade, useSimpleDialect, userApiKey } = params;

  const systemInstruction = `Bạn là Trợ lý Gia sư Toán THPT GDPT 2018 mang tên "Thầy Giáo Socratic", chuyên đồng hành cùng học sinh mất gốc và học sinh dân tộc thiểu số/vùng cao.
NGUYÊN TẮC BẤT DI BẤT DỊCH CỦA BẠN:
1. TUYỆT ĐỐI KHÔNG GIẢI HỘ, KHÔNG NÓI NGAY ĐÁP ÁN CUỐI CÙNG!
2. Bạn phải dẫn dắt học sinh theo PHƯƠNG PHÁP SOCRATIC 7 BƯỚC:
   - Bước 1: Giúp học sinh gỡ rối đề bài (Đề cho gì? Cần tìm gì?)
   - Bước 2: Nhắc lại công thức/định nghĩa gốc rễ bị hổng từ lớp dưới
   - Bước 3: Đặt câu hỏi gợi ý bước biến đổi đầu tiên
   - Bước 4: Kiểm tra xem học sinh đã hiểu và tự viết được phép tính chưa
   - Bước 5: Tháo gỡ các lỗi sai kinh điển hoặc bẫy điều kiện
   - Bước 6: Khích lệ học sinh tự tính ra kết quả cuối
   - Bước 7: Đúc kết bài học cốt lõi & cho 1 bài tương tự ngắn để củng cố
3. PHONG CÁCH DIỄN ĐẠT:
   ${useSimpleDialect ? "- CỰC KỲ DỄ HIỂU, DÂN DÃ, GẦN GŨI VỚI ĐỜI SỐNG (ví dụ như ruộng bậc thang, nhà sàn, đo đạc nương rẫy, đong thóc, đếm hạt ngô, dốc đèo). Tránh dùng từ ngữ hàn lâm gây sợ hãi." : "- Thân thiện, sư phạm, chuẩn mực chương trình GDPT 2018."}
4. Công thức toán học PHẢI viết bằng LaTeX trong dấu $...$ hoặc $$...$$.
5. Luôn kết thúc câu trả lời bằng MỘT CÂU HỎI MỞ hoặc MỘT LỜI MỜI HỌC SINH TỰ LÀM THỬ, khen ngợi sự kiên trì của học sinh!`;

  const prompt = `[THÔNG TIN BÀI TOÁN TOÁN THPT LỚP ${grade}]
Nội dung bài toán: ${problemContext}

[TRẠNG THÁI HIỆN TẠI]
Bước Socratic đang thực hiện: Bước ${currentStep}/7
Học sinh phản hồi/hỏi: "${studentInput}"

Hãy trả lời học sinh bằng vai trò gia sư Socratic bám sát Bước ${currentStep}, khích lệ tinh thần và dẫn dắt học sinh tự tư duy:`;

  return callGeminiService({
    prompt,
    systemInstruction,
    temperature: 0.6,
    userApiKey
  });
}

/**
 * Scan math problem from camera image / upload
 */
export async function scanMathProblemImage(base64Image: string, grade: number, userApiKey?: string): Promise<string> {
  const prompt = `Hãy đọc bức ảnh chụp bài tập toán này và thực hiện các việc sau:
1. Trích xuất chính xác đề bài toán (dùng mã LaTeX cho công thức toán).
2. Tóm tắt nhanh:
   - Giả thiết (Đề cho gì):
   - Kết luận (Cần tìm/chứng minh gì):
3. Phân tích xem bài này thuộc kiến thức Toán lớp mấy theo CT GDPT 2018.
4. Bắt đầu ngay Bước 1 của phương pháp Socratic: Đặt một câu hỏi gợi mở đầu tiên thật nhẹ nhàng, giúp học sinh nhận diện bước đi ban đầu mà không hề giải hộ.`;

  const systemInstruction = `Bạn là chuyên gia nhận diện đề thi Toán THPT OCR và gia sư Socratic. Hãy trình bày ngắn gọn, rõ ràng, chia đề mục đẹp mắt với LaTeX.`;

  return callGeminiService({
    prompt,
    image: {
      data: base64Image
    },
    systemInstruction,
    temperature: 0.4,
    userApiKey
  });
}

/**
 * Diagnose knowledge gaps from quiz mistakes
 */
export async function diagnoseMistakesAI(mistakes: Array<{ question: string; chosen: string; correct: string; topic: string }>, userApiKey?: string): Promise<string> {
  const prompt = `Dưới đây là các câu hỏi mà học sinh làm sai trong buổi tự học:
${JSON.stringify(mistakes, null, 2)}

Hãy đóng vai trò Bác Sĩ Kiến Thức Toán THPT:
1. Chẩn đoán chính xác: Lỗ hổng gốc rễ nằm ở đâu? (Có phải hổng kiến thức lớp dưới như Lớp 8 hằng đẳng thức, Lớp 9 căn thức, Lớp 10 dấu tam thức không?)
2. Kê "Đơn thuốc tự học 15 phút": 3 việc cụ thể học sinh cần làm ngay hôm nay để lấp lỗ hổng này.
3. Cho 1 ví dụ hình ảnh đời sống dễ nhớ để học sinh không bao giờ mắc lại lỗi này nữa.`;

  return callGeminiService({
    prompt,
    systemInstruction: "Bạn là chuyên gia chẩn đoán lỗ hổng kiến thức Toán THPT, ấm áp, thấu cảm với học sinh mất gốc.",
    temperature: 0.5,
    userApiKey
  });
}
