import { gemini } from "./gemini.client";
import { grok }   from "./grok.client";
import { env }    from "./env";

// ── Which provider is available 
const hasGemini = !!env.GEMINI_API_KEY;
const hasGrok   = !!env.GROK_API_KEY;

// ── Universal AI client
// Uses Gemini first. If Gemini fails or key is missing, falls back to Grok.
export const ai = {
  async generate(prompt: string): Promise<string> {
    // Try Gemini
    if (hasGemini) {
      try {
        return await gemini.generate(prompt);
      } catch (err) {
        console.warn("[ai] Gemini failed, trying Grok...", (err as Error).message);
      }
    }

    // Fallback to Grok
    if (hasGrok) {
      return grok.generate(prompt);
    }

    throw new Error("No AI provider available. Set GEMINI_API_KEY or GROK_API_KEY.");
  },

  async chat(
    history: { role: "user" | "model"; parts: { text: string }[] }[],
    message: string
  ): Promise<string> {
    // Try Gemini
    if (hasGemini) {
      try {
        return await gemini.chat(history, message);
      } catch (err) {
        console.warn("[ai] Gemini chat failed, trying Grok...", (err as Error).message);
      }
    }

    // Fallback to Grok — convert Gemini format → OpenAI format
    if (hasGrok) {
      const grokMessages = [
        ...history.map((m) => ({
          role:    m.role === "model" ? "assistant" as const : "user" as const,
          content: m.parts[0]?.text ?? "",
        })),
        { role: "user" as const, content: message },
      ];
      return grok.chat(grokMessages);
    }

    throw new Error("No AI provider available. Set GEMINI_API_KEY or GROK_API_KEY.");
  },
};