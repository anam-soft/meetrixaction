import OpenAI from "openai"

// Check if OpenAI API key is configured
const hasOpenAIKey = process.env.OPENAI_API_KEY && 
  process.env.OPENAI_API_KEY !== "your_openai_api_key_here" &&
  process.env.OPENAI_API_KEY !== ""

const openai = hasOpenAIKey ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null

export interface ActionItem {
  title: string
  description: string
  assignee?: string
  deadline?: string
  confidence: number
}

export interface MeetingAnalysis {
  summary: string
  actionItems: ActionItem[]
  decisions: string[]
}

/**
 * Mock analysis for development when OpenAI API key is not available
 */
function mockAnalyzeMeetingTranscript(transcript: string): MeetingAnalysis {
  // Simple keyword-based extraction for demo purposes
  const lines = transcript.split('\n').filter(line => line.trim())
  
  // Extract potential action items (lines with "will", "should", "need to", etc.)
  const actionKeywords = ['will', 'should', 'need to', 'must', 'have to', 'going to', 'plan to']
  const actionItems: ActionItem[] = []
  
  lines.forEach(line => {
    const lowerLine = line.toLowerCase()
    if (actionKeywords.some(keyword => lowerLine.includes(keyword))) {
      actionItems.push({
        title: line.substring(0, 50) + (line.length > 50 ? '...' : ''),
        description: line,
        confidence: 0.75
      })
    }
  })
  
  // Extract potential decisions (lines with "decided", "agreed", "approved", etc.)
  const decisionKeywords = ['decided', 'agreed', 'approved', 'confirmed', 'resolved']
  const decisions: string[] = []
  
  lines.forEach(line => {
    const lowerLine = line.toLowerCase()
    if (decisionKeywords.some(keyword => lowerLine.includes(keyword))) {
      decisions.push(line)
    }
  })
  
  // Create a simple summary
  const summary = lines.length > 0 
    ? `Meeting discussion covered ${lines.length} points. ${actionItems.length} action items identified and ${decisions.length} decisions made.`
    : "No transcript content available for analysis."
  
  return {
    summary,
    actionItems: actionItems.slice(0, 10), // Limit to 10 items
    decisions: decisions.slice(0, 5) // Limit to 5 decisions
  }
}

export async function analyzeMeetingTranscript(transcript: string): Promise<MeetingAnalysis> {
  // If no OpenAI key, use mock analysis
  if (!openai) {
    return mockAnalyzeMeetingTranscript(transcript)
  }

  try {
    const prompt = `You are an AI assistant that analyzes meeting transcripts and extracts actionable tasks.

Analyze the following meeting transcript and extract:
1. A brief summary (2-3 sentences)
2. Action items with:
   - Clear, specific title
   - Description with context
   - Assignee (if mentioned)
   - Deadline (if mentioned)
   - Confidence score (0-1) based on how clear the action item is
3. Key decisions made

IMPORTANT: Only extract action items that are explicitly stated or clearly implied. Do not hallucinate tasks.

Transcript:
${transcript}

Respond in JSON format:
{
  "summary": "...",
  "actionItems": [
    {
      "title": "...",
      "description": "...",
      "assignee": "...",
      "deadline": "...",
      "confidence": 0.95
    }
  ],
  "decisions": ["...", "..."]
}`

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a precise meeting analyzer. Only extract clear, evidence-based action items. Never hallucinate or infer tasks that weren't discussed.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    })

    const content = response.choices[0].message.content
    if (!content) {
      throw new Error("No response from OpenAI")
    }

    const analysis: MeetingAnalysis = JSON.parse(content)
    
    // Filter out low-confidence items
    analysis.actionItems = analysis.actionItems.filter(item => item.confidence >= 0.7)
    
    return analysis
  } catch (error) {
    return mockAnalyzeMeetingTranscript(transcript)
  }
}

/**
 * Mock transcription for development when OpenAI API key is not available
 */
function mockTranscribeAudio(fileName: string): string {
  return `[Mock Transcription for ${fileName}]

This is a simulated transcription for development purposes.

To enable real transcription, you need to:
1. Get an OpenAI API key from https://platform.openai.com/account/api-keys
2. Add it to your .env file as OPENAI_API_KEY=sk-...

For now, you can manually enter meeting notes or transcripts.

Sample meeting content:
- Team discussed the new feature requirements
- John will prepare the technical specification by Friday
- Sarah agreed to review the design mockups
- We decided to use React for the frontend
- Next meeting scheduled for next Monday at 2 PM`
}

export async function transcribeAudio(audioUrl: string): Promise<string> {
  // If no OpenAI key, return mock transcription
  if (!openai) {
    const fileName = audioUrl.split('/').pop() || 'audio file'
    return mockTranscribeAudio(fileName)
  }

  try {
    // For MVP, we'll assume transcript is provided or use Whisper API
    const response = await fetch(audioUrl)
    const audioBlob = await response.blob()
    
    const file = new File([audioBlob], "audio.mp3", { type: "audio/mpeg" })
    
    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: "whisper-1",
    })
    
    return transcription.text
  } catch (error) {
    const fileName = audioUrl.split('/').pop() || 'audio file'
    return mockTranscribeAudio(fileName)
  }
}
