
import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogFooter 
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Calendar, Search, Phone, Video, Trash, 
  Download, Clock, Play, Filter, Plus, Users 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface CallRecord {
  id: string;
  name: string;
  date: string;
  time: string;
  duration: string;
  participants: number;
  type: "audio" | "video";
  status: "completed" | "scheduled" | "missed";
  recording?: boolean;
}

const Calls = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "completed" | "scheduled" | "missed">("all");
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [newCall, setNewCall] = useState({
    name: "",
    date: "",
    time: "",
    type: "audio" as "audio" | "video",
    participants: [] as string[]
  });
  
  // Dados de exemplo de chamadas
  const [calls, setCalls] = useState<CallRecord[]>([
    {
      id: "1", 
      name: "Entrevista - Prefeito",
      date: "30/04/2025",
      time: "09:30",
      duration: "45:22",
      participants: 3,
      type: "audio",
      status: "completed",
      recording: true
    },
    {
      id: "2", 
      name: "Debate Esportivo",
      date: "02/05/2025",
      time: "14:15",
      duration: "32:18",
      participants: 4,
      type: "video",
      status: "completed",
      recording: true
    },
    {
      id: "3", 
      name: "Entrevista - Secretário de Saúde",
      date: "05/05/2025",
      time: "10:00",
      duration: "--:--",
      participants: 2,
      type: "audio",
      status: "scheduled"
    },
    {
      id: "4", 
      name: "Programa Cultural",
      date: "28/04/2025",
      time: "16:30",
      duration: "--:--",
      participants: 3,
      type: "audio",
      status: "missed"
    }
  ]);
  
  // Filtrar chamadas por termo de pesquisa e filtro ativo
  const filteredCalls = calls.filter(call => {
    // Filtro de texto
    const matchesSearch = 
      call.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      call.date.includes(searchTerm);
      
    // Filtro de status
    const matchesFilter = 
      activeFilter === "all" || 
      call.status === activeFilter;
      
    return matchesSearch && matchesFilter;
  });
  
  const handleDeleteCall = (id: string) => {
    setCalls(calls.filter(call => call.id !== id));
    toast.success("Chamada removida com sucesso");
  };
  
  const handleScheduleCall = () => {
    if (!newCall.name || !newCall.date || !newCall.time) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }
    
    // Adicionar nova chamada agendada
    const newId = (calls.length + 1).toString();
    setCalls([...calls, {
      id: newId,
      name: newCall.name,
      date: newCall.date,
      time: newCall.time,
      duration: "--:--",
      participants: newCall.participants.length || 0,
      type: newCall.type,
      status: "scheduled"
    }]);
    
    setNewCall({
      name: "",
      date: "",
      time: "",
      type: "audio",
      participants: []
    });
    
    setIsScheduleDialogOpen(false);
    toast.success("Chamada agendada com sucesso");
  };
  
  const handleJoinCall = (id: string) => {
    navigate(`/call/${id}`);
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col justify-between space-y-2 sm:flex-row sm:items-center sm:space-y-0">
          <h1 className="text-2xl font-bold tracking-tight">Chamadas</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsScheduleDialogOpen(true)}
            >
              <Calendar className="mr-1 h-4 w-4" />
              Agendar
            </Button>
            <Button 
              onClick={() => navigate("/new-call")}
              className="bg-radio hover:bg-radio-light"
            >
              <Phone className="mr-1 h-4 w-4" />
              Nova Chamada
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <CardTitle>Histórico de Chamadas</CardTitle>
            <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
              <Button 
                variant={activeFilter === "all" ? "default" : "outline"} 
                size="sm"
                onClick={() => setActiveFilter("all")}
                className={activeFilter === "all" ? "bg-radio hover:bg-radio-light" : ""}
              >
                Todas
              </Button>
              <Button 
                variant={activeFilter === "completed" ? "default" : "outline"} 
                size="sm"
                onClick={() => setActiveFilter("completed")}
                className={activeFilter === "completed" ? "bg-radio hover:bg-radio-light" : ""}
              >
                Concluídas
              </Button>
              <Button 
                variant={activeFilter === "scheduled" ? "default" : "outline"} 
                size="sm"
                onClick={() => setActiveFilter("scheduled")}
                className={activeFilter === "scheduled" ? "bg-radio hover:bg-radio-light" : ""}
              >
                Agendadas
              </Button>
              <Button 
                variant={activeFilter === "missed" ? "default" : "outline"} 
                size="sm"
                onClick={() => setActiveFilter("missed")}
                className={activeFilter === "missed" ? "bg-radio hover:bg-radio-light" : ""}
              >
                Perdidas
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-4 gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar chamadas..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" title="Filtros avançados">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Duração</TableHead>
                    <TableHead className="text-center">Participantes</TableHead>
                    <TableHead className="text-center">Tipo</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCalls.length > 0 ? (
                    filteredCalls.map((call) => (
                      <TableRow key={call.id}>
                        <TableCell className="font-medium">{call.name}</TableCell>
                        <TableCell>
                          {call.date} - {call.time}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                            {call.duration}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center">
                            <Users className="mr-1 h-4 w-4 text-muted-foreground" />
                            {call.participants}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {call.type === "audio" ? (
                            <Phone className="mx-auto h-4 w-4" />
                          ) : (
                            <Video className="mx-auto h-4 w-4" />
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center">
                            <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                              call.status === "completed" ? "bg-green-100 text-green-800" : 
                              call.status === "scheduled" ? "bg-blue-100 text-blue-800" : 
                              "bg-red-100 text-red-800"
                            }`}>
                              {call.status === "completed" ? "Concluída" : 
                               call.status === "scheduled" ? "Agendada" : 
                               "Perdida"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end space-x-2">
                            {call.status === "scheduled" ? (
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleJoinCall(call.id)}
                                title="Iniciar chamada"
                              >
                                <Play className="h-4 w-4 text-green-600" />
                              </Button>
                            ) : call.recording ? (
                              <Button 
                                variant="ghost" 
                                size="icon"
                                title="Baixar gravação"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            ) : null}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDeleteCall(call.id)}
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              title="Remover"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        Nenhuma chamada encontrada.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Diálogo para agendar chamada */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agendar Nova Chamada</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="callName">Nome da Chamada</Label>
              <Input 
                id="callName" 
                value={newCall.name}
                onChange={(e) => setNewCall({...newCall, name: e.target.value})}
                placeholder="Ex: Entrevista com Prefeito"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="callDate">Data</Label>
                <Input 
                  id="callDate" 
                  type="date"
                  value={newCall.date}
                  onChange={(e) => setNewCall({...newCall, date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="callTime">Hora</Label>
                <Input 
                  id="callTime" 
                  type="time"
                  value={newCall.time}
                  onChange={(e) => setNewCall({...newCall, time: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Tipo de Chamada</Label>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    id="audioType" 
                    name="callType"
                    checked={newCall.type === "audio"}
                    onChange={() => setNewCall({...newCall, type: "audio"})}
                    className="h-4 w-4 text-radio border-gray-300 focus:ring-radio"
                  />
                  <Label htmlFor="audioType" className="flex items-center">
                    <Phone className="mr-1 h-4 w-4" /> Áudio
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    id="videoType" 
                    name="callType"
                    checked={newCall.type === "video"}
                    onChange={() => setNewCall({...newCall, type: "video"})}
                    className="h-4 w-4 text-radio border-gray-300 focus:ring-radio"
                  />
                  <Label htmlFor="videoType" className="flex items-center">
                    <Video className="mr-1 h-4 w-4" /> Vídeo
                  </Label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>Cancelar</Button>
            <Button className="bg-radio hover:bg-radio-light" onClick={handleScheduleCall}>
              <Calendar className="mr-1 h-4 w-4" />
              Agendar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default Calls;
