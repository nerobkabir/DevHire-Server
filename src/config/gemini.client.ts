import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { env } from "../config/env";

class GeminiClient {
  private client: GoogleGenerativeAI;
  private model:  GenerativeModel;

  constructor() {
    this.client = new GoogleGenerativeAI(env.GEMINI_API_KEY);
    this.model = this.client.getGenerativeModel({ model: "gemini-1.5-flash-8b" });
  }

  // Single prompt → text response
  async generate(prompt: string): Promise<string> {
    const result = await this.model.generateContent(prompt);
    return result.response.text();
  }

  // Multi-turn chat
  async chat(
    history: { role: "user" | "model"; parts: { text: string }[] }[],
    message: string
  ): Promise<string> {
    // history সবসময় "user" role দিয়ে শুরু হওয়া দরকার
    // প্রথম "model" message থাকলে Gemini error দেয়
    const safeHistory = history.length > 0 && history[0].role === "model"
      ? history.slice(1)
      : history;

    const chat   = this.model.startChat({ history: safeHistory });
    const result = await chat.sendMessage(message);
    return result.response.text();
  }
}

export const gemini = new GeminiClient();