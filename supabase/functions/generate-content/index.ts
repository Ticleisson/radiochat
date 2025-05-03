
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// This is a placeholder for the real AI content generation API integration
// In a production app, this would call a service like OpenAI, Anthropic, etc.

interface ContentGenerationRequest {
  transcriptionText: string;
  contentType: string; // summary, news, quote, article, custom
  promptCustomization?: string;
}

async function simulateContentGeneration(request: ContentGenerationRequest): Promise<string> {
  // Simulate API processing time
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // In a real implementation, we would call an AI API
  // Here we just return a simulated response based on the request type
  const { transcriptionText, contentType, promptCustomization } = request;
  
  const truncatedText = transcriptionText.substring(0, 50) + (transcriptionText.length > 50 ? "..." : "");
  
  switch (contentType) {
    case "summary":
      return `Resumo da transcrição:\n\nEsta é uma versão resumida do conteúdo original que aborda os principais pontos mencionados na transcrição: "${truncatedText}"`;
    
    case "news":
      return `Notícia baseada na transcrição:\n\nEM DESTAQUE: Novos detalhes surgem durante entrevista\n\nHoje, durante uma entrevista exclusiva, foram reveladas informações importantes sobre o tema em discussão. De acordo com a transcrição: "${truncatedText}"`;
    
    case "quote":
      return `Citações importantes:\n\n"${truncatedText.split(' ').slice(0, 8).join(' ')}..."\n\n- Extraído da entrevista`;
    
    case "article":
      return `Artigo informativo:\n\nAnálise aprofundada\n\nEm uma recente conversa, foram abordados tópicos relevantes que merecem destaque e análise mais detalhada. Segundo o conteúdo da transcrição: "${truncatedText}", podemos observar tendências importantes que se relacionam com o cenário atual...`;
    
    case "custom":
      return `Conteúdo personalizado baseado no prompt: "${promptCustomization}".\n\nA partir da análise da transcrição: "${truncatedText}", podemos elaborar o seguinte conteúdo personalizado...`;
    
    default:
      return `Conteúdo gerado a partir da transcrição: "${truncatedText}".\n\nEste é um texto gerado automaticamente baseado no conteúdo da transcrição fornecida.`;
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    // Check if request is authenticated
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the request payload
    const contentType = req.headers.get("Content-Type");
    if (!contentType || !contentType.includes("application/json")) {
      return new Response(
        JSON.stringify({ error: "Invalid content type, expected application/json" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const requestData: ContentGenerationRequest = await req.json();
    
    if (!requestData.transcriptionText) {
      return new Response(
        JSON.stringify({ error: "Transcription text is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Simulated content generation
    const generatedContent = await simulateContentGeneration(requestData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        content: generatedContent
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error in generate-content function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to generate content",
        details: error.message
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
