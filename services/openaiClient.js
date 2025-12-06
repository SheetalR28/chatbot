// backend/services/openaiClient.js
import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateChatReply(messages, { max_tokens = 512, temperature = 0.2 } = {}) {
  const model = process.env.MODEL || "gpt-3.5-turbo";
  const resp = await client.chat.completions.create({
    model,
    messages,
    max_tokens,
    temperature
  });
  const content = resp?.choices?.[0]?.message?.content ?? "";
  return content;
}

export async function createEmbedding(text) {
  const resp = await client.embeddings.create({
    model: "text-embedding-3-small",
    input: text
  });
  return resp.data[0].embedding;
}
