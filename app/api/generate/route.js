import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

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

Return ONLY valid JSON. No markdown, no code blocks, just the JSON object.`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: systemInstruction,
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const result = await model.generateContent(userPrompt);
    const response = await result.response;
    let text = response.text();

    // Clean up response — remove any markdown formatting
    text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    // Parse JSON
    let paperData;
    try {
      console.log("Raw Gemini Text:", text);
      paperData = JSON.parse(text);
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", text);
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ paper: paperData });
  } catch (error) {
    console.error("Gemini API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate paper. Please try again." },
      { status: 500 }
    );
  }
}
