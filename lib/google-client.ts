import Anthropic from "@anthropic-ai/sdk";

export async function generateText(
  prompt: string,
  options: { maxTokens?: number; model?: string; systemPrompt?: string } = {}
): Promise<string> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const message = await anthropic.messages.create({
    model: options.model ?? "claude-haiku-4-5-20251001",
    max_tokens: options.maxTokens ?? 1500,
    ...(options.systemPrompt ? { system: options.systemPrompt } : {}),
    messages: [{ role: "user", content: prompt }],
  });
  return message.content[0].type === "text" ? message.content[0].text : "";
}

// Placeholder — replace with real Google Cloud credentials when available
export async function getGoogleAccessToken(): Promise<string> {
  throw new Error("Google Cloud credentials not configured");
}
