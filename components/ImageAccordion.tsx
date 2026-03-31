"use client";

import { useState } from "react";
import type { ReactNode } from "react";

interface ImageAccordionItem {
  title: string;
  imageUrl: string;
  content: ReactNode;
}

interface Props {
  items: ImageAccordionItem[];
}

export default function ImageAccordion({ items }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="flex flex-col gap-3">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={i} className="border-l-4 border-brand shadow-sm rounded-r-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className={`w-full flex items-center justify-between gap-4 px-6 py-5 text-left transition-colors duration-200 ${
                isOpen ? "bg-brand" : "bg-[#f8f8f8] hover:bg-brand/10"
              }`}
              aria-expanded={isOpen}
            >
              <span
                className={`font-heading text-sm md:text-base leading-snug uppercase transition-colors ${
                  isOpen ? "text-white" : "text-brand"
                }`}
              >
                {item.title}
              </span>
              <span
                className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 font-bold text-lg leading-none ${
                  isOpen
                    ? "bg-white text-brand"
                    : "bg-brand text-white"
                }`}
              >
                {isOpen ? "−" : "+"}
              </span>
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out bg-white ${
                isOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="px-6 pb-6 pt-4">
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full sm:w-52 sm:h-40 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    {item.content}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
