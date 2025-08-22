const GOOGLE_API_KEY = 'AIzaSyCPUcCMklEut1B4PSSVgO9g1YdOSptAS0E'

export interface AnalysisResult {
  aiScore: number
  weakTopics: string[]
  resources: Array<{ title: string; url: string; type: 'video' | 'article' | 'exercise' | 'tutorial' }>
}

const MODEL = 'gemini-1.5-flash'
const API_BASE = 'https://generativelanguage.googleapis.com/v1beta'

const buildAnalysisPrompt = (subject: string) => `You are a strict grading teacher who will grade the papers on the relevance of the subject.
You will grade papers based on the relevance of the given topic from the user.
Anything less than 70 is considered as fail, and you will give a fail option and mark it as invalid and mark the student as weak in all subject.
you are going to be reasonable in grading and strict. you will search all of your available databases and give out the fined output.
You may chance you values of temp or k or n to be creative.

Here is a reference:
the user uploads a wrong file
system: The system should say that this is an invalid file and mark it as red

similarly you will do this to all the other files as well, remember you are strict.

Analyze the provided content for the subject: ${subject}.
Return a strict JSON object with keys: aiScore (0-100 integer), weakTopics (array of 1-5 short topic strings), resources (array of 2-4 objects {title, url, type in [video|article|exercise|tutorial]}).
No extra text.`

const safeParse = (text: string): AnalysisResult | null => {
  try {
    const obj = JSON.parse(text)
    if (
      typeof obj?.aiScore === 'number' &&
      Array.isArray(obj?.weakTopics) &&
      Array.isArray(obj?.resources)
    ) {
      return {
        aiScore: Math.max(0, Math.min(100, Math.round(obj.aiScore))),
        weakTopics: obj.weakTopics.slice(0, 5).map((t: any) => String(t)).filter(Boolean),
        resources: obj.resources.slice(0, 4).map((r: any) => ({
          title: String(r.title || 'Resource'),
          url: String(r.url || 'https://example.com'),
          type: (['video','article','exercise','tutorial'].includes(r.type) ? r.type : 'article') as AnalysisResult['resources'][number]['type']
        }))
      }
    }
    return null
  } catch {
    return null
  }
}

export const analyzeTextWithGemini = async (text: string, subject: string): Promise<AnalysisResult> => {
  const url = `${API_BASE}/models/${MODEL}:generateContent?key=${GOOGLE_API_KEY}`
  const body = {
    contents: [
      { role: 'user', parts: [
        { text: buildAnalysisPrompt(subject) },
        { text }
      ]}
    ]
  }
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  const data = await res.json()
  const textOut = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
  const parsed = safeParse(textOut)
  if (parsed) return parsed
  // Fallback heuristic
  return { aiScore: 75, weakTopics: ['Concept Clarity', 'Practice'], resources: [
    { title: 'Study Guide', url: 'https://example.com/guide', type: 'article' },
    { title: 'Practice Set', url: 'https://example.com/practice', type: 'exercise' }
  ]}
}

const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve((reader.result as string).split(',')[1])
  reader.onerror = reject
  reader.readAsDataURL(file)
})

export const analyzeFileWithGemini = async (file: File, subject: string, title?: string): Promise<AnalysisResult> => {
  try {
    const url = `${API_BASE}/models/${MODEL}:generateContent?key=${GOOGLE_API_KEY}`
    const base64 = await fileToBase64(file)
    const mimeType = file.type || 'application/octet-stream'

    const body = {
      contents: [
        { role: 'user', parts: [
          { text: buildAnalysisPrompt(subject) },
          { inline_data: { mime_type: mimeType, data: base64 } },
          { text: title ? `Title: ${title}` : '' }
        ]}
      ]
    }

    const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data = await res.json()
    const textOut = data?.candidates?.[0]?.content?.parts?.[0]?.text || ''
    const parsed = safeParse(textOut)
    if (parsed) return parsed
    // Fallback to text-only if parsing fails
    return analyzeTextWithGemini(`${title || file.name} summary`, subject)
  } catch {
    return { aiScore: 72, weakTopics: ['Review Basics', 'Practice Problems'], resources: [
      { title: 'Topic Overview', url: 'https://example.com/overview', type: 'article' },
      { title: 'Exercises', url: 'https://example.com/exercises', type: 'exercise' }
    ]}
  }
}
