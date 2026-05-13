"use client";

import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import s from "./ChatWidget.module.css";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "How do I refund a ticket?",
  "Why are old QR codes showing up?",
  "Set up a new fundraiser",
  "Invite parents to my club",
];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  async function sendMessage(question: string) {
    if (!question.trim() || isLoading) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: question };
    const assistantId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      userMsg,
      { id: assistantId, role: "assistant", content: "" },
    ]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.NEXT_PUBLIC_SUPPORT_API_KEY ?? "",
        },
        body: JSON.stringify({ question }),
      });

      if (!res.ok || !res.body) throw new Error("Request failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, content: m.content + chunk } : m
          )
        );
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: "Sorry, something went wrong. Please try again in a moment." }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className={s.root}>
      {isOpen && (
        <div className={s.panel} role="dialog" aria-label="BoosterHub Support chat">
          <div className={s.header}>
            <div className={s.headerAvatar}>BH</div>
            <div className={s.headerInfo}>
              <div className={s.headerTitle}>BoosterHub Support</div>
              <div className={s.headerSub}>
                <span className={s.statusDot} />
                Usually replies instantly
              </div>
            </div>
            <button
              type="button"
              className={s.close}
              aria-label="Close chat"
              onClick={() => setIsOpen(false)}
            >
              <CloseIcon />
            </button>
          </div>

          <div className={s.messages}>
            {messages.length === 0 ? (
              <div className={s.empty}>
                <div className={s.emptyHero}>
                  <h3 className={s.emptyHeadline}>Hi! How can we help?</h3>
                  <p className={s.emptyBlurb}>
                    Ask anything about BoosterHub — events, fundraisers, store orders, or settings.
                  </p>
                </div>
                <div className={s.suggestLabel}>Try asking</div>
                <div className={s.suggestList}>
                  {SUGGESTIONS.map((q) => (
                    <button
                      key={q}
                      type="button"
                      className={s.suggest}
                      onClick={() => sendMessage(q)}
                    >
                      <SparkleIcon />
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`${s.msg} ${m.role === "user" ? s.msgUser : s.msgAssistant}`}
                  >
                    <div className={s.msgBubble}>
                      {m.content
                        ? m.role === "assistant"
                          ? renderMarkdown(m.content)
                          : m.content
                        : (
                          <span className={s.typing}>
                            <span /><span /><span />
                          </span>
                        )}
                    </div>
                  </div>
                ))}
                <div ref={scrollRef} />
              </>
            )}
          </div>

          <form
            className={s.form}
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
          >
            <div className={s.inputRow}>
              <input
                ref={inputRef}
                className={s.input}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question…"
                disabled={isLoading}
                autoComplete="off"
              />
              <button
                type="submit"
                className={s.send}
                disabled={isLoading || !input.trim()}
                aria-label="Send message"
              >
                <SendIcon />
              </button>
            </div>
            <div className={s.disclaimer}>AI responses may contain mistakes. Verify important details.</div>
          </form>
        </div>
      )}

      <button
        type="button"
        className={s.fab}
        aria-label={isOpen ? "Close support chat" : "Open support chat"}
        onClick={() => setIsOpen((v) => !v)}
      >
        {isOpen ? <CloseIcon size={20} /> : <ChatIcon />}
      </button>
    </div>
  );
}

/* ----- minimal markdown renderer (no deps) ----- */
function renderMarkdown(text: string): ReactNode {
  // Split into blocks separated by one or more blank lines
  const blocks = text.split(/\n{2,}/);
  return blocks.map((raw, i) => {
    const block = raw.trim();
    if (!block) return null;

    // Numbered list: lines starting with "1. " etc.
    if (/^\d+\.\s/.test(block) && block.split("\n").every((l) => /^\d+\.\s/.test(l) || /^\s+/.test(l))) {
      const items = block.split(/\n(?=\d+\.\s)/);
      return (
        <ol key={i} className={s.mdList}>
          {items.map((item, j) => (
            <li key={j}>{renderInline(item.replace(/^\d+\.\s+/, ""))}</li>
          ))}
        </ol>
      );
    }

    // Bullet list: lines starting with "- " or "* "
    if (/^[-*]\s/.test(block) && block.split("\n").every((l) => /^[-*]\s/.test(l) || /^\s+/.test(l))) {
      const items = block.split(/\n(?=[-*]\s)/);
      return (
        <ul key={i} className={s.mdList}>
          {items.map((item, j) => (
            <li key={j}>{renderInline(item.replace(/^[-*]\s+/, ""))}</li>
          ))}
        </ul>
      );
    }

    // Paragraph (preserve single-newline soft breaks)
    return (
      <p key={i} className={s.mdParagraph}>
        {renderInline(block)}
      </p>
    );
  });
}

function renderInline(text: string): ReactNode {
  // Tokenize **bold**, `code`, and the rest as text. Newlines become <br/>.
  const parts: ReactNode[] = [];
  const regex = /\*\*([^*]+?)\*\*|`([^`]+?)`/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push(withBreaks(text.slice(last, m.index), key++));
    if (m[1]) parts.push(<strong key={key++}>{m[1]}</strong>);
    else if (m[2]) parts.push(<code key={key++} className={s.mdCode}>{m[2]}</code>);
    last = regex.lastIndex;
  }
  if (last < text.length) parts.push(withBreaks(text.slice(last), key++));
  return parts;
}

function withBreaks(text: string, key: number): ReactNode {
  const lines = text.split("\n");
  return (
    <Fragment key={key}>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {line}
        </Fragment>
      ))}
    </Fragment>
  );
}

function ChatIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>
    </svg>
  );
}

function CloseIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2L11 13" />
      <path d="M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.8 4.8L18 9l-4.2 1.2L12 15l-1.8-4.8L6 9l4.2-1.2L12 3z" />
      <path d="M19 13l.7 1.9L21.6 16l-1.9.7L19 18.6l-.7-1.9L16.4 16l1.9-.7L19 13z" />
    </svg>
  );
}
