
// Declaração global para JitsiMeetJS
declare global {
  interface Window {
    JitsiMeetJS: any;
  }
}

export interface JitsiParticipant {
  id: string;
  name: string;
  status: "connected" | "connecting" | "disconnected";
  audio: boolean;
  video: boolean;
  isLocal?: boolean;
}

export interface JitsiEventHandlers {
  // Eventos de participantes
  participantJoined?: (participant: JitsiParticipant) => void;
  participantLeft?: (participantId: string) => void;
  participantUpdated?: (participant: JitsiParticipant) => void;
  
  // Eventos de conexão
  connectionEstablished?: () => void;
  connectionFailed?: (error: any) => void;
  connectionStatusChanged?: (status: "connected" | "connecting" | "disconnected" | "failed") => void;
  
  // Eventos de áudio/vídeo
  audioMuteStatusChanged?: (participantId: string, muted: boolean) => void;
  videoMuteStatusChanged?: (participantId: string, muted: boolean) => void;
  
  // Eventos de transcrição
  transcriptionReceived?: (text: string, participantId: string) => void;
}
