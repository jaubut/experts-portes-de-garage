"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import Footer from "./Footer";

const ChatBot = dynamic(() => import("./ChatBot"), { ssr: false });

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
