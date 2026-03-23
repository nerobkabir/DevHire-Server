import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { env } from "../config/env";

class GeminiClient {
  private client: GoogleGenerativeAI;
  private model:  GenerativeModel;

  constructor() {
    this.client = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    this.model  = this.client.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  // ── Single prompt → text response ─────────────────────────────────────────
  async generate(prompt: string): Promise<string> {
    const result = await this.model.generateContent(prompt);
    return result.response.text();
  }

  // ── Multi-turn chat ────────────────────────────────────────────────────────
  async chat(
    history: { role: "user" | "model"; parts: { text: string }[] }[],
    message: string
  ): Promise<string> {
    const chat  = this.model.startChat({ history });
    const result = await chat.sendMessage(message);
    return result.response.text();
  }
}

export const gemini = new GeminiClient();