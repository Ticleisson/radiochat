
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { updateCallStatus } from "@/services/callsService";
import { saveTranscription } from "@/services/transcriptionsService";

export const useCallActions = (callId: string | undefined) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Update call status mutation
  const updateCallStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      updateCallStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['call', callId] });
      queryClient.invalidateQueries({ queryKey: ['calls'] });
    }
  });
  
  // Save transcription mutation
  const saveTranscriptionMutation = useMutation({
    mutationFn: saveTranscription
  });

  const handleUpdateCallStatus = (id: string, status: string) => {
    if (id && id !== 'new') {
      console.log(`Atualizando status da chamada ${id} para ${status}`);
      return updateCallStatusMutation.mutate(
        { id, status },
        {
          onSuccess: () => {
            if (status === 'completed') {
              toast.success("Chamada finalizada com sucesso!");
              navigate("/dashboard");
            }
          },
          onError: (error) => {
            console.error(`Error updating call status to ${status}:`, error);
            toast.error(`Erro ao atualizar status da chamada para ${status}.`);
            if (status === 'completed') {
              navigate("/dashboard");
            }
          }
        }
      );
    }
  };

  const handleSaveTranscription = (title: string, content: string) => {
    if (!content) return;
    
    const transcriptionData = {
      title: `Transcrição: ${title || 'Chamada'}`,
      content,
      call_id: callId !== 'new' ? callId : undefined
    };
    
    console.log("Salvando transcrição:", transcriptionData);
    
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

  return {
    handleUpdateCallStatus,
    handleSaveTranscription
  };
};
