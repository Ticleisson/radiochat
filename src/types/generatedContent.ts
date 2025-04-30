
export interface GeneratedContent {
  id: string;
  title: string;
  content: string;
  type: string; // 'summary', 'news', 'quote', etc.
  date: Date;
  transcriptionId: string; // Reference to the transcription this content is generated from
}
