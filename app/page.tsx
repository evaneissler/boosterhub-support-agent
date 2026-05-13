"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "How do I set up a fundraiser?",
  "Why are QR codes showing from last year?",
  "How do I refund a ticket purchase?",
  "How do I add team members?",
];

export default function SupportChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(question: string) {
    if (!question.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: question,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const assistantId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "" },
    ]);

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (!res.ok) throw new Error("Request failed");
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: m.content + text } : m
          )
        );
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: "Sorry, something went wrong. Please try again or contact our support team." }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'Inter', sans-serif;
          background: #f5f7fa;
          color: #1a202c;
          min-height: 100vh;
        }

        /* Nav */
        .nav {
          background: white;
          border-bottom: 1px solid #e2e8f0;
          padding: 0 32px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .nav-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }
        .nav-logo-circle {
          width: 36px; height: 36px;
          background: #1a56db;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .nav-logo-circle span {
          color: white;
          font-weight: 800;
          font-size: 13px;
          letter-spacing: -0.5px;
        }
        .nav-logo-text {
          font-size: 18px;
          font-weight: 700;
          letter-spacing: -0.3px;
        }
        .nav-logo-text em {
          color: #22c55e;
          font-style: normal;
        }
        .nav-links {
          display: flex; gap: 28px; align-items: center;
        }
        .nav-links a {
          color: #4a5568;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
        }
        .nav-cta {
          background: #22c55e;
          color: white !important;
          padding: 8px 18px;
          border-radius: 8px;
          font-weight: 600 !important;
          font-size: 14px !important;
          transition: background 0.15s;
        }
        .nav-cta:hover { background: #16a34a; }

        /* Hero */
        .hero {
          background: white;
          border-bottom: 1px solid #e2e8f0;
          padding: 48px 32px 40px;
          text-align: center;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #16a34a;
          font-size: 12px;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: 100px;
          margin-bottom: 16px;
          letter-spacing: 0.3px;
          text-transform: uppercase;
        }
        .hero-badge::before { content: '✦'; font-size: 10px; }
        .hero h1 {
          font-size: 32px;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.5px;
          margin-bottom: 10px;
        }
        .hero h1 span { color: #1a56db; }
        .hero p {
          color: #64748b;
          font-size: 16px;
          max-width: 480px;
          margin: 0 auto;
          line-height: 1.6;
        }

        /* Chat layout */
        .chat-layout {
          max-width: 800px;
          margin: 32px auto;
          padding: 0 16px 32px;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .chat-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04);
        }

        /* Chat header */
        .chat-header {
          padding: 16px 20px;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #fafbfc;
        }
        .chat-header-left {
          display: flex; align-items: center; gap: 10px;
        }
        .chat-avatar {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, #1a56db, #22c55e);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
        }
        .chat-header-title {
          font-weight: 600;
          font-size: 14px;
          color: #0f172a;
        }
        .chat-header-sub {
          font-size: 12px;
          color: #94a3b8;
          margin-top: 1px;
        }
        .chat-status {
          display: flex; align-items: center; gap: 6px;
          font-size: 12px; color: #16a34a; font-weight: 500;
        }
        .chat-status-dot {
          width: 7px; height: 7px;
          background: #22c55e;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.85); }
        }

        /* Messages area */
        .messages-area {
          height: 460px;
          overflow-y: auto;
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          scroll-behavior: smooth;
        }
        .messages-area::-webkit-scrollbar { width: 4px; }
        .messages-area::-webkit-scrollbar-track { background: transparent; }
        .messages-area::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 4px; }

        /* Empty state */
        .empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 8px;
          padding: 20px;
          height: 100%;
        }
        .empty-icon {
          width: 52px; height: 52px;
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px;
          margin-bottom: 4px;
        }
        .empty-state h3 {
          font-size: 16px;
          font-weight: 600;
          color: #0f172a;
        }
        .empty-state p {
          font-size: 13px;
          color: #94a3b8;
          max-width: 300px;
          line-height: 1.5;
        }
        .suggestions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          width: 100%;
          max-width: 440px;
          margin-top: 8px;
        }
        .suggestion-btn {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 13px;
          color: #475569;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          text-align: left;
          line-height: 1.4;
          transition: all 0.15s;
          font-weight: 500;
        }
        .suggestion-btn:hover {
          background: #f0f9ff;
          border-color: #1a56db;
          color: #1a56db;
        }

        /* Messages */
        .message { display: flex; flex-direction: column; }
        .message--user { align-items: flex-end; }
        .message--assistant { align-items: flex-start; }

        .message-meta {
          font-size: 11px;
          color: #94a3b8;
          margin-bottom: 4px;
          padding: 0 4px;
          font-weight: 500;
        }

        .message-bubble {
          max-width: 75%;
          padding: 11px 15px;
          border-radius: 14px;
          font-size: 14px;
          line-height: 1.6;
          white-space: pre-wrap;
        }
        .message--user .message-bubble {
          background: #1a56db;
          color: white;
          border-bottom-right-radius: 4px;
        }
        .message--assistant .message-bubble {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          color: #334155;
          border-bottom-left-radius: 4px;
          min-width: 60px;
          min-height: 42px;
        }

        /* Typing dots */
        .typing-dots {
          display: flex; gap: 4px; align-items: center; height: 18px;
        }
        .typing-dots span {
          width: 6px; height: 6px;
          background: #94a3b8;
          border-radius: 50%;
          animation: bounce 1.2s infinite;
        }
        .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
        .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40% { transform: translateY(-5px); opacity: 1; }
        }

        /* Input area */
        .input-area {
          padding: 14px 16px;
          border-top: 1px solid #f1f5f9;
          background: #fafbfc;
        }
        .input-form {
          display: flex;
          gap: 8px;
          align-items: center;
          background: white;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          padding: 6px 6px 6px 14px;
          transition: border-color 0.15s;
        }
        .input-form:focus-within {
          border-color: #1a56db;
          box-shadow: 0 0 0 3px rgba(26, 86, 219, 0.08);
        }
        .chat-input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          color: #0f172a;
          background: transparent;
          padding: 4px 0;
        }
        .chat-input::placeholder { color: #94a3b8; }
        .chat-input:disabled { opacity: 0.6; }
        .send-button {
          width: 36px; height: 36px;
          background: #1a56db;
          border: none;
          border-radius: 8px;
          color: white;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: all 0.15s;
        }
        .send-button:hover:not(:disabled) { background: #1e40af; }
        .send-button:disabled { background: #cbd5e1; cursor: not-allowed; }

        .input-hint {
          font-size: 11px;
          color: #94a3b8;
          text-align: center;
          margin-top: 8px;
        }
        .input-hint a { color: #1a56db; text-decoration: none; }

        /* Footer stats */
        .stats-bar {
          display: flex;
          justify-content: center;
          gap: 32px;
          margin-top: 24px;
          padding: 20px;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
        }
        .stat { text-align: center; }
        .stat-number {
          font-size: 20px;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.5px;
        }
        .stat-label {
          font-size: 12px;
          color: #94a3b8;
          margin-top: 2px;
        }
      `}</style>

      {/* Nav */}
      <nav className="nav">
        <a href="https://www.boosterhub.com" className="nav-logo">
          <div className="nav-logo-circle">
            <span>HUB</span>
          </div>
          <span className="nav-logo-text"><em>BOOSTER</em>HUB</span>
        </a>
        <div className="nav-links">
          <a href="#">Features</a>
          <a href="#">Pricing</a>
          <a href="#">Academy</a>
          <a href="#" className="nav-cta">Start Free Trial</a>
        </div>
      </nav>

      {/* Hero */}
      <div className="hero">
        <div className="hero-badge">AI Support Assistant</div>
        <h1>Get answers <span>instantly</span></h1>
        <p>Powered by thousands of real support conversations. Ask anything about BoosterHub.</p>
      </div>

      {/* Chat */}
      <div className="chat-layout">
        <div className="chat-card">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-left">
              <div className="chat-avatar">🤝</div>
              <div>
                <div className="chat-header-title">BoosterHub Support</div>
                <div className="chat-header-sub">AI-powered · Trained on real support data</div>
              </div>
            </div>
            <div className="chat-status">
              <span className="chat-status-dot" />
              Online
            </div>
          </div>

          {/* Messages */}
          <div className="messages-area">
            {messages.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">💬</div>
                <h3>How can we help you today?</h3>
                <p>Ask anything about events, tickets, fundraising, QR codes, and more.</p>
                <div className="suggestions-grid">
                  {SUGGESTIONS.map((s) => (
                    <button key={s} className="suggestion-btn" onClick={() => sendMessage(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((m) => (
                  <div key={m.id} className={`message message--${m.role}`}>
                    <div className="message-meta">
                      {m.role === "user" ? "You" : "BoosterHub Support"}
                    </div>
                    <div className="message-bubble">
                      {m.content || (
                        <div className="typing-dots">
                          <span /><span /><span />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </>
            )}
          </div>

          {/* Input */}
          <div className="input-area">
            <form className="input-form" onSubmit={handleSubmit}>
              <input
                className="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question about BoosterHub..."
                disabled={isLoading}
                autoFocus
              />
              <button className="send-button" type="submit" disabled={isLoading || !input.trim()}>
                {isLoading ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2.5" strokeDasharray="28" strokeDashoffset="8">
                      <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/>
                    </circle>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M22 2L11 13" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </form>
            <p className="input-hint">
              Can't find your answer? <a href="https://www.boosterhub.com/faq">Browse our FAQ</a> or contact support.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-bar">
          <div className="stat">
            <div className="stat-number">3.8K+</div>
            <div className="stat-label">Support conversations</div>
          </div>
          <div className="stat">
            <div className="stat-number">650+</div>
            <div className="stat-label">Booster clubs</div>
          </div>
          <div className="stat">
            <div className="stat-number">24/7</div>
            <div className="stat-label">Always available</div>
          </div>
        </div>
      </div>
    </>
  );
}