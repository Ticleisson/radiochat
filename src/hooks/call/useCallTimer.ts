
import { useState, useRef } from "react";
import { formatCallDuration } from "@/utils/callTranscription";

export const useCallTimer = () => {
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [duration, setDuration] = useState("00:00");
  const durationInterval = useRef<NodeJS.Timeout | null>(null);

  // Inicia o temporizador da chamada
  const startCallTimer = () => {
    setStartTime(new Date());
    
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
    }
    
    durationInterval.current = setInterval(() => {
      setDuration(formatCallDuration(new Date()));
    }, 1000);
  };

  // Para o temporizador da chamada
  const stopCallTimer = () => {
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
      durationInterval.current = null;
    }
  };

  return {
    duration,
    startCallTimer,
    stopCallTimer
  };
};
