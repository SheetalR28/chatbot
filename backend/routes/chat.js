// backend/routes/chat.js
import express from "express";
import { generateChatReply, createEmbedding } from "../services/openaiClient.js";
import { addDocument, queryByEmbedding, listDocs } from "../services/vectorStore.js";
import { createSession, appendMessage, getSessionMessages } from "../utils/sessionStore.js";

const router = express.Router();

// Ingest docs to vector store (dev)
router.post("/ingest", async (req,res) => {
  try {
    const { id, text } = req.body;
    if(!id || !text) return res.status(400).json({ error: "id and text required" });
    const emb = await createEmbedding(text);
    await addDocument(id, text, emb);
    return res.json({ ok: true });
  } catch(err){
    console.error(err); res.status(500).json({ error: "ingest failed" });
  }
});

router.get("/docs", (req,res) => res.json(listDocs()));

// Main chat endpoint
router.post("/", async (req,res) => {
  try {
    const { sessionId: providedSessionId, message } = req.body;
    if(!message) return res.status(400).json({ error: "message required" });

    const sessionId = providedSessionId || createSession();
    appendMessage(sessionId, "user", message);

    // RAG: embed query and fetch top docs
    const emb = await createEmbedding(message);
    const docs = await queryByEmbedding(emb, 3);

    // Build messages: system + docs + history + user
    const system = { role: "system", content: "You are a helpful assistant. Use provided context to answer. If context does not contain answer, say so." };
    const context = { role: "system", content: "Context:\n" + (docs.map((d,i)=>`Doc ${i+1} (score=${d.score.toFixed(3)}):\n${d.text}`).join("\n\n") || "No relevant documents.") };

    const history = getSessionMessages(sessionId).map(m => ({ role: m.role === "user" ? "user" : "assistant", content: m.content }));
    const messages = [system, context, ...history, { role: "user", content: message }];

    const reply = await generateChatReply(messages);
    appendMessage(sessionId, "assistant", reply);

    return res.json({ sessionId, reply, docs: docs.map(d => ({ id: d.id, score: d.score })) });
  } catch(err){
    console.error(err); res.status(500).json({ error: "server error" });
  }
});

export default router;
