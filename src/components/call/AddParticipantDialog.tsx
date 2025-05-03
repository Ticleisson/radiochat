
import React from "react";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

interface AddParticipantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddParticipantDialog = ({
  open,
  onOpenChange
}: AddParticipantDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          <Button onClick={() => onOpenChange(false)}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
