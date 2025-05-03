
import React from "react";
import { Button } from "@/components/ui/button";
import { FileText, Video } from "lucide-react";

interface TranscriptionProps {
  transcriptionText: string;
  isRecording: boolean;
  onToggleRecording: () => void;
  onSaveTranscription: () => void;
}

export const Transcription = ({
  transcriptionText,
  isRecording,
  onToggleRecording,
  onSaveTranscription
}: TranscriptionProps) => {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">Gravação e Transcrição</h3>
      <div className="space-y-2">
        <Button 
          variant={isRecording ? "default" : "outline"} 
          className={`w-full justify-start ${isRecording ? "bg-red-500 hover:bg-red-600" : ""}`}
          onClick={onToggleRecording}
        >
          <Video className={`mr-2 h-4 w-4 ${isRecording ? "text-white" : "text-red-500"}`} />
          {isRecording ? "Pausar Gravação" : "Retomar Gravação"}
        </Button>
        
        {transcriptionText && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Transcrição em tempo real</h3>
            <div className="max-h-40 overflow-y-auto rounded-md bg-muted p-2 text-xs">
              {transcriptionText}
            </div>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={onSaveTranscription}
            >
              <FileText className="mr-2 h-4 w-4" />
              Salvar Transcrição Manualmente
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
