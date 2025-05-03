
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCall } from "@/services/callsService";
import { CallContainer } from "@/components/call/CallContainer";
import { CallLoading } from "@/components/call/CallLoading";
import { useCallActions } from "@/hooks/useCallActions";
import { useEffect } from "react";

const CallInterface = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { handleUpdateCallStatus, handleSaveTranscription } = useCallActions(id);
  
  // Fetch call data
  const { data: callData, isLoading, error } = useQuery({
    queryKey: ['call', id],
    queryFn: async () => {
      if (!id) return Promise.reject("No call ID provided");
      
      try {
        console.log(`Buscando detalhes da chamada ID: ${id}`);
        const call = await getCall(id);
        console.log("Dados da chamada recuperados:", call);
        return call;
      } catch (error) {
        console.error("Error fetching call:", error);
        throw error;
      }
    },
    enabled: !!id,
    retry: false
  });
  
  // Update call status to active when data is loaded
  useEffect(() => {
    if (callData && id && callData.status === 'pending' && id !== 'new') {
      console.log(`Atualizando status da chamada ${id} para active`);
      handleUpdateCallStatus(id, 'active');
    }
  }, [callData, id]);
  
  const handleSaveTranscriptionForCall = () => {
    if (callData && id) {
      handleSaveTranscription(callData.title, callData.transcriptionText || '');
    }
  };
  
  const handleEndCall = () => {
    if (id && id !== 'new') {
      handleUpdateCallStatus(id, 'completed');
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <CallLoading 
      isLoading={isLoading} 
      error={error} 
      onBackToDashboard={() => navigate("/dashboard")} 
    >
      {callData && id && (
        <CallContainer
          callData={callData}
          id={id}
          onSaveTranscription={handleSaveTranscriptionForCall}
          onEndCall={handleEndCall}
        />
      )}
    </CallLoading>
  );
};

export default CallInterface;
