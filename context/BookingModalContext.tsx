"use client";

import { createContext, useContext, useState } from "react";
import BookingModal from "@/components/BookingModal";

interface BookingModalContextType {
  openModal: () => void;
}

const BookingModalContext = createContext<BookingModalContextType>({
  openModal: () => {},
});

export function useBookingModal() {
  return useContext(BookingModalContext);
}

export function BookingModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <BookingModalContext.Provider value={{ openModal: () => setIsOpen(true) }}>
      {children}
      <BookingModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </BookingModalContext.Provider>
  );
}
