"use client";

import { useState } from "react";
import type { FaqItem } from "@/lib/content";

interface Props {
  items: FaqItem[];
}

export default function FaqAccordion({ items }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!items.length) return null;

  return (
    <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={i}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left group"
              aria-expanded={isOpen}
            >
              <span
                className={`font-bold text-sm md:text-base leading-snug transition-colors ${
                  isOpen ? "text-brand" : "text-gray-800 group-hover:text-brand"
                }`}
              >
                {item.q}
              </span>
              <span
                className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                  isOpen
                    ? "border-brand bg-brand text-white rotate-45"
                    : "border-gray-300 text-gray-400 group-hover:border-brand group-hover:text-brand"
                }`}
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m-8-8h16" />
                </svg>
              </span>
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                isOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="px-6 pb-6 pt-0">
                <div className="h-px bg-brand/20 mb-4" />
                <p className="text-gray-600 leading-relaxed text-sm md:text-[0.97rem] whitespace-pre-line">
                  {item.a
                    .replace(/\*\*([^*]+)\*\*/g, "$1")
                    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
