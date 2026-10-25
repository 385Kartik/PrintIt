export interface AskAIRequest {
  question: string
  university: string
  subject: string
}

export interface AskAIResponse {
  answer: string
  confidence: string
  source: string
}

const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"

export async function askAI(
  payload: AskAIRequest
): Promise<AskAIResponse> {
  const res = await fetch(`${API_BASE}/api/ai/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error || "AI request failed")
  }

  return res.json()
}
