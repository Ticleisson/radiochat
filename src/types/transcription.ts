
export interface Transcription {
  id: string;
  title: string;
  content: string;
  date: Date;
  callId: string | null; // Reference to the call this transcription is from, if any
}
