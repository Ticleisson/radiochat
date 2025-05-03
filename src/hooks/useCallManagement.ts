
import { useRef, useEffect } from "react";
import { Call } from "@/services/callsService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Importação dos hooks específicos
import { useJitsiConnection } from "./call/useJitsiConnection";
import { useCallParticipants } from "./call/useCallParticipants";
import { useCallTimer } from "./call/useCallTimer";
import { useCallRecording } from "./call/useCallRecording";

export const useCallManagement = (callId: string | undefined) => {
  const { user } = useAuth();
  
  // Hooks específicos
  const { 
    isConnected, 
    jitsiManagerRef, 
    initializeJitsi,
    setupConnectionEventHandlers,
    joinJitsiRoom, 
    leaveJitsiRoom 
  } = useJitsiConnection();
  
  const {
    callParticipants,
    setupParticipantEventHandlers,
    initLocalParticipant,
    toggleAudio: toggleParticipantAudio,
    clearParticipants
  } = useCallParticipants(jitsiManagerRef);
  
  const { 
    duration, 
    startCallTimer, 
    stopCallTimer 
  } = useCallTimer();
  
  const {
    isRecording,
    transcriptionText,
    autoSaveTranscription,
    toggleRecording: toggleCallRecording,
    clearTranscription
  } = useCallRecording();
  
  // Clean up all resources on unmount
  useEffect(() => {
    return () => {
      stopCallTimer();
      leaveJitsiRoom();
      clearTranscription();
    };
  }, []);
  
  // Start the call with provided call data
  const startCall = async (callData: Call) => {
    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }
    
    // Reset call state
    clearTranscription();
    
    try {
      // Inicializa o gerenciador Jitsi
      const jitsi = initializeJitsi();
      
      // Configura manipuladores de eventos
      jitsi.setEventHandlers({
        ...setupConnectionEventHandlers(),
        ...setupParticipantEventHandlers(user.id, user.user_metadata?.name || "Apresentador")
      });
      
      // Nome da sala baseado no ID da chamada ou gera um aleatório para novas chamadas
      const roomName = callId && callId !== 'new' 
        ? `call-${callId}` 
        : `call-${Math.floor(Math.random() * 1000000)}`;
      
      const displayName = user.user_metadata?.name || "Apresentador";
      
      // Entra na sala Jitsi
      const joinSuccess = await joinJitsiRoom(roomName, displayName);
      
      if (joinSuccess) {
        // Inicializa o participante local (usuário atual)
        initLocalParticipant(user.id, displayName, callData.type === "video");
        
        // Inicia o temporizador da chamada
        startCallTimer();
      } else {
        toast.error("Não foi possível entrar na sala de conferência");
      }
    } catch (error) {
      console.error("Erro ao iniciar chamada:", error);
      toast.error("Erro ao iniciar chamada. Verifique sua conexão.");
    }
  };
  
  // Toggle participant's audio
  const toggleAudio = (participantId: string) => {
    if (participantId === user?.id) {
      toggleParticipantAudio(participantId);
    }
    // Não podemos controlar o áudio de outros participantes
  };
  
  // Toggle recording
  const toggleRecording = () => {
    toggleCallRecording(callParticipants);
  };
  
  // End call
  const endCallSession = () => {
    stopCallTimer();
    leaveJitsiRoom();
    clearParticipants();
  };
  
  return {
    callParticipants,
    duration,
    isRecording,
    transcriptionText,
    autoSaveTranscription,
    isConnected,
    toggleAudio,
    toggleRecording,
    startCall,
    endCallSession
  };
};
