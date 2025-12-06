import React, { useEffect, useRef, useState } from "react";
import api from "../services/api";

export default function Chatbot() {
  const [messages, setMessages] = useState([]); // { sender, text }
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const endRef = useRef();

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { sender: "user", text: input };
    setMessages(prev => [...prev, userMsg]);
    setIsSending(true);

    try {
      const res = await api.post("/chat", { sessionId, message: input });
      if (res.data.sessionId) setSessionId(res.data.sessionId);
      setMessages(prev => [...prev, { sender: "bot", text: res.data.reply }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { sender: "bot", text: "Error: could not reach server." }]);
    } finally {
      setInput("");
      setIsSending(false);
    }
  };

  return (
    <div style={{ maxWidth: 560, margin: "40px auto", fontFamily: "Arial, sans-serif" }}>
      <div style={{ border: "1px solid #ddd", borderRadius: 10, padding: 12, background: "#f8fafc" }}>
        <h3>Website Chatbot</h3>
        <div style={{ height: 420, overflowY: "auto", padding: 8, background: "#fff", borderRadius: 8 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.sender === "user" ? "flex-end" : "flex-start", marginBottom: 8 }}>
              <div style={{
                maxWidth: "80%",
                background: m.sender === "user" ? "#DCF8C6" : "#F1F3F5",
                padding: 10,
                borderRadius: 12
              }}>{m.text}</div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
            style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
          />
          <button onClick={sendMessage} disabled={isSending} style={{ padding: "10px 14px", borderRadius: 8 }}>
            {isSending ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
