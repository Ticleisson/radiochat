
export interface JitsiParticipant {
  id: string;
  name: string;
  status: "connected" | "connecting" | "disconnected";
  audio: boolean;
  video: boolean;
  isLocal?: boolean;
}

export interface JitsiEventHandlers {
  participantJoined?: (participant: JitsiParticipant) => void;
  participantLeft?: (participantId: string) => void;
  participantUpdated?: (participant: JitsiParticipant) => void;
  connectionEstablished?: () => void;
  connectionFailed?: (error: any) => void;
}
