
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranscriptions } from "@/hooks/useTranscriptions";
import { jitsiManager, JitsiParticipant } from "@/utils/jitsiManager";
import { CallHeader } from "@/components/call/CallHeader";
import { ParticipantGrid } from "@/components/call/ParticipantGrid";
import { ControlPanel } from "@/components/call/ControlPanel";

const CallInterface = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addTranscription } = useTranscriptions();
  
  const [callData, setCallData] = useState({
    id: id || "active1",
    name: "Live Interview",
    startTime: new Date(),
    type: "audio" as "audio" | "video",
    participants: [] as JitsiParticipant[]
  });
  
  const [duration, setDuration] = useState("00:00");
  const [isRecording, setIsRecording] = useState(true); // Auto-recording by default
  const [transcriptionText, setTranscriptionText] = useState("");
  const [autoSaveTranscription, setAutoSaveTranscription] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  
  // Inicializa a chamada quando o componente é montado
  useEffect(() => {
    // Configura os handlers de eventos do Jitsi
    jitsiManager.setEventHandlers({
      onParticipantJoined: (participant) => {
        setCallData(prev => ({
          ...prev,
          participants: [...prev.participants.filter(p => p.id !== participant.id), participant]
        }));
      },
      onParticipantLeft: (participantId) => {
        setCallData(prev => ({
          ...prev,
          participants: prev.participants.filter(p => p.id !== participantId)
        }));
      },
      onAudioMuteStatusChanged: (participantId, muted) => {
        setCallData(prev => ({
          ...prev,
          participants: prev.participants.map(p => 
            p.id === participantId ? { ...p, audio: !muted } : p
          )
        }));
      },
      onVideoMuteStatusChanged: (participantId, muted) => {
        setCallData(prev => ({
          ...prev,
          participants: prev.participants.map(p => 
            p.id === participantId ? { ...p, video: !muted } : p
          )
        }));
      },
      onConnectionStatusChanged: (status) => {
        setIsConnected(status === "connected");
        
        if (status === "connected") {
          toast.success("Conectado à sala de chamada");
          // Atualiza a lista de participantes após conexão bem-sucedida
          setCallData(prev => ({
            ...prev,
            participants: jitsiManager.getAllParticipants()
          }));
        } else if (status === "failed") {
          toast.error("Falha na conexão");
        }
      },
      onTranscriptionReceived: (text, participantId) => {
        // Adiciona o texto transcrito ao estado
        setTranscriptionText(prev => {
          const participant = callData.participants.find(p => p.id === participantId);
          const speaker = participant ? participant.name : "Alguém";
          const newText = `${speaker}: ${text}`;
          return prev ? `${prev}\n${newText}` : newText;
        });
      }
    });
    
    // Inicia a chamada
    const roomName = id || `radiozap_${Date.now().toString()}`;
    jitsiManager.joinRoom(roomName, "You (Host)");
    
    // Inicia o cronômetro da chamada
    const startTime = new Date();
    setCallData(prev => ({ ...prev, startTime }));
    
    const timer = setInterval(() => {
      const diff = Date.now() - startTime.getTime();
      const minutes = Math.floor(diff / 60000).toString().padStart(2, '0');
      const seconds = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
      setDuration(`${minutes}:${seconds}`);
    }, 1000);
    
    // Limpa quando o componente é desmontado
    return () => {
      clearInterval(timer);
      jitsiManager.leaveRoom();
    };
  }, [id, callData.participants]);

  // Simulate transcription generation when isRecording changes
  useEffect(() => {
    if (!isRecording) return;
    
    // Simulate real-time transcription for demo purposes
    const transcriptionInterval = setInterval(() => {
      if (isRecording && callData.participants.length > 0) {
        const transcriptionParts = [
          "Olá, hoje estamos em uma entrevista ao vivo.",
          "Vamos discutir os principais tópicos da semana.",
          "Obrigado por participar desta chamada.",
          "Como vocês estão se sentindo hoje?",
          "Nosso próximo tópico será sobre as novidades do mercado.",
          "Agradecemos a todos pela participação.",
        ];
        
        const randomPart = transcriptionParts[Math.floor(Math.random() * transcriptionParts.length)];
        const randomParticipant = callData.participants[
          Math.floor(Math.random() * callData.participants.length)
        ];
        const speaker = randomParticipant ? randomParticipant.name : "Alguém";
        
        setTranscriptionText(prev => {
          const newText = `${speaker}: ${randomPart}`;
          return prev ? `${prev}\n${newText}` : newText;
        });
      }
    }, 5000);
    
    return () => clearInterval(transcriptionInterval);
  }, [isRecording, callData.participants]);
  
  const toggleAudio = (participantId: string) => {
    if (participantId === "host") {
      const newState = jitsiManager.toggleAudio();
      toast(newState ? "Microphone unmuted" : "Microphone muted");
    }
  };
  
  const endCall = () => {
    // Save transcription automatically at call end
    if (autoSaveTranscription && transcriptionText) {
      saveTranscription();
      toast.success("Chamada finalizada e transcrição salva automaticamente");
    } else {
      toast.success("Chamada finalizada");
    }
    
    jitsiManager.leaveRoom();
    navigate("/dashboard");
  };
  
  const addParticipant = () => {
    toast.info("This would open a dialog to add participants");
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    toast.success(isRecording ? "Gravação interrompida" : "Gravação iniciada");
  };
  
  const saveTranscription = () => {
    if (!transcriptionText) {
      toast.error("Não há transcrição para salvar.");
      return;
    }
    
    try {
      // Add new transcription using the hook
      const newTranscription = {
        id: Date.now().toString(),
        title: `${callData.name} - ${new Date().toLocaleDateString()}`,
        content: transcriptionText,
        date: new Date(),
        callId: callData.id
      };
      
      addTranscription(newTranscription);
      toast.success("Transcrição salva com sucesso!");
    } catch (error) {
      console.error("Error saving transcription:", error);
      toast.error("Erro ao salvar transcrição");
    }
  };
  
  return (
    <div className="flex h-screen flex-col bg-background">
      <CallHeader 
        callName={callData.name}
        duration={duration}
        onAddParticipant={addParticipant}
        onEndCall={endCall}
      />
      
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <ParticipantGrid 
          participants={callData.participants}
          callType={callData.type}
          isConnected={isConnected}
          onToggleAudio={toggleAudio}
        />
        
        <ControlPanel 
          transcriptionText={transcriptionText}
          isRecording={isRecording}
          onToggleRecording={toggleRecording}
          onSaveTranscription={saveTranscription}
          onEndCall={endCall}
        />
      </div>
    </div>
  );
};

export default CallInterface;
