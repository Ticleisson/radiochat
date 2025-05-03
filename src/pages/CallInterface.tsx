
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { CallHeader } from "@/components/call/CallHeader";
import { ParticipantGrid } from "@/components/call/ParticipantGrid";
import { ControlPanel } from "@/components/call/ControlPanel";
import { useCallManagement } from "@/hooks/useCallManagement";
import { useEffect } from "react";
import { getCall, updateCallStatus } from "@/services/callsService";
import { saveTranscription } from "@/services/transcriptionsService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useState } from "react";
import { UserPlus } from "lucide-react";

const CallInterface = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showAddParticipantDialog, setShowAddParticipantDialog] = useState(false);
  
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
      console.log(`Iniciando chamada ${id} com dados:`, callData);
      // Start the call when data is loaded
      startCall(callData);
      
      // Update call status to active if it's pending and not a new call
      if (callData.status === 'pending' && id !== 'new') {
        console.log(`Atualizando status da chamada ${id} para active`);
        updateCallStatusMutation.mutate({ id, status: 'active' });
      }
    }
  }, [callData, id]);
  
  const addParticipant = () => {
    setShowAddParticipantDialog(true);
  };
  
  const handleSaveTranscription = () => {
    if (!id || !transcriptionText) return;
    
    const transcriptionData = {
      title: `Transcrição: ${callData?.title || 'Chamada'}`,
      content: transcriptionText,
      call_id: id !== 'new' ? id : undefined
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
  
  const endCall = () => {
    console.log(`Encerrando chamada ${id}`);
    
    // Save transcription automatically at call end
    if (autoSaveTranscription && transcriptionText) {
      handleSaveTranscription();
    }
    
    // End the call session
    endCallSession();
    
    // Update call status in the database if it's not a new call
    if (id && id !== 'new') {
      console.log(`Atualizando status da chamada ${id} para completed`);
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
    <>
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
      
      {/* Dialog para adicionar participantes */}
      <Dialog open={showAddParticipantDialog} onOpenChange={setShowAddParticipantDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Participante</DialogTitle>
            <DialogDescription>
              Envie um link ou convide contatos para participar da chamada.
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 flex flex-col space-y-4">
            <div className="flex items-center justify-between rounded-md border p-3">
              <div className="flex items-center space-x-3">
                <UserPlus className="h-5 w-5 text-muted-foreground" />
                <span>Link de convite</span>
              </div>
              <Button variant="outline" onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success("Link copiado para a área de transferência!");
              }}>
                Copiar Link
              </Button>
            </div>
            
            {/* Aqui poderia ser adicionado um componente de seleção de contatos */}
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowAddParticipantDialog(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CallInterface;
