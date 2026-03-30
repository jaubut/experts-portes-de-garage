"use client";

import { useBookingModal } from "@/context/BookingModalContext";

export default function PlanifierButton({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { openModal } = useBookingModal();
  return (
    <button type="button" onClick={openModal} className={className}>
      {children}
    </button>
  );
}
