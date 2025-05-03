
import { useState } from "react";
import { JitsiParticipant } from "@/utils/jitsi/types";
import JitsiManager from "@/utils/jitsi/JitsiManager";

export const useCallParticipants = (jitsiManagerRef: React.MutableRefObject<JitsiManager | null>) => {
  const [callParticipants, setCallParticipants] = useState<JitsiParticipant[]>([]);

  // Configura manipuladores de eventos para participantes
  const setupParticipantEventHandlers = (userId: string, displayName: string) => {
    if (!jitsiManagerRef.current) return {};

    return {
      participantJoined: (participant: JitsiParticipant) => {
        console.log("Participante entrou:", participant);
        setCallParticipants(prev => [...prev, participant]);
      },
      participantLeft: (participantId: string) => {
        console.log("Participante saiu:", participantId);
        setCallParticipants(prev => prev.filter(p => p.id !== participantId));
      },
      participantUpdated: (participant: JitsiParticipant) => {
        console.log("Participante atualizado:", participant);
        setCallParticipants(prev => 
          prev.map(p => p.id === participant.id ? participant : p)
        );
      }
    };
  };

  // Inicializa o participante local
  const initLocalParticipant = (userId: string, displayName: string, hasVideo: boolean) => {
    const localParticipant: JitsiParticipant = {
      id: userId,
      name: displayName,
      status: "connected",
      audio: true,
      video: hasVideo,
      isLocal: true
    };
    
    setCallParticipants([localParticipant]);
    return localParticipant;
  };

  // Alterna o estado de áudio de um participante
  const toggleAudio = (participantId: string) => {
    if (jitsiManagerRef.current) {
      const audioEnabled = jitsiManagerRef.current.toggleAudio();
      
      setCallParticipants(participants => 
        participants.map(p => 
          p.isLocal && p.id === participantId ? { ...p, audio: audioEnabled } : p
        )
      );
    }
  };

  // Limpa participantes
  const clearParticipants = () => {
    setCallParticipants([]);
  };

  return {
    callParticipants,
    setupParticipantEventHandlers,
    initLocalParticipant,
    toggleAudio,
    clearParticipants
  };
};
