import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Fallback model chain — each model has its own quota pool
const MODEL_CHAIN = [
  "gemini-2.5-flash",
  "gemini-2.0-flash-lite",
  "gemini-2.5-flash-lite",
  "gemini-flash-lite-latest",
];

const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 2000;
const REQUEST_TIMEOUT_MS = 60000; // 60 seconds

async function generateWithRetry(genAI, systemInstruction, userPrompt) {
  let lastError = null;

  for (const modelName of MODEL_CHAIN) {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction: systemInstruction,
          generationConfig: {
            responseMimeType: "application/json",
          },
        });

        // Use AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

        try {
          const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: userPrompt }] }],
          }, { signal: controller.signal });

          clearTimeout(timeoutId);

          const response = await result.response;
          let text = response.text();

          // Clean up response — remove any markdown formatting
          text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

          // Parse and validate JSON
          const paperData = JSON.parse(text);

          // Basic validation
          if (!paperData.header || !paperData.sections || !Array.isArray(paperData.sections)) {
            throw new Error("Invalid paper structure: missing header or sections");
          }

          console.log(`✅ Successfully generated with ${modelName} (attempt ${attempt})`);
          return paperData;
        } finally {
          clearTimeout(timeoutId);
        }
      } catch (error) {
        lastError = error;
        const isOverloaded = error.message?.includes("503") || error.message?.includes("overloaded") || error.message?.includes("high demand");
        const isTimeout = error.name === "AbortError";
        const isRetryable = isOverloaded || isTimeout || error.message?.includes("500");

        console.warn(
          `⚠️ ${modelName} attempt ${attempt}/${MAX_RETRIES} failed: ${isOverloaded ? "503 overloaded" : isTimeout ? "timeout" : error.message?.substring(0, 100)}`
        );

        if (isRetryable && attempt < MAX_RETRIES) {
          const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt - 1);
          console.log(`   Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        // If not retryable or exhausted retries, try next model
        break;
      }
    }
    console.log(`🔄 Switching from ${modelName} to next fallback model...`);
  }

  throw lastError || new Error("All models failed to generate content");
}

export async function POST(request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key not configured. Add GEMINI_API_KEY to .env.local" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      board,
      className,
      chapter,
      questionTypes,
      questionsPerType,
      difficulty,
      totalMarks,
      duration,
      date,
    } = body;

    // Validate required fields
    if (!board || !className || !chapter || !questionTypes || questionTypes.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields. Please fill all form fields." },
        { status: 400 }
      );
    }

    // Build question type instructions
    const typeInstructions = questionTypes
      .map((type) => {
        const count = questionsPerType[type] || 3;
        return `${count} ${type} questions`;
      })
      .join(", ");

    const systemInstruction = `You are an expert math teacher for West Bengal board exams. Generate a properly formatted exam question paper in the following JSON format. All questions must be mathematically accurate and appropriate for the selected board and class. For WBBSE and WBCHSE, follow the exact West Bengal board exam style. For JEE, follow the JEE Mains/Advanced pattern strictly.

Return ONLY a valid JSON object with this structure:
{
  "header": {
    "board": "",
    "class": "",
    "subject": "Mathematics",
    "chapter": "",
    "totalMarks": 0,
    "duration": "",
    "date": ""
  },
  "sections": [
    {
      "sectionName": "Section A",
      "type": "MCQ",
      "marksPerQuestion": 1,
      "questions": [
        {
          "id": 1,
          "question": "",
          "options": ["A) ", "B) ", "C) ", "D) "],
          "answer": "",
          "solution": ""
        }
      ]
    }
  ]
}`;

    const isBengaliBoard = ["WBBSE", "WBCHSE", "WBJEE"].includes(board);
    const languageInstruction = isBengaliBoard 
      ? "10. The questions, options, answers, and solutions MUST be written entirely in the Bengali language (বাংলা), except for mathematical symbols, numbers, and standard English terms where necessary." 
      : "10. The questions should be written in English.";

    const userPrompt = `Generate an exam paper with these specifications:
- Board: ${board}
- Class: ${className}
- Subject: Mathematics
- Chapter: ${chapter}
- Question Types: ${typeInstructions}
- Difficulty Level: ${difficulty}
- Total Marks: ${totalMarks}
- Duration: ${duration}
- Date: ${date || "Not specified"}

Make sure:
1. Questions are appropriate for ${className} level and ${board} board pattern.
2. Each section should have proper section names (Section A, Section B, etc.).
3. MCQ questions must have exactly 4 options.
4. Short answer questions should be worth 2-3 marks each.
5. Long answer questions should be worth 5-6 marks each.
6. Proof-based questions should be worth 5-8 marks each.
7. Total marks should add up to approximately ${totalMarks}.
8. All math expressions should use Unicode symbols (×, ÷, √, π, ², ³, ∑, ∫, θ, α, β, etc.). Do NOT use LaTeX.
9. Questions should be of ${difficulty} difficulty level.
${languageInstruction}

Return ONLY valid JSON. No markdown, no code blocks, just the JSON object.`;

    const genAI = new GoogleGenerativeAI(apiKey);

    const paperData = await generateWithRetry(genAI, systemInstruction, userPrompt);

    return NextResponse.json({ paper: paperData });
  } catch (error) {
    console.error("Gemini API error:", error);

    // Provide user-friendly error messages
    let userMessage = "Failed to generate paper. Please try again.";
    if (error.message?.includes("503") || error.message?.includes("high demand")) {
      userMessage = "AI models are currently experiencing high demand. Please wait a minute and try again.";
    } else if (error.name === "AbortError" || error.message?.includes("timeout")) {
      userMessage = "Request timed out. The AI is taking too long. Please try again.";
    } else if (error.message?.includes("API key")) {
      userMessage = "API key is invalid or expired. Please check your configuration.";
    }

    return NextResponse.json(
      { error: userMessage },
      { status: 503 }
    );
  }
}
