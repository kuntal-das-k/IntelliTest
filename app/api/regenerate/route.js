import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const MODEL_CHAIN = [
  "gemini-2.5-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.5-flash-lite",
  "gemini-flash-lite-latest",
];

const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 1500;
const REQUEST_TIMEOUT_MS = 30000; // 30 seconds (shorter for single question)

async function regenerateWithRetry(genAI, prompt) {
  let lastError = null;

  for (const modelName of MODEL_CHAIN) {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: { responseMimeType: "application/json" },
        });

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

        try {
          const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
          }, { signal: controller.signal });

          clearTimeout(timeoutId);

          const response = await result.response;
          let text = response.text();
          text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

          const newQuestion = JSON.parse(text);

          // Validate question structure
          if (!newQuestion.question) {
            throw new Error("Invalid question: missing question text");
          }

          console.log(`✅ Regenerated with ${modelName} (attempt ${attempt})`);
          return newQuestion;
        } finally {
          clearTimeout(timeoutId);
        }
      } catch (error) {
        lastError = error;
        const isRetryable =
          error.message?.includes("503") ||
          error.message?.includes("overloaded") ||
          error.message?.includes("high demand") ||
          error.message?.includes("500") ||
          error.name === "AbortError";

        console.warn(`⚠️ Regen ${modelName} attempt ${attempt}: ${error.message?.substring(0, 80)}`);

        if (isRetryable && attempt < MAX_RETRIES) {
          const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        break;
      }
    }
  }

  throw lastError || new Error("All models failed");
}

export async function POST(request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key not configured." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { question, board, className, chapter, type, difficulty } = body;

    const isBengaliBoard = ["WBBSE", "WBCHSE", "WBJEE"].includes(board);
    const languageInstruction = isBengaliBoard 
      ? "- The question, options, answer, and solution MUST be written entirely in the Bengali language (বাংলা), except for mathematical symbols, numbers, and standard English terms where necessary." 
      : "- The question should be written in English.";

    const prompt = `You are an expert math teacher. Regenerate a new ${type} question for ${board} ${className} on the topic "${chapter}" at ${difficulty} difficulty level. The question should be different from: "${question}"

Return ONLY a valid JSON object:
{
  "question": "new question text here",
  "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
  "answer": "correct answer",
  "solution": "step by step solution"
}

Notes:
- If type is not MCQ, do NOT include options array.
- Use Unicode math symbols, not LaTeX.
${languageInstruction}
- Return ONLY valid JSON, no markdown.`;

    const genAI = new GoogleGenerativeAI(apiKey);

    const newQuestion = await regenerateWithRetry(genAI, prompt);

    return NextResponse.json({ question: newQuestion });
  } catch (error) {
    console.error("Regenerate error:", error);

    let userMessage = "Failed to regenerate question. Please try again.";
    if (error.message?.includes("503") || error.message?.includes("high demand")) {
      userMessage = "AI models are busy. Please wait a moment and try again.";
    }

    return NextResponse.json(
      { error: userMessage },
      { status: 503 }
    );
  }
}
