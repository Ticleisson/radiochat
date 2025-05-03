
import React from "react";
import { ParticipantCard } from "./ParticipantCard";
import { JitsiParticipant } from "@/utils/jitsiManager";

interface ParticipantGridProps {
  participants: JitsiParticipant[];
  callType: "audio" | "video";
  isConnected: boolean;
  onToggleAudio: (participantId: string) => void;
}

export const ParticipantGrid = ({ 
  participants, 
  callType, 
  isConnected, 
  onToggleAudio 
}: ParticipantGridProps) => {
  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {participants.map((participant) => (
          <ParticipantCard 
            key={participant.id}
            participant={participant}
            callType={callType}
            onToggleAudio={onToggleAudio}
          />
        ))}

        {/* Mensagem quando não há participantes */}
        {participants.length === 0 && (
          <div className="col-span-3 flex h-48 items-center justify-center text-muted-foreground">
            {isConnected ? "Aguardando participantes..." : "Conectando à sala..."}
          </div>
        )}
      </div>
    </div>
  );
};
