
// Interface para os participantes
export interface JitsiParticipant {
  id: string;
  name: string;
  status: "connected" | "connecting" | "disconnected";
  audio: boolean;
  video: boolean;
}

// Interface para callbacks de eventos
export interface JitsiEventHandlers {
  onParticipantJoined?: (participant: JitsiParticipant) => void;
  onParticipantLeft?: (participantId: string) => void;
  onAudioMuteStatusChanged?: (participantId: string, muted: boolean) => void;
  onVideoMuteStatusChanged?: (participantId: string, muted: boolean) => void;
  onConnectionStatusChanged?: (status: string) => void;
  onTranscriptionReceived?: (text: string, participantId: string) => void;
}

// Interface para configurações
export interface JitsiConfig {
  domain?: string;
  roomName?: string;
  displayName?: string;
}

// Declaração global para o JitsiMeetJS
declare global {
  interface Window {
    JitsiMeetJS: any;
  }
}
