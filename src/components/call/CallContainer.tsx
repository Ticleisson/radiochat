
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { CallHeader } from "@/components/call/CallHeader";
import { ParticipantGrid } from "@/components/call/ParticipantGrid";
import { ControlPanel } from "@/components/call/ControlPanel";
import { useCallManagement } from "@/hooks/useCallManagement";
import { Call } from "@/services/callsService";
import { AddParticipantDialog } from "./AddParticipantDialog";

interface CallContainerProps {
  callData: Call;
  id: string;
  onSaveTranscription: () => void;
  onEndCall: () => void;
}

export const CallContainer = ({ 
  callData, 
  id, 
  onSaveTranscription,
  onEndCall
}: CallContainerProps) => {
  const [showAddParticipantDialog, setShowAddParticipantDialog] = useState(false);
  
  const {
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
  } = useCallManagement(id);
  
  // Start the call when component mounts
  React.useEffect(() => {
    if (callData) {
      console.log(`Iniciando chamada ${id} com dados:`, callData);
      startCall(callData);
    }
  }, [callData, id]);
  
  const addParticipant = () => {
    setShowAddParticipantDialog(true);
  };
  
  const handleEndCall = () => {
    console.log(`Encerrando chamada ${id}`);
    
    // Save transcription automatically at call end
    if (autoSaveTranscription && transcriptionText) {
      onSaveTranscription();
    }
    
    // End the call session
    endCallSession();
    onEndCall();
  };
  
  return (
    <>
      <div className="flex h-screen flex-col bg-background">
        <CallHeader 
          callName={callData.title}
          duration={duration}
          onAddParticipant={addParticipant}
          onEndCall={handleEndCall}
        />
        
        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">
          <ParticipantGrid 
            participants={callParticipants}
            callType={callData.type}
            isConnected={isConnected}
            onToggleAudio={toggleAudio}
          />
          
          <ControlPanel 
            transcriptionText={transcriptionText}
            isRecording={isRecording}
            onToggleRecording={toggleRecording}
            onSaveTranscription={onSaveTranscription}
            onEndCall={handleEndCall}
          />
        </div>
      </div>
      
      <AddParticipantDialog
        open={showAddParticipantDialog}
        onOpenChange={setShowAddParticipantDialog}
      />
    </>
  );
};
