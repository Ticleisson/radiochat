
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Transcription, fetchTranscriptions, deleteTranscription, updateTranscription } from "@/services/transcriptionsService";
import { GeneratedContent } from "@/types/generatedContent";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Helper to fetch the DeepSeek API key from localStorage
const getDeepSeekApiKey = () => {
  try {
    const settings = localStorage.getItem("apiSettings");
    if (settings) {
      const parsedSettings = JSON.parse(settings);
      return parsedSettings.deepSeekApiKey;
    }
    return null;
  } catch (error) {
    console.error("Error getting DeepSeek API key:", error);
    return null;
  }
};

export function useTranscriptions() {
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const queryClient = useQueryClient();
  
  // Fetch transcriptions using React Query
  const { data: transcriptions = [] } = useQuery({
    queryKey: ['transcriptions'],
    queryFn: fetchTranscriptions,
  });
  
  // Delete transcription mutation
  const deleteTranscriptionMutation = useMutation({
    mutationFn: deleteTranscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transcriptions'] });
    }
  });
  
  // Add/Update transcription mutation
  const updateTranscriptionMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Transcription> }) =>
      updateTranscription(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transcriptions'] });
    }
  });

  const addTranscription = (transcription: Omit<Transcription, "id" | "user_id" | "created_at" | "updated_at">) => {
    // This will be replaced with a real API call in a future update
    toast.info("Em breve: Adicionar transcrição via API");
  };

  const handleDeleteTranscription = (id: string) => {
    deleteTranscriptionMutation.mutate(id);
  };

  const generateContent = async (data: { 
    transcriptionId: string; 
    contentType: string; 
    promptCustomization?: string 
  }) => {
    const apiKey = getDeepSeekApiKey();
    
    if (!apiKey) {
      toast.error("Chave da API DeepSeek não configurada. Por favor, adicione na seção API das Configurações.");
      return;
    }
    
    const transcription = transcriptions.find(t => t.id === data.transcriptionId);
    
    if (!transcription) {
      toast.error("Transcrição não encontrada.");
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Build prompt based on content type
      let prompt = "";
      
      switch (data.contentType) {
        case "summary":
          prompt = `Resumo da seguinte transcrição: "${transcription.content}"`;
          break;
        case "news":
          prompt = `Crie uma notícia baseada na seguinte transcrição: "${transcription.content}"`;
          break;
        case "quote":
          prompt = `Extraia citações importantes da seguinte transcrição e as formate de maneira impactante: "${transcription.content}"`;
          break;
        case "article":
          prompt = `Crie um artigo informativo baseado na seguinte transcrição: "${transcription.content}"`;
          break;
        case "custom":
          prompt = `${data.promptCustomization || "Gere conteúdo baseado na seguinte transcrição:"} "${transcription.content}"`;
          break;
        default:
          prompt = `Gere conteúdo baseado na seguinte transcrição: "${transcription.content}"`;
      }
      
      // For now, we'll simulate the API call
      console.log("Would call DeepSeek API with prompt:", prompt);
      console.log("Using API key:", apiKey);
      
      // Simulated API call - in a real scenario, you would make an actual API request
      // to the DeepSeek API. This code should be replaced with that implementation.
      setTimeout(() => {
        const simulatedContent = {
          id: Date.now().toString(),
          title: `Conteúdo gerado: ${data.contentType}`,
          content: `Este é um conteúdo gerado pelo DeepSeek API baseado na transcrição "${transcription.title}".\n\n` + 
                  "Em uma implementação real, este seria o texto gerado pela API DeepSeek com base no prompt:\n\n" + 
                  prompt + "\n\n" + 
                  "Para implementar esta funcionalidade por completo, adicione sua chave de API DeepSeek nas configurações e implemente a integração com a API.",
          type: data.contentType,
          date: new Date(),
          transcriptionId: transcription.id
        };
        
        setGeneratedContent(simulatedContent);
        setIsGenerating(false);
        toast.success("Conteúdo gerado com sucesso!");
      }, 2000);
      
      /* 
      // Real implementation would look something like this:
      // This would be implemented in a Supabase Edge Function in a real scenario
      const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 1000
        })
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const result = await response.json();
      
      const generatedText = result.choices[0].message.content;
      
      const newContent = {
        id: Date.now().toString(),
        title: `Conteúdo gerado: ${data.contentType}`,
        content: generatedText,
        type: data.contentType,
        date: new Date(),
        transcriptionId: transcription.id
      };
      
      setGeneratedContent(newContent);
      */
      
    } catch (error) {
      console.error("Error generating content:", error);
      toast.error("Erro ao gerar conteúdo. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    transcriptions,
    generatedContent,
    isGenerating,
    addTranscription,
    deleteTranscription: handleDeleteTranscription,
    generateContent
  };
}
