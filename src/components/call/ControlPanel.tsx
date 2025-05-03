
import React from "react";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import { QuickActions } from "./QuickActions";
import { Transcription } from "./Transcription";

interface ControlPanelProps {
  transcriptionText: string;
  isRecording: boolean;
  onToggleRecording: () => void;
  onSaveTranscription: () => void;
  onEndCall: () => void;
}

export const ControlPanel = ({
  transcriptionText,
  isRecording,
  onToggleRecording,
  onSaveTranscription,
  onEndCall
}: ControlPanelProps) => {
  return (
    <div className="hidden w-72 border-l bg-card lg:block">
      <div className="flex h-full flex-col">
        <div className="border-b p-4">
          <h2 className="font-semibold">Control Panel</h2>
        </div>
        
        <div className="flex-1 overflow-auto p-4">
          <div className="space-y-4">
            <QuickActions />
            
            <Transcription 
              transcriptionText={transcriptionText}
              isRecording={isRecording}
              onToggleRecording={onToggleRecording}
              onSaveTranscription={onSaveTranscription}
            />
          </div>
        </div>
        
        <div className="border-t p-4">
          <Button variant="destructive" className="w-full" onClick={onEndCall}>
            <Phone className="mr-2 h-4 w-4" />
            End Call
          </Button>
        </div>
      </div>
    </div>
  );
};
