import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey || apiKey === "your-gemini-api-key-here") {
    return NextResponse.json(
      { error: "GEMINI_API_KEY not configured. Add it to .env.local." },
      { status: 503 }
    )
  }

  const body = await req.json() as { type: string; prompt: string }
  const { type, prompt } = body

  if (!prompt) {
    return NextResponse.json({ error: "prompt is required" }, { status: 400 })
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" })

    const systemPrompt =
      type === "brutal_reality"
        ? `You are a strict, data-driven career advisor reviewing an SDE placement candidate'\''s actual performance data.
Speak directly, like a senior engineer mentoring a junior.
NEVER use motivational quotes. NEVER make up data not provided.
ONLY reference the exact numbers given. Be honest about gaps.
Format your response in 3 short paragraphs: (1) Current trajectory verdict, (2) Biggest risks, (3) One specific correction.
Each paragraph max 3 sentences.`
        : `You are a strict but rational SDE career mentor.
Analyze only the data given. No motivational filler. No invented achievements.
Give 3 specific, actionable recommendations based purely on patterns in the data.`

    const result = await model.generateContent(`${systemPrompt}\n\n${prompt}`)
    const text = result.response.text()

    return NextResponse.json({ result: text })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}