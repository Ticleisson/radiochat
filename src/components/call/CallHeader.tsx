
import React from "react";
import { Button } from "@/components/ui/button";
import { Phone, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CallHeaderProps {
  callName: string;
  duration: string;
  onAddParticipant: () => void;
  onEndCall: () => void;
}

export const CallHeader = ({ 
  callName, 
  duration, 
  onAddParticipant, 
  onEndCall 
}: CallHeaderProps) => {
  return (
    <div className="flex h-16 items-center justify-between border-b bg-radio px-4 text-white">
      <div className="flex items-center space-x-4">
        <div className="live-indicator"></div>
        <h1 className="text-lg font-bold">{callName}</h1>
        <span className="rounded-md bg-white bg-opacity-20 px-2 py-1 text-sm">
          {duration}
        </span>
      </div>
      
      <div className="flex space-x-4">
        <Button 
          variant="outline" 
          className="border-white text-white hover:bg-white hover:bg-opacity-10"
          onClick={onAddParticipant}
        >
          <Plus className="mr-1 h-4 w-4" />
          Add Participant
        </Button>
        <Button 
          variant="destructive"
          onClick={onEndCall}
        >
          <Phone className="mr-1 h-4 w-4" />
          End Call
        </Button>
      </div>
    </div>
  );
};
