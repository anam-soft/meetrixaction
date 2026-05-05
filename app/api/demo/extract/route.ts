import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
})

export async function POST(req: NextRequest) {
  try {
    const { transcript } = await req.json()

    if (!transcript || transcript.trim().length === 0) {
      return NextResponse.json(
        { error: "Transcript is required" },
        { status: 400 }
      )
    }

    // Call Claude API with the extraction prompt
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: `You are an expert meeting analyst. Extract structured data from meeting transcripts.

Return ONLY valid JSON in this exact format, no other text, no markdown:
{
  "title": "descriptive meeting title with date if mentioned",
  "summary": "2-3 sentence paragraph summarising what was discussed and what was decided. Be specific.",
  "tasks": [
    {
      "name": "specific, actionable task description starting with a verb",
      "assignee": "first name of assigned person, or 'Team' if group, or 'Unassigned'",
      "due_text": "deadline as mentioned e.g. 'Wednesday', 'EOD today', 'End of sprint', 'By noon'",
      "priority": "high or medium or low"
    }
  ],
  "decisions": [
    "key decision made in the meeting as a complete sentence"
  ],
  "participants": ["first name 1", "first name 2"]
}

Priority rules:
- high: blocking other work, due today or tomorrow, explicitly urgent
- medium: due this week, normal importance
- low: due later, nice-to-have, background task`,
      messages: [
        {
          role: "user",
          content: transcript,
        },
      ],
    })

    // Extract the text content from Claude's response
    const responseText = message.content[0].type === "text" 
      ? message.content[0].text 
      : ""

    // Parse the JSON response
    const extractedData = JSON.parse(responseText)

    return NextResponse.json(extractedData)
  } catch (error: any) {
    console.error("Error extracting tasks:", error)
    
    // Return a more specific error message
    if (error.message?.includes("JSON")) {
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: "Something went wrong extracting tasks. Please try again." },
      { status: 500 }
    )
  }
}
