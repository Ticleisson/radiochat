
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Mic, MicOff, Video, VideoOff } from "lucide-react";
import { JitsiParticipant } from "@/utils/jitsiManager";

interface ParticipantCardProps {
  participant: JitsiParticipant;
  callType: "audio" | "video";
  onToggleAudio: (participantId: string) => void;
}

export const ParticipantCard = ({ 
  participant, 
  callType, 
  onToggleAudio 
}: ParticipantCardProps) => {
  return (
    <Card 
      key={participant.id} 
      className={`caller-card ${participant.id === 'host' ? 'caller-active' : ''}`}
    >
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
            onClick={() => onToggleAudio(participant.id)}
            disabled={participant.id !== 'host'} // Só pode controlar o próprio áudio
          >
            {participant.audio ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </Button>
          
          {callType === "video" && (
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
  );
};
