
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Mic, MicOff, Phone, Plus, Video, VideoOff, 
  MessageSquare, Bell, User, FileText 
} from "lucide-react";
import { toast } from "sonner";
import { useTranscriptions } from "@/hooks/useTranscriptions";

interface Participant {
  id: string;
  name: string;
  status: "connected" | "connecting" | "disconnected";
  audio: boolean;
  video: boolean;
}

const CallInterface = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addTranscription } = useTranscriptions();
  
  const [callData, setCallData] = useState({
    id: id || "active1",
    name: "Live Interview",
    startTime: new Date(Date.now() - 15 * 60000), // Started 15 minutes ago
    type: "audio" as "audio" | "video",
    participants: [
      { id: "p1", name: "John Smith", status: "connected" as const, audio: true, video: false },
      { id: "p2", name: "Maria Garcia", status: "connected" as const, audio: true, video: false },
      { id: "host", name: "You (Host)", status: "connected" as const, audio: true, video: false },
    ]
  });
  
  const [duration, setDuration] = useState("00:00");
  const [isRecording, setIsRecording] = useState(true); // Auto-recording by default
  const [transcriptionText, setTranscriptionText] = useState("");
  const [autoSaveTranscription, setAutoSaveTranscription] = useState(true);
  
  useEffect(() => {
    const timer = setInterval(() => {
      const diff = Date.now() - callData.startTime.getTime();
      const minutes = Math.floor(diff / 60000).toString().padStart(2, '0');
      const seconds = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
      setDuration(`${minutes}:${seconds}`);
    }, 1000);
    
    return () => clearInterval(timer);
  }, [callData.startTime]);

  // Simulate transcription generation when component mounts (automatic recording)
  useEffect(() => {
    // Simulate real-time transcription as the call progresses
    const transcriptionInterval = setInterval(() => {
      if (isRecording) {
        // In a real app, this would be updated continuously from a real transcription service
        setTranscriptionText(prev => {
          const transcriptionParts = [
            "Olá, hoje estamos em uma entrevista ao vivo.",
            "Vamos discutir os principais tópicos da semana.",
            "Obrigado por participar desta chamada.",
            "Como vocês estão se sentindo hoje?",
            "Nosso próximo tópico será sobre as novidades do mercado.",
            "Agradecemos a todos pela participação.",
          ];
          
          const randomPart = transcriptionParts[Math.floor(Math.random() * transcriptionParts.length)];
          return prev ? `${prev}\n${randomPart}` : randomPart;
        });
      }
    }, 5000); // Update every 5 seconds to simulate real-time transcription
    
    return () => clearInterval(transcriptionInterval);
  }, [isRecording]);
  
  const toggleAudio = (participantId: string) => {
    setCallData(prev => ({
      ...prev,
      participants: prev.participants.map(p => 
        p.id === participantId ? { ...p, audio: !p.audio } : p
      )
    }));
    
    // If it's the host
    if (participantId === "host") {
      const newState = !callData.participants.find(p => p.id === "host")?.audio;
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
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b bg-radio px-4 text-white">
        <div className="flex items-center space-x-4">
          <div className="live-indicator"></div>
          <h1 className="text-lg font-bold">{callData.name}</h1>
          <span className="rounded-md bg-white bg-opacity-20 px-2 py-1 text-sm">
            {duration}
          </span>
        </div>
        
        <div className="flex space-x-4">
          <Button 
            variant="outline" 
            className="border-white text-white hover:bg-white hover:bg-opacity-10"
            onClick={addParticipant}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Participant
          </Button>
          <Button 
            variant="destructive"
            onClick={endCall}
          >
            <Phone className="mr-1 h-4 w-4" />
            End Call
          </Button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Participants Grid */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {callData.participants.map((participant) => (
              <Card key={participant.id} className={`caller-card ${participant.id === 'host' ? 'caller-active' : ''}`}>
                <CardContent className="flex h-48 flex-col items-center justify-center p-6">
                  <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                    <User className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <p className="text-center font-medium">{participant.name}</p>
                  <p className="text-center text-xs text-muted-foreground">
                    {participant.status === "connected" ? "Connected" : 
                     participant.status === "connecting" ? "Connecting..." : "Disconnected"}
                  </p>
                  
                  <div className="mt-4 flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className={`${participant.audio ? 'bg-green-100 text-green-700' : 'text-muted-foreground'}`}
                      onClick={() => toggleAudio(participant.id)}
                    >
                      {participant.audio ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                    </Button>
                    
                    {callData.type === "video" && (
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className={`${participant.video ? 'bg-green-100 text-green-700' : 'text-muted-foreground'}`}
                      >
                        {participant.video ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        {/* Control Panel */}
        <div className="hidden w-72 border-l bg-card lg:block">
          <div className="flex h-full flex-col">
            <div className="border-b p-4">
              <h2 className="font-semibold">Control Panel</h2>
            </div>
            
            <div className="flex-1 overflow-auto p-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" className="justify-start">
                      <Bell className="mr-2 h-4 w-4" />
                      Alert All
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Message
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <MicOff className="mr-2 h-4 w-4" />
                      Mute All
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Gravação e Transcrição</h3>
                  <div className="space-y-2">
                    <Button 
                      variant={isRecording ? "default" : "outline"} 
                      className={`w-full justify-start ${isRecording ? "bg-red-500 hover:bg-red-600" : ""}`}
                      onClick={toggleRecording}
                    >
                      <Video className={`mr-2 h-4 w-4 ${isRecording ? "text-white" : "text-red-500"}`} />
                      {isRecording ? "Pausar Gravação" : "Retomar Gravação"}
                    </Button>
                    
                    {transcriptionText && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Transcrição em tempo real</h3>
                        <div className="max-h-40 overflow-y-auto rounded-md bg-muted p-2 text-xs">
                          {transcriptionText}
                        </div>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={saveTranscription}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Salvar Transcrição Manualmente
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t p-4">
              <Button variant="destructive" className="w-full" onClick={endCall}>
                <Phone className="mr-2 h-4 w-4" />
                End Call
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CallInterface;
