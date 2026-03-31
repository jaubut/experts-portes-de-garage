"use client";

import { useWeatherSealBooking } from "@/context/WeatherSealBookingContext";

interface WeatherSealPlanifierButtonProps {
  className?: string;
  children: React.ReactNode;
}

export default function WeatherSealPlanifierButton({ className, children }: WeatherSealPlanifierButtonProps) {
  const { openModal } = useWeatherSealBooking();
  return (
    <button type="button" onClick={openModal} className={className}>
      {children}
    </button>
  );
}
