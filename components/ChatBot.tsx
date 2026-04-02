"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

type Message = { role: "user" | "assistant"; content: string; link?: { label: string; href: string } };

const SUGGESTIONS = [
  "Réparation urgente",
  "Demander un devis",
  "Zone de service",
];

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [bubble, setBubble] = useState(true);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (!bubble) {
      timer = setTimeout(() => setBubble(true), 3 * 60 * 1000);
    }
    return () => clearTimeout(timer);
  }, [bubble]);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Bonjour! 👋 Je suis l'assistant d'Experts Portes de Garage. Comment puis-je vous aider?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open]);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const newMessages: Message[] = [...messages, { role: "user", content }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.message, link: data.link ?? undefined }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Désolé, une erreur est survenue. Appelez-nous au 450-558-5788." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Bubble message */}
      {bubble && !open && (
        <div className="fixed bottom-20 right-5 z-50 w-[260px] bg-white rounded-2xl shadow-2xl animate-fade-in-up overflow-hidden">
          <button
            type="button"
            onClick={() => setBubble(false)}
            className="absolute top-2.5 right-2.5 text-gray-300 hover:text-gray-500 transition-colors"
            aria-label="Fermer"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="px-4 pt-4 pb-3">
            <p className="text-[#1a1a1a] text-sm leading-relaxed pr-4">
              Je suis Alex, votre assistant. Des questions sur vos portes de garage? Je suis là pour vous aider!
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border-t border-gray-100">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { setBubble(false); setOpen(true); send(); } }}
              onFocus={() => { setBubble(false); setOpen(true); }}
              placeholder="Écrire un message..."
              className="flex-1 bg-transparent text-[16px] text-[#1a1a1a] placeholder-gray-400 outline-none"
            />
            <button
              type="button"
              onClick={() => { setBubble(false); setOpen(true); send(); }}
              aria-label="Envoyer"
              className="w-7 h-7 rounded-full bg-brand flex items-center justify-center flex-shrink-0 hover:bg-brand-dark transition-colors"
            >
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button
        onClick={() => { setOpen((o) => !o); setBubble(false); }}
        aria-label="Ouvrir le chat"
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-brand shadow-lg shadow-brand/40 flex items-center justify-center hover:bg-brand-dark transition-all hover:scale-105"
      >
        {open ? (
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-5 z-50 w-full h-full sm:w-[380px] sm:h-auto sm:max-h-[520px] sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col border-0 sm:border sm:border-white/10">
          {/* Header */}
          <div className="bg-[#1a1a1a] px-4 py-3 flex items-center gap-3 flex-shrink-0">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-brand flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-[#1a1a1a]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm leading-none">Assistant Experts</p>
              <p className="text-green-400 text-[10px] font-medium mt-0.5">En ligne</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-[#0f0f0f] px-4 py-4 flex flex-col gap-3" style={{ minHeight: 0 }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-brand text-white rounded-br-sm"
                      : "bg-white/8 border border-white/10 text-white/80 rounded-bl-sm"
                  }`}
                >
                  {m.content}
                </div>
                {m.link && (
                  <Link
                    href={m.link.href}
                    className="mt-1.5 inline-flex items-center gap-1.5 bg-brand text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-brand-dark transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    {m.link.label} →
                  </Link>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/8 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5">
                  <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && (
            <div className="bg-[#0f0f0f] px-4 pb-2 flex gap-2 flex-wrap flex-shrink-0">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="text-[10px] font-semibold text-brand border border-brand/40 rounded-full px-3 py-1 hover:bg-brand hover:text-white transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="bg-[#1a1a1a] px-3 py-3 flex gap-2 flex-shrink-0">
            <input
              ref={inputRef}
              type="text"
              inputMode="text"
              enterKeyHint="send"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Écrivez votre message..."
              className="flex-1 bg-white/8 border border-white/10 rounded-xl px-4 py-3 text-[16px] text-white placeholder-white/30 outline-none focus:border-brand/50 transition-colors"
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              className="w-12 h-12 rounded-xl bg-brand flex items-center justify-center hover:bg-brand-dark transition-colors disabled:opacity-40 flex-shrink-0 active:scale-95"
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
