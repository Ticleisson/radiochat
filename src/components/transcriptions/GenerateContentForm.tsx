
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SelectTranscriptionContent } from "./SelectTranscriptionContent";
import { Transcription } from "@/types/transcription";

interface GenerateContentFormProps {
  transcriptions: Transcription[];
  onSubmit: (data: { transcriptionId: string; contentType: string; promptCustomization?: string }) => void;
  isGenerating: boolean;
}

export function GenerateContentForm({ transcriptions, onSubmit, isGenerating }: GenerateContentFormProps) {
  const [selectedTranscription, setSelectedTranscription] = useState<string>("");
  const [contentType, setContentType] = useState<string>("summary");
  const [promptCustomization, setPromptCustomization] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTranscription) return;
    
    onSubmit({
      transcriptionId: selectedTranscription,
      contentType,
      promptCustomization: promptCustomization.trim() || undefined
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="transcription">Selecionar Transcrição</Label>
        <SelectTranscriptionContent 
          transcriptions={transcriptions} 
          value={selectedTranscription} 
          onChange={setSelectedTranscription}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contentType">Tipo de Conteúdo</Label>
        <Select value={contentType} onValueChange={setContentType}>
          <SelectTrigger id="contentType">
            <SelectValue placeholder="Selecione o tipo de conteúdo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="summary">Resumo</SelectItem>
            <SelectItem value="news">Notícia</SelectItem>
            <SelectItem value="quote">Citações</SelectItem>
            <SelectItem value="article">Artigo</SelectItem>
            <SelectItem value="custom">Personalizado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {contentType === "custom" && (
        <div className="space-y-2">
          <Label htmlFor="customPrompt">Instruções Personalizadas</Label>
          <Textarea
            id="customPrompt"
            placeholder="Digite instruções específicas para a geração do conteúdo..."
            value={promptCustomization}
            onChange={(e) => setPromptCustomization(e.target.value)}
          />
        </div>
      )}

      <Button 
        type="submit" 
        className="w-full"
        disabled={!selectedTranscription || isGenerating}
      >
        {isGenerating ? "Gerando..." : "Gerar Conteúdo"}
      </Button>
    </form>
  );
}
