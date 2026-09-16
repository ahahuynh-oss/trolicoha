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

  // 2. Direct client fallback (if user entered their own API Key)
  const apiKey = userApiKey || (typeof window !== "undefined" ? localStorage.getItem("gemini_api_key") : "");
  
  if (!apiKey) {
    // Tự động kích hoạt Gia sư Socratic Bản Làng thông minh nếu học sinh chưa có API Key
    return generateLocalSocraticResponse(options);
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
      if (!response.ok) {
        console.warn(`Gemini API error ${response.status}, falling back to local Socratic engine...`);
        return generateLocalSocraticResponse(options);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) return text;
    } catch (err: any) {
      lastError = err;
      console.warn("Client Gemini call error, falling back to local Socratic engine:", err);
      return generateLocalSocraticResponse(options);
    }
  }

  return generateLocalSocraticResponse(options);
}

/**
 * Hệ Thống Gia Sư AI Socratic Bản Làng Nội Bộ (Hoạt động 100% miễn phí không cần API Key)
 */
function generateLocalSocraticResponse(options: GeminiCallOptions): string {
  const prompt = (options.prompt || "").toLowerCase();
  const stepMatch = options.prompt.match(/Bước (\d)\/7/);
  const currentStep = stepMatch ? parseInt(stepMatch[1], 10) : 1;

  // Xử lý khi học sinh yêu cầu ví dụ nương rẫy bản làng
  if (prompt.includes("nương rẫy") || prompt.includes("bản làng") || prompt.includes("ví dụ")) {
    return `🌾 **Ví dụ bản làng mộc mạc cho em dễ hình dung nhé:**

- **Hình ảnh thực tế:** Hãy tưởng tượng bài toán này giống như việc em đang **dẫn nước từ khe suối trên núi cao về bể nước của nhà sàn**:
  - Đoạn ống tre dẫn nước dốc xuống thoai thoải chính là hàm số đồng biến/nghịch biến (đạo hàm mang dấu dương hoặc âm).
  - Vị trí đáy máng nơi nước lắng lại trước khi chảy tiếp chính là **điểm cực trị** (nơi độ dốc bằng $0$).
  - Bể nước đầy dần theo thời gian chính là ý nghĩa của **nguyên hàm và tích phân** (tích lũy từng gáo nước nhỏ thành cả bể lớn)!

👉 Bây giờ, em hãy nhìn lại bài toán của mình: Em có thấy yếu tố nào đang "tăng dần" hay "giảm dần" không? Hãy thử nói hoặc viết cho cô nghe nhé!`;
  }

  // Xử lý khi học sinh báo mất gốc
  if (prompt.includes("mất gốc") || prompt.includes("giảng thật chậm") || prompt.includes("nhắc lại")) {
    return `❤️ **Em đừng lo lắng nhé! Rất nhiều bạn ban đầu cũng thấy bỡ ngỡ như em.**

Toán THPT tuy nhìn có vẻ nhiều ký hiệu lạ, nhưng gốc rễ đều bắt nguồn từ những phép tính quen thuộc:
1. **Quy tắc dấu căn:** $\\sqrt{A}$ chỉ có nghĩa khi con số $A$ bên trong không bị âm ($A \\ge 0$). Giống như gùi ngô thì không thể có số bắp ngô âm vậy!
2. **Quy tắc mẫu số:** Biểu thức $\\frac{A}{B}$ thì mẫu $B$ tuyệt đối phải khác $0$ (vì không ai chia đều đồ vật cho $0$ người được).
3. **Phép đặt ẩn phụ:** Khi thấy một cụm phức tạp lặp lại, ta cứ tạm gọi nó là $t$ để nhìn bài toán gọn gàng hơn.

👉 Em hãy hít thở thật sâu, đọc lại đề bài một lần nữa và cho cô biết: Em đang thấy chỗ nào làm em vướng mắc nhất? Cô sẽ cùng em gỡ từng nút thắt một nhé!`;
  }

  // Xử lý khi học sinh hỏi bước 1 làm gì
  if (prompt.includes("bước 1") || prompt.includes("manh mối") || prompt.includes("làm gì trước")) {
    return `🪜 **Hướng dẫn Bước 1: Nhận diện đề bài & Tìm manh mối then chốt:**

1. **Gạch chân giả thiết:** Đề bài đã cho em những dữ kiện cụ thể nào (hàm số, tọa độ điểm, góc, hay phương trình)?
2. **Xác định mục tiêu:** Đề bài bắt chúng ta **tìm giá trị lớn nhất/nhỏ nhất**, **tính tích phân**, hay **viết phương trình mặt phẳng**?
3. **Tìm điều kiện xác định:** Trước khi làm bất cứ phép tính nào, hãy kiểm tra xem biểu thức có **mẫu số** hay **dấu căn bậc hai** không.

👉 Bây giờ, em hãy thử đọc tên giả thiết quan trọng nhất của bài toán này cho cô nghe nhé!`;
  }

  // Xử lý khi học sinh muốn sang bước tiếp theo
  if (prompt.includes("tiếp theo") || prompt.includes("bước tiếp") || prompt.includes("sang bước")) {
    const nextStep = Math.min(7, currentStep + 1);
    return `🎉 **Tuyệt vời! Em đã hoàn thành rất tốt bước trước. Bây giờ cô trò mình cùng sang Bước ${nextStep}/7 nhé!**

- Ở bước này, mục tiêu của em là: **Vận dụng manh mối vừa tìm được để đặt bút thực hiện phép biến đổi đầu tiên**.
- Đừng ngại nếu bước tính đầu tiên chưa ra ngay đáp số, toán học luôn cần ta thử nghiệm từng bước một.

👉 Em hãy thử viết dòng biến đổi đầu tiên vào ô bên dưới, cô sẽ quan sát và hỗ trợ em ngay nhé!`;
  }

  // Phản hồi Socratic theo từng bước (Khi học sinh gửi câu hỏi thông thường)
  switch (currentStep) {
    case 1:
      return `🌾 **Cô giáo Socratic (Bước 1/7: Nhận diện đề bài):**

Chào em! Để cùng nhau chinh phục bài toán này, trước hết ta không vội bấm máy tính hay biến đổi phức tạp.

1. **Nhận diện giả thiết:** Em hãy cho cô biết bài toán đã cho sẵn những điều kiện hay hàm số nào?
2. **Xác định yêu cầu:** Đề bài yêu cầu em tìm ẩn số nào hoặc chứng minh điều gì?

👉 Em hãy thử chạm vào nút Micro to màu đỏ để nói cho cô nghe, hoặc gõ một câu ngắn gọn câu trả lời của em nhé!`;

    case 2:
      return `📖 **Cô giáo Socratic (Bước 2/7: Gợi nhớ kiến thức gốc):**

Rất tốt! Ta đã xác định rõ bài toán cần gì. Bây giờ hãy cùng cô lục lại "kho kiến thức":

- Dạng toán này liên quan trực tiếp đến công thức hoặc định lý nào mà em đã học ở lớp 10, 11 hoặc đầu năm lớp 12?
- *(Gợi ý: Hãy nhớ lại các công thức đạo hàm cơ bản $(x^n)' = n x^{n-1}$, quy tắc tính nguyên hàm $\\int x^n dx = \\frac{x^{n+1}}{n+1} + C$, hoặc định lý Sin, Côsin trong tam giác).*

👉 Em nhớ được công thức nào gần nhất với bài này? Hãy thử nêu ra nhé!`;

    case 3:
      return `🧭 **Cô giáo Socratic (Bước 3/7: Định hướng bước đầu):**

Em làm rất chuẩn! Bước tiếp theo là chọn hướng đi ngắn nhất:

- Nếu là hàm số: Ta có nên tính đạo hàm $y'$ để lập bảng biến thiên không?
- Nếu là phương trình: Ta có thể phân tích thành nhân tử hoặc đặt ẩn phụ $t$ để đơn giản hóa không?
- Nếu là hình học không gian Oxyz: Em đã xác định được tọa độ các đỉnh hay vectơ pháp tuyến $\\vec{n}$ chưa?

👉 Theo em, bước biến đổi đầu tiên khả thi nhất sẽ là gì?`;

    case 4:
      return `✏️ **Cô giáo Socratic (Bước 4/7: Tự tay làm thử):**

Bây giờ là lúc em tự tay thể hiện sức mạnh tư duy của mình:

- Em hãy lấy giấy nháp và bút, thực hiện **1 hoặc 2 dòng biến đổi đầu tiên** theo hướng ta vừa bàn.
- Đừng sợ sai nhé! Trong toán học, việc nháp thử và tìm ra chỗ chưa hợp lý chính là cách nhanh nhất để hiểu sâu bản chất.

👉 Em đã viết được biểu thức biến đổi nào ra giấy rồi? Hãy gửi kết quả bước đầu cho cô kiểm tra giúp em!`;

    case 5:
      return `✨ **Cô giáo Socratic (Bước 5/7: Tháo gỡ nút thắt & Cảnh báo bẫy):**

Em đang đi rất đúng hướng rồi đấy! Ở bước này, cô nhắc em lưu ý một số "bẫy" học sinh rất hay quên:

⚠️ **Các bẫy thường gặp:**
- Quên đối chiếu **điều kiện xác định** (ví dụ: nghiệm tìm được có làm mẫu bằng $0$ hay biểu thức trong logarit $\\le 0$ không?).
- Nhầm lẫn dấu khi chuyển vế hoặc khi nhân hai vế bất đẳng thức với một số âm.

👉 Em hãy nhìn lại biểu thức vừa tính, xem các nghiệm có thỏa mãn trọn vẹn điều kiện ban đầu chưa nhé!`;

    case 6:
      return `🎯 **Cô giáo Socratic (Bước 6/7: Hoàn tất kết quả):**

Chỉ còn một chút nữa thôi là em sẽ tự mình về đích!

- Em hãy đối chiếu lại kết quả cuối cùng với 4 phương án trắc nghiệm A, B, C, D (hoặc yêu cầu đề bài).
- Kiểm tra lại đơn vị hoặc tính hợp lý thực tế của bài toán.

👉 Đáp số cuối cùng em tìm ra là bao nhiêu? Hãy nói hoặc viết cho cô biết nhé!`;

    case 7:
    default:
      return `🏆 **Cô giáo Socratic (Bước 7/7: Đúc kết & Mở rộng):**

Chúc mừng em đã tự mình vượt dốc và giải quyết trọn vẹn bài toán! 🌟

🎓 **Bí kíp 1 câu để nhớ mãi dạng này:**
> *"Muốn chinh phục dạng bài này, hãy luôn đặt điều kiện xác định trước tiên, sau đó đưa về biểu thức quen thuộc và kiểm tra lại dấu ở bước cuối!"*

👉 Em đã cảm thấy tự tin hơn với dạng bài này chưa? Hãy bấm nút **"Bài mới"** để cùng cô thử sức bài tiếp theo nhé!`;
  }
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
