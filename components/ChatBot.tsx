"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

type Message = { role: "user" | "assistant"; content: string; link?: { label: string; href: string } };

const SUGGESTIONS = ["Réparation urgente", "Demander un devis", "Zone de service"];

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [bubble, setBubble] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Bonjour! 👋 Je suis Alex, l'assistant d'Experts Portes de Garage. Je peux répondre à vos questions sur nos services, prix et diagnostics. Note : mes conseils sont à titre informatif seulement — pour toute intervention, un technicien qualifié doit évaluer la situation. Comment puis-je vous aider?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const closeChat = () => {
    setClosing(true);
    setTimeout(() => { setOpen(false); setClosing(false); }, 220);
  };

  // Bubble reappears after 3 min
  useEffect(() => {
    if (bubble) return;
    const t = setTimeout(() => setBubble(true), 3 * 60 * 1000);
    return () => clearTimeout(t);
  }, [bubble]);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  // Focus input when chat opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  async function send(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    const next: Message[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.map((m) => ({ role: m.role, content: m.content })) }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.message, link: data.link ?? undefined }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Désolé, une erreur est survenue. Appelez-nous au 438-808-9604." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* ── Bubble preview ──
          bottom-[6.5rem] laisse 28 px au-dessus du bouton rond, qui fait
          56 px de haut a bottom-5. Avec l'ancien bottom-20 il ne restait
          que 4 px : les deux ombres se rejoignaient et la bulle blanche
          avait l'air d'un rectangle colle au bouton. La marge absorbe
          aussi le translateY(10px) que l'animation laisse parfois en
          place quand elle ne demarre jamais (onglet en arriere-plan). */}
      {bubble && !open && (
        <div className="epg-chat fixed bottom-[6.5rem] right-5 z-50 w-[260px] bg-white rounded-2xl shadow-xl shadow-black/10 ring-1 ring-black/5 animate-fade-in-up overflow-hidden">
          <button
            type="button"
            onClick={() => setBubble(false)}
            aria-label="Fermer"
            className="absolute top-2.5 right-2.5 text-brand hover:text-brand-dark transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="px-4 pt-4 pb-3">
            <p className="text-[#1a1a1a] text-sm leading-relaxed pr-4">
              Je suis Alex, votre assistant. Des questions sur vos portes de garage?
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 border-t border-gray-100">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onFocus={() => { setBubble(false); setOpen(true); }}
              onKeyDown={(e) => { if (e.key === "Enter") { setBubble(false); setOpen(true); send(); } }}
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

      {/* ── Floating toggle button ── */}
      <button
        type="button"
        onClick={() => { open ? closeChat() : setOpen(true); setBubble(false); }}
        aria-label={open ? "Fermer le chat" : "Ouvrir le chat"}
        className="epg-chat fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-brand shadow-lg shadow-brand/40 flex items-center justify-center hover:bg-brand-dark transition-all hover:scale-105 active:scale-95"
      >
        <svg
          className={`absolute w-6 h-6 text-white transition-all duration-200 ${open ? "opacity-0 rotate-90 scale-75" : "opacity-100 rotate-0 scale-100"}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        <svg
          className={`absolute w-5 h-5 text-white transition-all duration-200 ${open ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-75"}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* ── Chat popover — never fullscreen, anchored above button ── */}
      {open && (
        <div
          className={`epg-chat fixed bottom-[6.5rem] right-4 left-4 sm:left-auto sm:right-5 sm:w-[380px] z-50 rounded-2xl shadow-xl shadow-black/10 flex flex-col bg-white border border-gray-200 overflow-hidden ${closing ? "animate-fade-out" : "animate-fade-in-up"}`}
          style={{ maxHeight: "min(520px, calc(100svh - 100px))" }}
        >
          {/* Header */}
          <div className="bg-brand px-4 py-3 flex items-center gap-3 flex-shrink-0">
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-brand" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm leading-none">Assistant Experts</p>
              <p className="text-white/70 text-[10px] font-medium mt-0.5">En ligne</p>
            </div>
            <button type="button" onClick={closeChat} aria-label="Fermer le chat" className="text-white/60 hover:text-white transition-colors p-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages — scrollable area */}
          <div
            className="flex-1 overflow-y-auto overscroll-contain bg-gray-50 px-4 py-4 flex flex-col gap-3"
            style={{ minHeight: 0 }}
          >
            {messages.map((m, i) => (
              <div key={i} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                <div className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-brand text-white rounded-br-sm"
                    : "bg-white border border-gray-200 text-gray-700 rounded-bl-sm shadow-sm"
                }`}>
                  {m.content}
                </div>
                {m.link && (
                  <Link
                    href={m.link.href}
                    className="mt-1.5 inline-flex items-center gap-1.5 bg-brand text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-brand-dark transition-colors"
                    onClick={closeChat}
                  >
                    {m.link.label} →
                  </Link>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 shadow-sm rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions — only on first message */}
          {messages.length <= 1 && (
            <div className="bg-gray-50 px-4 pb-2 flex gap-2 flex-wrap flex-shrink-0">
              {SUGGESTIONS.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => send(s)}
                  className="text-[10px] font-semibold text-brand border border-brand/40 rounded-full px-3 py-1 hover:bg-brand hover:text-white transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input bar */}
          <div className="bg-white border-t border-gray-100 px-3 py-3 flex-shrink-0">
            <div className="relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                inputMode="text"
                enterKeyHint="send"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Écrivez votre message..."
                className="w-full bg-gray-100 border border-gray-200 rounded-2xl pl-4 pr-14 py-3.5 text-[16px] text-gray-800 placeholder-gray-400 outline-none focus:border-brand/50 focus:bg-white transition-colors"
              />
              <button
                type="button"
                onClick={() => send()}
                disabled={!input.trim() || loading}
                aria-label="Envoyer"
                className="absolute right-2 w-9 h-9 rounded-xl bg-brand flex items-center justify-center hover:bg-brand-dark transition-colors disabled:opacity-30 active:scale-90 flex-shrink-0"
              >
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
