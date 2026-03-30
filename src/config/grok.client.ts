import { env } from "./env";

// Grok uses OpenAI-compatible API
const GROK_BASE_URL = "https://api.x.ai/v1";

interface GrokMessage {
  role:    "system" | "user" | "assistant";
  content: string;
}

class GrokClient {
  private apiKey: string;

  constructor() {
    this.apiKey = env.GROK_API_KEY;
  }

  // ── Single prompt ─────────────────────────────────────────────────────────
  async generate(prompt: string): Promise<string> {
    return this.chat([{ role: "user", content: prompt }]);
  }

  // ── Multi-turn chat ───────────────────────────────────────────────────────
  async chat(messages: GrokMessage[]): Promise<string> {
    const response = await fetch(`${GROK_BASE_URL}/chat/completions`, {
      method:  "POST",
      headers: {
        "Content-Type":  "application/json",
        "Authorization": `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model:       "grok-3-mini",     // latest fast model
        messages,
        max_tokens:  1024,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Grok API error: ${response.status} — ${err}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content ?? "";
  }
}

export const grok = new GrokClient();