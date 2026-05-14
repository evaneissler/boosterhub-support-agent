"use client";

import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import s from "./Chat.module.css";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "How do I refund a ticket?",
  "Why are old QR codes showing up?",
  "How do I set up a new fundraiser?",
  "How do I invite parents to my club?",
];

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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

  const hasMessages = messages.length > 0;

  return (
    <div className={s.shell}>
      <header className={s.header}>
        <a
          className={s.brand}
          href="https://www.boosterhub.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="BoosterHub home"
        >
          <Image
            src="/boosterhub_logo.jpg"
            alt="BoosterHub"
            width={768}
            height={216}
            priority
            className={s.brandLogo}
          />
        </a>
        <span className={s.headerTitle}>Support Assistant</span>
        <div className={s.headerSpacer} />
        <div className={s.headerLinks}>
          <a
            className={s.headerLink}
            href="https://www.boosterhub.com/faq"
            target="_blank"
            rel="noopener noreferrer"
          >
            FAQs
          </a>
          <a
            className={s.headerLink}
            href="https://app.boosterhub.com/login"
            target="_blank"
            rel="noopener noreferrer"
          >
            Log in
          </a>
          <a
            className={s.headerCta}
            href="https://www.boosterhub.com/demo2024"
            target="_blank"
            rel="noopener noreferrer"
          >
            Watch a Demo
          </a>
        </div>
      </header>

      <div className={s.statusStrip}>
        <span className={s.statusDot} />
        AI assistant online · Usually replies instantly
      </div>

      <div className={s.messagesScroll}>
        {!hasMessages ? (
          <div className={s.empty}>
            <Image
              src="/boosterhub_logo.jpg"
              alt="BoosterHub"
              width={768}
              height={216}
              priority
              className={s.emptyLogo}
            />
            <h1 className={s.emptyHeadline}>
              Hi! <span className={s.accent}>How can we help?</span>
            </h1>
            <p className={s.emptyBlurb}>
              Ask anything about BoosterHub — events, fundraisers, store orders, accounting,
              volunteers, or club settings. Answers are drawn from real BoosterHub support history.
            </p>
            <div className={s.suggestGrid}>
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
          <div className={s.messages}>
            {messages.map((m) => (
              <div
                key={m.id}
                className={`${s.msg} ${m.role === "user" ? s.msgUser : s.msgAssistant}`}
              >
                {m.role === "assistant" && <div className={s.avatar}>BH</div>}
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
          </div>
        )}
      </div>

      <footer className={s.footer}>
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
              placeholder="Ask a question about BoosterHub…"
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
          <div className={s.disclaimer}>
            AI responses may contain mistakes. Verify important details or visit{" "}
            <a href="https://www.boosterhub.com" target="_blank" rel="noopener noreferrer">
              boosterhub.com
            </a>
            .
          </div>
        </form>
      </footer>
    </div>
  );
}

/* ---------- markdown renderer (no deps) ---------- */
function renderMarkdown(text: string): ReactNode {
  const blocks = text.split(/\n{2,}/);
  return blocks.map((raw, i) => {
    const block = raw.trim();
    if (!block) return null;

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

    return (
      <p key={i} className={s.mdParagraph}>
        {renderInline(block)}
      </p>
    );
  });
}

function renderInline(text: string): ReactNode {
  const parts: ReactNode[] = [];
  const regex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|\*\*([^*]+?)\*\*|`([^`]+?)`/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push(withBreaks(text.slice(last, m.index), key++));
    if (m[1] && m[2]) {
      parts.push(
        <a
          key={key++}
          className={s.mdLink}
          href={m[2]}
          target="_blank"
          rel="noopener noreferrer"
        >
          {m[1]}
        </a>
      );
    } else if (m[3]) parts.push(<strong key={key++}>{m[3]}</strong>);
    else if (m[4]) parts.push(<code key={key++} className={s.mdCode}>{m[4]}</code>);
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

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2L11 13" />
      <path d="M22 2l-7 20-4-9-9-4 20-7z" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3l1.8 4.8L18 9l-4.2 1.2L12 15l-1.8-4.8L6 9l4.2-1.2L12 3z" />
      <path d="M19 13l.7 1.9L21.6 16l-1.9.7L19 18.6l-.7-1.9L16.4 16l1.9-.7L19 13z" />
    </svg>
  );
}
