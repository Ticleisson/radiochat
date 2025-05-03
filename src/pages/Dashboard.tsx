
import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, Users, Clock, Plus, Video, Mic } from "lucide-react";
import ActiveCallCard from "@/components/calls/ActiveCallCard";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchContacts } from "@/services/contactsService";
import { fetchCalls } from "@/services/callsService";

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  
  // Buscar contatos para mostrar o total
  const { data: contacts = [], isLoading: loadingContacts } = useQuery({
    queryKey: ['dashboard-contacts'],
    queryFn: fetchContacts,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
  
  // Buscar chamadas usando o serviço real
  const { data: callsData = [], isLoading: loadingCalls } = useQuery({
    queryKey: ['dashboard-calls'],
    queryFn: fetchCalls,
    staleTime: 5 * 60 * 1000,
    onSettled: (data, error) => {
      if (error) {
        console.error("Erro ao buscar chamadas:", error);
      }
    }
  });
  
  // Filtrar chamadas recentes (completadas)
  const recentCalls = callsData.filter(call => call.status === "completed").slice(0, 5);
  
  // Filtrar chamadas ativas
  const activeCalls = callsData
    .filter(call => call.status === "active" || call.status === "connecting")
    .map(call => ({
      id: call.id,
      name: call.title,
      participants: [
        { id: "p1", name: "Participante 1", status: "connected" as "connected", audio: true, video: call.type === "video" },
        { id: "p2", name: "Participante 2", status: "connecting" as "connecting", audio: false, video: false },
      ],
      startTime: new Date(call.created_at || Date.now()),
      type: call.type
    }));

  // Calcular total de horas de chamada (exemplo - poderia ser calculado a partir dos dados reais)
  const totalHours = callsData.reduce((total, call) => {
    // Aqui você poderia calcular a partir da duração real das chamadas
    // Por enquanto vamos usar um valor fixo de 15 minutos por chamada
    return total + 0.25;
  }, 0).toFixed(1);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col justify-between space-y-2 sm:flex-row sm:items-center sm:space-y-0">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <div className="flex gap-2">
            <Button 
              onClick={() => navigate("/new-call")}
              className="bg-radio hover:bg-radio-light"
            >
              <Plus className="mr-1 h-4 w-4" />
              Nova Chamada
            </Button>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Chamadas Ativas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Phone className="mr-2 h-5 w-5 text-muted-foreground" />
                <div className="text-2xl font-bold">{activeCalls.length}</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Contatos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="mr-2 h-5 w-5 text-muted-foreground" />
                <div className="text-2xl font-bold">{loadingContacts ? "..." : contacts.length}</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total de Horas de Chamada</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Clock className="mr-2 h-5 w-5 text-muted-foreground" />
                <div className="text-2xl font-bold">{loadingCalls ? "..." : totalHours}</div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">Chamadas Ativas</TabsTrigger>
            <TabsTrigger value="recent">Chamadas Recentes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active" className="space-y-4">
            {loadingCalls ? (
              <div className="flex h-[200px] items-center justify-center">
                <p>Carregando chamadas ativas...</p>
              </div>
            ) : activeCalls.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeCalls.map((call) => (
                  <ActiveCallCard key={call.id} call={call} />
                ))}
              </div>
            ) : (
              <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
                <div className="flex flex-col items-center space-y-2 text-center">
                  <Phone className="h-10 w-10 text-muted-foreground" />
                  <h3 className="text-lg font-medium">Sem chamadas ativas</h3>
                  <p className="text-sm text-muted-foreground">Inicie uma nova chamada para conectar-se com participantes.</p>
                  <Button 
                    variant="outline" 
                    className="mt-2"
                    onClick={() => navigate("/new-call")}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Nova Chamada
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="recent">
            <Card>
              <CardHeader>
                <CardTitle>Chamadas Recentes</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingCalls ? (
                  <div className="h-24 flex items-center justify-center">
                    <p>Carregando chamadas recentes...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-md border">
                      <div className="grid grid-cols-5 bg-muted p-4 text-xs font-medium text-muted-foreground">
                        <div>Nome</div>
                        <div>Data</div>
                        <div className="text-center">Participantes</div>
                        <div className="text-center">Duração</div>
                        <div className="text-right">Ações</div>
                      </div>
                      {recentCalls.length > 0 ? recentCalls.map((call) => {
                        const callDate = new Date(call.created_at || Date.now());
                        const formattedDate = new Intl.DateTimeFormat('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }).format(callDate);

                        return (
                          <div key={call.id} className="grid grid-cols-5 items-center border-t p-4 text-sm">
                            <div className="font-medium">{call.title}</div>
                            <div className="text-muted-foreground">{formattedDate}</div>
                            <div className="text-center">2</div>
                            <div className="text-center">15:00</div>
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => navigate(`/call/${call.id}`)}
                              >
                                {call.type === "video" ? (
                                  <Video className="h-4 w-4" />
                                ) : (
                                  <Mic className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        );
                      }) : (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          Nenhuma chamada recente encontrada.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
