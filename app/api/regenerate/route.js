import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

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
- Return ONLY valid JSON, no markdown.`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let newQuestion;
    try {
      newQuestion = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse regenerated question." },
        { status: 500 }
      );
    }

    return NextResponse.json({ question: newQuestion });
  } catch (error) {
    console.error("Regenerate error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to regenerate question." },
      { status: 500 }
    );
  }
}
