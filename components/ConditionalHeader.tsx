"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

const HIDDEN_ON = ["/remplacement-coupe-froid-porte-de-garage"];

export default function ConditionalHeader() {
  const pathname = usePathname();
  if (HIDDEN_ON.includes(pathname)) return null;
  return <Header />;
}
