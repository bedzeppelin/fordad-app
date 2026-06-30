// Voice note summarization. Uses Gemini Flash when GEMINI_API_KEY is set;
// otherwise falls back to a simple heuristic so voice notes still work
// end-to-end without an API key configured.

export interface SummaryResult {
  summary_bullets: string[];
  extracted_fields: {
    dates: string[];
    medication_changes: string[];
    readings: string[];
    follow_ups: string[];
  };
}

export async function summarizeTranscript(rawTranscript: string): Promise<SummaryResult> {
  const text = rawTranscript.trim();
  if (!text) return { summary_bullets: [], extracted_fields: { dates: [], medication_changes: [], readings: [], follow_ups: [] } };

  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    try {
      return await summarizeWithGemini(text, apiKey);
    } catch {
      // Fall through to the heuristic summarizer if Gemini fails or is misconfigured.
    }
  }
  return heuristicSummarize(text);
}

async function summarizeWithGemini(text: string, apiKey: string): Promise<SummaryResult> {
  const prompt = `You are helping a family caregiver keep track of voice notes recorded by an elderly relative. Summarize the transcript below into a short, plain-language bullet list (what was discussed), and extract any structured details mentioned. Respond with ONLY JSON matching this shape:
{
  "summary_bullets": string[],
  "extracted_fields": {
    "dates": string[],        // any dates/appointment times mentioned
    "medication_changes": string[],
    "readings": string[],     // numbers like blood pressure, weight, lab values
    "follow_ups": string[]    // follow-up instructions, e.g. "reduce sodium"
  }
}

Transcript:
"""${text}"""`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    }
  );
  if (!res.ok) throw new Error(`Gemini request failed: ${res.status}`);

  const data = await res.json();
  const outText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!outText) throw new Error("Gemini returned no content");

  const parsed = JSON.parse(outText);
  return {
    summary_bullets: Array.isArray(parsed.summary_bullets) ? parsed.summary_bullets.map(String) : [],
    extracted_fields: {
      dates: Array.isArray(parsed.extracted_fields?.dates) ? parsed.extracted_fields.dates.map(String) : [],
      medication_changes: Array.isArray(parsed.extracted_fields?.medication_changes)
        ? parsed.extracted_fields.medication_changes.map(String)
        : [],
      readings: Array.isArray(parsed.extracted_fields?.readings) ? parsed.extracted_fields.readings.map(String) : [],
      follow_ups: Array.isArray(parsed.extracted_fields?.follow_ups) ? parsed.extracted_fields.follow_ups.map(String) : [],
    },
  };
}

function heuristicSummarize(text: string): SummaryResult {
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const summary_bullets = sentences.slice(0, 6);

  const dates = uniq(text.match(/\b(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*\b[^.,!?]{0,20}|\b\d{1,2}\/\d{1,2}(?:\/\d{2,4})?\b/gi));
  const readings = uniq(text.match(/\b\d{2,3}\s?\/\s?\d{2,3}\b|\b\d+(?:\.\d+)?\s?(?:lbs|kg|mg|bpm)\b/gi));
  const medication_changes = uniq(text.match(/\b[\w-]+\s+(?:mg|milligrams?|tablets?|pills?|dose|dosage)\b[^.?!]{0,40}[.?!]?/gi));
  const follow_ups = uniq(
    text.match(/\b(?:reduce|increase|schedule|call|follow[- ]?up|avoid|cut back|stop|start)\b[^.?!]{0,60}[.?!]?/gi)
  );

  return { summary_bullets, extracted_fields: { dates, medication_changes, readings, follow_ups } };
}

function uniq(matches: RegExpMatchArray | null): string[] {
  if (!matches) return [];
  return [...new Set(matches.map((s) => s.trim()))];
}
