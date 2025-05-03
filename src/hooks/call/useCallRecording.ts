
import { useState, useRef } from "react";
import { toast } from "sonner";

export const useCallRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptionText, setTranscriptionText] = useState("");
  const [autoSaveTranscription, setAutoSaveTranscription] = useState(true);
  const transcriptionInterval = useRef<NodeJS.Timeout | null>(null);

  // Alterna o estado de gravação
  const toggleRecording = (callParticipants: any[]) => {
    const newIsRecording = !isRecording;
    setIsRecording(newIsRecording);
    
    if (newIsRecording) {
      startRecording(callParticipants);
    } else {
      stopRecording();
    }
    
    return newIsRecording;
  };

  // Inicia a gravação
  const startRecording = (callParticipants: any[]) => {
    // Em uma implementação real, isso iniciaria a gravação na API
    // Por enquanto, vamos simular transcrições aparecendo periodicamente
    transcriptionInterval.current = setInterval(() => {
      const timestamp = new Date().toLocaleTimeString();
      const speakerName = callParticipants.find(p => p.isLocal)?.name || "Apresentador";
      
      setTranscriptionText(prev => {
        const newLine = `[${timestamp}] ${speakerName}: Esta é uma transcrição simulada. Em uma implementação real, seria o texto transcrito da fala dos participantes.`;
        return prev ? `${prev}\n\n${newLine}` : newLine;
      });
    }, 5000);
    
    toast.success("Gravação iniciada");
  };

  // Para a gravação
  const stopRecording = () => {
    if (transcriptionInterval.current) {
      clearInterval(transcriptionInterval.current);
      transcriptionInterval.current = null;
    }
    
    toast.success("Gravação finalizada");
  };

  // Limpa a transcrição
  const clearTranscription = () => {
    setTranscriptionText("");
    setIsRecording(false);
    if (transcriptionInterval.current) {
      clearInterval(transcriptionInterval.current);
      transcriptionInterval.current = null;
    }
  };

  return {
    isRecording,
    transcriptionText,
    autoSaveTranscription,
    toggleRecording,
    clearTranscription
  };
};
