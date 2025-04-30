
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Transcription } from "@/types/transcription";

interface SelectTranscriptionContentProps {
  transcriptions: Transcription[];
  value: string;
  onChange: (value: string) => void;
}

export function SelectTranscriptionContent({ transcriptions, value, onChange }: SelectTranscriptionContentProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Selecione uma transcrição" />
      </SelectTrigger>
      <SelectContent>
        {transcriptions.map((transcription) => (
          <SelectItem key={transcription.id} value={transcription.id}>
            {transcription.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
