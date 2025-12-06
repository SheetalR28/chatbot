// backend/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import chatRouter from "./routes/chat.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.use("/api/chat", chatRouter);

// simple health route
app.get("/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Backend listening on http://localhost:${PORT}`));
