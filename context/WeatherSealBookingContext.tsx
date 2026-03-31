"use client";

import { createContext, useContext, useState } from "react";
import WeatherSealBookingModal from "@/components/WeatherSealBookingModal";

interface WeatherSealBookingContextType {
  openModal: () => void;
}

const WeatherSealBookingContext = createContext<WeatherSealBookingContextType>({
  openModal: () => {},
});

export function useWeatherSealBooking() {
  return useContext(WeatherSealBookingContext);
}

export function WeatherSealBookingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <WeatherSealBookingContext.Provider value={{ openModal: () => setIsOpen(true) }}>
      {children}
      <WeatherSealBookingModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </WeatherSealBookingContext.Provider>
  );
}
