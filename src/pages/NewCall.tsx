
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mic, Video, ChevronLeft, Search, Plus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Contact, fetchContacts } from "@/services/contactsService";
import { useQuery } from "@tanstack/react-query";

const NewCall = () => {
  const navigate = useNavigate();
  const [callType, setCallType] = useState<"audio" | "video">("audio");
  const [callName, setCallName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);
  
  // Buscar contatos usando React Query com tratamento de erro aprimorado
  const { data: contacts = [], isLoading, error } = useQuery({
    queryKey: ['contacts-for-call'],
    queryFn: async () => {
      try {
        console.log("Buscando contatos para nova chamada...");
        const contactsData = await fetchContacts();
        console.log("Contatos recuperados:", contactsData.length);
        return contactsData;
      } catch (error) {
        console.error("Erro ao buscar contatos para nova chamada:", error);
        toast.error("Falha ao carregar contatos. Verifique sua conexão.");
        return []; // Retorna array vazio em caso de erro
      }
    },
    staleTime: 60 * 1000, // 1 minuto
    retry: 2 // Tenta 2 vezes antes de falhar
  });
  
  // Filtra contatos baseado no termo de busca e remove contatos já selecionados
  const filteredContacts = contacts.filter(
    (contact) =>
      (contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone?.includes(searchTerm) ||
      (contact.organization?.toLowerCase() || "").includes(searchTerm.toLowerCase())) &&
      !selectedContacts.some(selected => selected.id === contact.id)
  );
  
  const handleContactSelect = (contact: Contact) => {
    setSelectedContacts([...selectedContacts, contact]);
    setSearchTerm("");
  };
  
  const handleContactRemove = (id: string) => {
    setSelectedContacts(selectedContacts.filter(contact => contact.id !== id));
  };
  
  const startCall = () => {
    if (!callName) {
      toast.error("Por favor, informe um nome para a chamada");
      return;
    }
    
    if (selectedContacts.length === 0) {
      toast.error("Por favor, selecione pelo menos um participante");
      return;
    }
    
    toast.success("Iniciando chamada...");
    setTimeout(() => {
      navigate("/call/new");
    }, 1000);
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full" 
            onClick={() => navigate("/dashboard")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold tracking-tight">Nova Chamada</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Configurações da Chamada</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="call-name">Nome da Chamada</Label>
              <Input 
                id="call-name" 
                placeholder="Ex: Entrevista Morning Show" 
                value={callName}
                onChange={(e) => setCallName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Tipo de Chamada</Label>
              <Tabs defaultValue="audio" onValueChange={(value) => setCallType(value as "audio" | "video")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="audio">
                    <Mic className="mr-2 h-4 w-4" />
                    Áudio
                  </TabsTrigger>
                  <TabsTrigger value="video">
                    <Video className="mr-2 h-4 w-4" />
                    Vídeo
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            <div className="space-y-2">
              <Label>Participantes</Label>
              {/* Lista de contatos selecionados */}
              {selectedContacts.length > 0 ? (
                <div className="flex flex-wrap gap-2 mb-2">
                  {selectedContacts.map(contact => (
                    <div 
                      key={contact.id} 
                      className="flex items-center rounded-full bg-muted px-3 py-1 text-sm"
                    >
                      <span>{contact.name}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 ml-1"
                        onClick={() => handleContactRemove(contact.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mb-2">
                  Nenhum participante selecionado
                </p>
              )}
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar contatos..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Lista de resultados da busca */}
              <Card className="mt-2 border shadow-sm">
                <CardContent className="p-2 max-h-64 overflow-y-auto">
                  {isLoading ? (
                    <div className="flex justify-center items-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      <span className="ml-2 text-sm text-muted-foreground">Carregando contatos...</span>
                    </div>
                  ) : contacts.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground">Nenhum contato encontrado.</p>
                      <p className="text-xs text-muted-foreground mt-1">Adicione contatos na página de Contatos.</p>
                    </div>
                  ) : filteredContacts.length > 0 || searchTerm ? (
                    <div className="space-y-1">
                      {/* Mostra contatos filtrados pelo termo de busca ou todos se não houver termo */}
                      {(searchTerm ? filteredContacts : contacts.filter(c => !selectedContacts.some(s => s.id === c.id)))
                        .map(contact => (
                          <div 
                            key={contact.id}
                            className="flex items-center justify-between rounded-md p-2 hover:bg-muted cursor-pointer"
                            onClick={() => handleContactSelect(contact)}
                          >
                            <div>
                              <p className="font-medium">{contact.name}</p>
                              <p className="text-xs text-muted-foreground">{contact.phone}</p>
                              {contact.organization && (
                                <p className="text-xs text-muted-foreground">{contact.organization}</p>
                              )}
                            </div>
                            <Button size="icon" variant="ghost" className="h-8 w-8">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      }
                    </div>
                  ) : (
                    <p className="text-center text-sm text-muted-foreground py-4">
                      Todos os contatos já foram selecionados.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <Button 
              className="w-full bg-radio hover:bg-radio-light"
              onClick={startCall}
              disabled={selectedContacts.length === 0 || !callName}
            >
              Iniciar Chamada
            </Button>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default NewCall;
