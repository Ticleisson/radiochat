
import { useState, useEffect, useRef } from "react";
import { formatCallDuration } from "@/utils/callTranscription";
import { Call } from "@/services/callsService";
import { useAuth } from "@/contexts/AuthContext";
import JitsiManager from "@/utils/jitsi/JitsiManager";
import { JitsiParticipant } from "@/utils/jitsi/types";
import { toast } from "sonner";

export const useCallManagement = (callId: string | undefined) => {
  const [callParticipants, setCallParticipants] = useState<JitsiParticipant[]>([]);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [duration, setDuration] = useState("00:00");
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptionText, setTranscriptionText] = useState("");
  const [autoSaveTranscription, setAutoSaveTranscription] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  
  const { user } = useAuth();
  const jitsiManagerRef = useRef<JitsiManager | null>(null);
  const durationInterval = useRef<NodeJS.Timeout | null>(null);
  const transcriptionInterval = useRef<NodeJS.Timeout | null>(null);
  
  // Clean up all intervals on unmount
  useEffect(() => {
    return () => {
      if (durationInterval.current) clearInterval(durationInterval.current);
      if (transcriptionInterval.current) clearInterval(transcriptionInterval.current);
      
      // Desconecta do Jitsi quando o componente é desmontado
      if (jitsiManagerRef.current) {
        jitsiManagerRef.current.leaveRoom();
        jitsiManagerRef.current = null;
      }
    };
  }, []);
  
  // Start the call with provided call data
  const startCall = async (callData: Call) => {
    if (!user) {
      toast.error("Usuário não autenticado");
      return;
    }
    
    // Reset call state
    setTranscriptionText("");
    setIsRecording(false);
    if (transcriptionInterval.current) clearInterval(transcriptionInterval.current);
    
    try {
      // Inicializa o gerenciador Jitsi se ainda não estiver inicializado
      if (!jitsiManagerRef.current) {
        console.log("Inicializando gerenciador Jitsi");
        jitsiManagerRef.current = new JitsiManager();
        
        // Configura manipuladores de eventos para participantes e tracks
        jitsiManagerRef.current.setEventHandlers({
          participantJoined: (participant) => {
            console.log("Participante entrou:", participant);
            setCallParticipants(prev => [...prev, participant]);
          },
          participantLeft: (participantId) => {
            console.log("Participante saiu:", participantId);
            setCallParticipants(prev => prev.filter(p => p.id !== participantId));
          },
          participantUpdated: (participant) => {
            console.log("Participante atualizado:", participant);
            setCallParticipants(prev => 
              prev.map(p => p.id === participant.id ? participant : p)
            );
          },
          connectionEstablished: () => {
            console.log("Conexão estabelecida com Jitsi");
            setIsConnected(true);
          },
          connectionFailed: (error) => {
            console.error("Falha na conexão com Jitsi:", error);
            setIsConnected(false);
            toast.error("Falha na conexão. Tente novamente.");
          },
          connectionStatusChanged: (status) => {
            console.log("Status da conexão alterado:", status);
            setIsConnected(status === "connected");
          }
        });
      } else {
        // Ensure we reset the connection state if reusing the manager
        setIsConnected(false);
      }
      
      // Nome da sala baseado no ID da chamada ou gera um aleatório para novas chamadas
      const roomName = callId && callId !== 'new' 
        ? `call-${callId}` 
        : `call-${Math.floor(Math.random() * 1000000)}`;
      
      const displayName = user.user_metadata?.name || "Apresentador";
      
      // Entra na sala Jitsi
      console.log(`Entrando na sala: ${roomName} como ${displayName}`);
      const joinSuccess = await jitsiManagerRef.current.joinRoom(roomName, displayName);
      
      if (joinSuccess) {
        // Inicializa o participante local (usuário atual)
        const localParticipant: JitsiParticipant = {
          id: user.id,
          name: displayName,
          status: "connected",
          audio: true,
          video: callData.type === "video",
          isLocal: true
        };
        
        setCallParticipants([localParticipant]);
        
        // Inicia o temporizador da chamada
        startCallTimer();
      } else {
        toast.error("Não foi possível entrar na sala de conferência");
      }
    } catch (error) {
      console.error("Erro ao iniciar chamada:", error);
      toast.error("Erro ao iniciar chamada. Verifique sua conexão.");
      setIsConnected(false);
    }
  };
  
  // Start the call timer
  const startCallTimer = () => {
    setStartTime(new Date());
    
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
    }
    
    durationInterval.current = setInterval(() => {
      if (startTime) {
        setDuration(formatCallDuration(startTime));
      }
    }, 1000);
  };
  
  // Toggle participant's audio
  const toggleAudio = (participantId: string) => {
    // Se for o participante local (o usuário atual)
    if (participantId === user?.id && jitsiManagerRef.current) {
      const audioEnabled = jitsiManagerRef.current.toggleAudio();
      
      // Atualiza o estado do participante local
      setCallParticipants(participants => 
        participants.map(p => 
          p.isLocal ? { ...p, audio: audioEnabled } : p
        )
      );
    }
    // Não podemos controlar o áudio de outros participantes
  };
  
  // Toggle recording
  const toggleRecording = () => {
    setIsRecording(prev => {
      const newIsRecording = !prev;
      
      if (newIsRecording) {
        startRecording();
      } else {
        stopRecording();
      }
      
      return newIsRecording;
    });
  };
  
  // Start recording
  const startRecording = () => {
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
  
  // Stop recording
  const stopRecording = () => {
    if (transcriptionInterval.current) {
      clearInterval(transcriptionInterval.current);
      transcriptionInterval.current = null;
    }
    
    toast.success("Gravação finalizada");
  };
  
  // End call
  const endCallSession = () => {
    // Para todos os intervalos
    if (durationInterval.current) {
      clearInterval(durationInterval.current);
      durationInterval.current = null;
    }
    
    if (transcriptionInterval.current) {
      clearInterval(transcriptionInterval.current);
      transcriptionInterval.current = null;
    }
    
    // Sai da sala Jitsi
    if (jitsiManagerRef.current) {
      jitsiManagerRef.current.leaveRoom();
    }
    
    // Reseta o estado de conexão
    setIsConnected(false);
    setIsRecording(false);
    setCallParticipants([]);
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
