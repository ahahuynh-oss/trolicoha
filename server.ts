import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Fallback models in priority order
const FALLBACK_MODELS = [
  "gemini-2.5-flash",
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite",
  "gemini-3.1-pro-preview"
];

// Health and server config check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    hasServerApiKey: Boolean(process.env.GEMINI_API_KEY),
    supportedModels: FALLBACK_MODELS,
    time: new Date().toISOString()
  });
});

// Gemini proxy endpoint
app.post("/api/gemini/generate", async (req, res) => {
  try {
    const {
      prompt,
      image, // { data: string (base64 without header or with header), mimeType?: string }
      model = "gemini-2.5-flash",
      systemInstruction,
      temperature = 0.7,
      userApiKey
    } = req.body;

    const apiKey = userApiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(400).json({
        success: false,
        error: "Chưa cấu hình API Key. Vui lòng nhập Gemini API Key trong phần Cài đặt hoặc cài đặt biến môi trường GEMINI_API_KEY."
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });

    // Determine model list starting from requested model
    const candidateModels = [model, ...FALLBACK_MODELS.filter(m => m !== model)];

    let lastError: any = null;
    let generatedText = "";
    let usedModel = model;

    // Prepare contents
    let contentsPayload: any;
    if (image && image.data) {
      let base64Data = image.data;
      let mime = image.mimeType || "image/jpeg";
      if (base64Data.includes(";base64,")) {
        const parts = base64Data.split(";base64,");
        mime = parts[0].replace("data:", "") || mime;
        base64Data = parts[1];
      }

      contentsPayload = {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mime
            }
          },
          {
            text: prompt || "Hãy nhận diện và phân tích đề bài toán này bám sát phương pháp Socratic 7 bước."
          }
        ]
      };
    } else {
      contentsPayload = prompt;
    }

    for (const currentModel of candidateModels) {
      try {
        const config: any = {
          temperature
        };
        if (systemInstruction) {
          config.systemInstruction = systemInstruction;
        }

        const response = await ai.models.generateContent({
          model: currentModel,
          contents: contentsPayload,
          config
        });

        if (response && response.text) {
          generatedText = response.text;
          usedModel = currentModel;
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${currentModel} failed:`, err?.message || err);
        // Continue to fallback model if quota / 500 / 503 error
        continue;
      }
    }

    if (!generatedText) {
      const errMsg = lastError?.message || "Không nhận được phản hồi từ AI.";
      return res.status(500).json({
        success: false,
        error: `Lỗi khi gọi Gemini AI: ${errMsg}`
      });
    }

    return res.json({
      success: true,
      text: generatedText,
      modelUsed: usedModel
    });
  } catch (error: any) {
    console.error("Server API Error:", error);
    return res.status(500).json({
      success: false,
      error: error?.message || "Đã xảy ra lỗi nội bộ máy chủ."
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
