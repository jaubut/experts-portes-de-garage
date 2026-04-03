"use client";

import { usePathname } from "next/navigation";
import Footer from "./Footer";
import ChatBot from "./ChatBot";

const HIDDEN_ON = ["/admin"];

export default function ConditionalWrapper() {
  const pathname = usePathname();
  if (HIDDEN_ON.includes(pathname)) return null;
  return (
    <>
      <Footer />
      <ChatBot />
    </>
  );
}
