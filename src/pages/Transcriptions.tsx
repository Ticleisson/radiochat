
import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, FileAudio, TextQuote, Newspaper, Plus } from "lucide-react";
import { toast } from "sonner";
import { SelectTranscriptionContent } from "@/components/transcriptions/SelectTranscriptionContent";
import { GenerateContentForm } from "@/components/transcriptions/GenerateContentForm";
import { useTranscriptions } from "@/hooks/useTranscriptions";

const Transcriptions = () => {
  const [activeTab, setActiveTab] = useState("transcriptions");
  const { 
    transcriptions, 
    generatedContent, 
    isGenerating, 
    addTranscription, 
    deleteTranscription,
    generateContent 
  } = useTranscriptions();

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Transcrições</h1>
          <p className="text-muted-foreground">
            Gerencie transcrições de chamadas e gere conteúdos personalizados.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="transcriptions">Minhas Transcrições</TabsTrigger>
            <TabsTrigger value="generate">Gerar Conteúdo</TabsTrigger>
          </TabsList>

          <TabsContent value="transcriptions" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Transcrições Salvas</h2>
              <Button onClick={() => {
                const title = prompt("Nome da transcrição:");
                if (!title) return;
                
                addTranscription({
                  id: Date.now().toString(),
                  title,
                  content: "",
                  date: new Date(),
                  callId: null
                });
                
                toast.success("Transcrição adicionada com sucesso!");
              }}>
                <Plus className="mr-2 h-4 w-4" />
                Nova Transcrição
              </Button>
            </div>

            {transcriptions.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="pt-6 text-center">
                  <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground">
                    Nenhuma transcrição encontrada. Adicione uma nova transcrição ou importe de uma chamada.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      const title = prompt("Nome da transcrição:");
                      if (!title) return;
                      
                      addTranscription({
                        id: Date.now().toString(),
                        title,
                        content: "",
                        date: new Date(),
                        callId: null
                      });
                      
                      toast.success("Transcrição adicionada com sucesso!");
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar Transcrição
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {transcriptions.map((transcription) => (
                  <Card key={transcription.id}>
                    <CardHeader>
                      <CardTitle>{transcription.title}</CardTitle>
                      <CardDescription>
                        {new Date(transcription.date).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="line-clamp-3 text-sm text-muted-foreground">
                        {transcription.content || "Sem conteúdo"}
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          const content = prompt("Conteúdo da transcrição:", transcription.content);
                          if (content === null) return;
                          
                          addTranscription({
                            ...transcription,
                            content
                          });
                          
                          toast.success("Transcrição atualizada com sucesso!");
                        }}
                      >
                        Editar
                      </Button>
                      <Button 
                        variant="destructive" 
                        onClick={() => {
                          if (confirm("Tem certeza que deseja excluir esta transcrição?")) {
                            deleteTranscription(transcription.id);
                            toast.success("Transcrição excluída com sucesso!");
                          }
                        }}
                      >
                        Excluir
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="generate" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Gerar Conteúdo Personalizado</CardTitle>
                <CardDescription>
                  Use a IA para gerar conteúdo a partir das suas transcrições.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {transcriptions.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">
                      Você precisa ter pelo menos uma transcrição salva para gerar conteúdo.
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setActiveTab("transcriptions")}
                    >
                      Adicionar Transcrição
                    </Button>
                  </div>
                ) : (
                  <GenerateContentForm
                    transcriptions={transcriptions}
                    onSubmit={generateContent}
                    isGenerating={isGenerating}
                  />
                )}
              </CardContent>
            </Card>

            {generatedContent && (
              <Card>
                <CardHeader>
                  <CardTitle>Conteúdo Gerado</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea 
                    className="min-h-[200px]" 
                    value={generatedContent.content} 
                    readOnly 
                  />
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => {
                      navigator.clipboard.writeText(generatedContent.content);
                      toast.success("Conteúdo copiado para a área de transferência!");
                    }}
                  >
                    Copiar
                  </Button>
                </CardFooter>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Transcriptions;
