import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

import pdfExtract from "pdf-text-extract";

import { createEmbedding } from "../services/openaiClient.js";
import { addDocument } from "../services/vectorStore.js";

async function extractTextFromPDF(filePath) {
  return new Promise((resolve, reject) => {
    pdfExtract(filePath, (err, pages) => {
      if (err) return reject(err);
      const text = pages.join("\n\n");
      resolve(text.replace(/\s+/g, " ").trim());
    });
  });
}

async function ingestPDF(filePath, prefix = "DOC") {
  const text = await extractTextFromPDF(filePath);

  const chunks = text.match(/(.|[\r\n]){1,800}/g) || [];

  let count = 1;
  for (const chunk of chunks) {
    const embedding = await createEmbedding(chunk);
    await addDocument(`${prefix}_${count}`, chunk, embedding);
    console.log(`✅ Stored chunk ${prefix}_${count}`);
    count++;
  }

  console.log("🎉 PDF Ingestion Complete!");
}

ingestPDF("./data/chatbot.pdf", "HOSTEL");
