
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { CallHeader } from "@/components/call/CallHeader";
import { ParticipantGrid } from "@/components/call/ParticipantGrid";
import { ControlPanel } from "@/components/call/ControlPanel";
import { useCallManagement } from "@/hooks/useCallManagement";
import { useEffect, useState } from "react";
import { getCall, updateCallStatus } from "@/services/callsService";
import { saveTranscription } from "@/services/transcriptionsService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const CallInterface = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // Fetch call data
  const { data: callData, isLoading, error } = useQuery({
    queryKey: ['call', id],
    queryFn: () => id ? getCall(id) : Promise.reject("No call ID provided"),
    enabled: !!id,
  });
  
  // Update call status mutation
  const updateCallStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      updateCallStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['call', id] });
      queryClient.invalidateQueries({ queryKey: ['calls'] });
    }
  });
  
  // Save transcription mutation
  const saveTranscriptionMutation = useMutation({
    mutationFn: saveTranscription
  });
  
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
  
  useEffect(() => {
    if (callData && id) {
      // Start the call when data is loaded
      startCall(callData);
      
      // Update call status to active if it's pending
      if (callData.status === 'pending') {
        updateCallStatusMutation.mutate({ id, status: 'active' });
      }
    }
  }, [callData, id]);
  
  const addParticipant = () => {
    toast.info("This would open a dialog to add participants");
  };
  
  const handleSaveTranscription = () => {
    if (!id || !transcriptionText) return;
    
    const transcriptionData = {
      title: `Transcrição: ${callData?.title || 'Chamada'}`,
      content: transcriptionText,
      call_id: id
    };
    
    saveTranscriptionMutation.mutate(transcriptionData, {
      onSuccess: () => {
        toast.success("Transcrição salva com sucesso!");
      },
      onError: (error) => {
        console.error("Error saving transcription:", error);
        toast.error("Erro ao salvar a transcrição.");
      }
    });
  };
  
  const endCall = () => {
    // Save transcription automatically at call end
    if (autoSaveTranscription && transcriptionText) {
      handleSaveTranscription();
    }
    
    // End the call session
    endCallSession();
    
    // Update call status in the database
    if (id) {
      updateCallStatusMutation.mutate(
        { id, status: 'completed' },
        {
          onSuccess: () => {
            toast.success("Chamada finalizada com sucesso!");
            navigate("/dashboard");
          },
          onError: (error) => {
            console.error("Error updating call status:", error);
            toast.error("Erro ao finalizar chamada no servidor, mas a sessão foi encerrada.");
            navigate("/dashboard");
          }
        }
      );
    } else {
      navigate("/dashboard");
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Carregando detalhes da chamada...</p>
      </div>
    );
  }
  
  if (error || !callData) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <p>Erro ao carregar detalhes da chamada.</p>
        <Button className="mt-4" onClick={() => navigate("/dashboard")}>
          Voltar ao Dashboard
        </Button>
      </div>
    );
  }
  
  return (
    <div className="flex h-screen flex-col bg-background">
      <CallHeader 
        callName={callData.title}
        duration={duration}
        onAddParticipant={addParticipant}
        onEndCall={endCall}
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
          onSaveTranscription={handleSaveTranscription}
          onEndCall={endCall}
        />
      </div>
    </div>
  );
};

export default CallInterface;
