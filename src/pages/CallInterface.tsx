
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { CallHeader } from "@/components/call/CallHeader";
import { ParticipantGrid } from "@/components/call/ParticipantGrid";
import { ControlPanel } from "@/components/call/ControlPanel";
import { useCallManagement } from "@/hooks/useCallManagement";

const CallInterface = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const {
    callData,
    duration,
    isRecording,
    transcriptionText,
    autoSaveTranscription,
    isConnected,
    toggleAudio,
    toggleRecording,
    saveTranscription
  } = useCallManagement(id);
  
  const addParticipant = () => {
    toast.info("This would open a dialog to add participants");
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
