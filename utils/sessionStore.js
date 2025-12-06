// backend/utils/sessionStore.js
import { v4 as uuidv4 } from "uuid";
const sessions = {}; // { sessionId: { messages: [] } }

const MAX_HISTORY = 12;

export function createSession(){
  const id = uuidv4();
  sessions[id] = { messages: [] };
  return id;
}

export function appendMessage(sessionId, role, content){
  if(!sessions[sessionId]) sessions[sessionId] = { messages: [] };
  sessions[sessionId].messages.push({ role, content, ts: Date.now() });
  sessions[sessionId].messages = sessions[sessionId].messages.slice(-MAX_HISTORY);
}

export function getSessionMessages(sessionId){
  return sessions[sessionId]?.messages ?? [];
}
