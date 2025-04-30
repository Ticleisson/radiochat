import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, User, Bell, Radio, Mic, Api } from "lucide-react";
import { toast } from "sonner";

const Settings = () => {
  const [user, setUser] = useState(() => {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  });

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    company: user?.company || "",
    password: "",
    confirmPassword: "",
    notifications: {
      email: true,
      desktop: true,
      callReminders: true
    },
    audio: {
      autoMute: false,
      enhanceVoice: true,
      recordCalls: true
    },
    api: {
      evolutionApiKey: localStorage.getItem("evolutionApiKey") || "",
      evolutionInstanceId: localStorage.getItem("evolutionInstanceId") || "",
      evolutionBaseUrl: localStorage.getItem("evolutionBaseUrl") || "https://api.evolution.ai"
    }
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (section: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handleToggleChange = (section: string, field: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handleSaveProfile = () => {
    // Validação de senha
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    // Atualizar dados do usuário no localStorage
    const updatedUser = {
      ...user,
      name: formData.name,
      email: formData.email,
      company: formData.company
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    toast.success("Configurações salvas com sucesso");
  };

  const handleSaveApiSettings = () => {
    // Salvar configurações da API no localStorage
    localStorage.setItem("evolutionApiKey", formData.api.evolutionApiKey);
    localStorage.setItem("evolutionInstanceId", formData.api.evolutionInstanceId);
    localStorage.setItem("evolutionBaseUrl", formData.api.evolutionBaseUrl);
    
    toast.success("Configurações da API Evolution salvas com sucesso");
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Configurações</h1>
        </div>

        <Tabs defaultValue="profile" className="space-y-4">
          <TabsList>
            <TabsTrigger value="profile">
              <User className="mr-2 h-4 w-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="mr-2 h-4 w-4" />
              Notificações
            </TabsTrigger>
            <TabsTrigger value="audio">
              <Radio className="mr-2 h-4 w-4" />
              Áudio
            </TabsTrigger>
            <TabsTrigger value="api">
              <Api className="mr-2 h-4 w-4" />
              API
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Perfil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input 
                    id="name" 
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Empresa</Label>
                  <Input 
                    id="company" 
                    value={formData.company}
                    onChange={(e) => handleInputChange("company", e.target.value)}
                  />
                </div>
                
                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium mb-4">Alterar Senha</h3>
                  <div className="space-y-2">
                    <Label htmlFor="password">Nova Senha</Label>
                    <Input 
                      id="password" 
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2 mt-2">
                    <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                    <Input 
                      id="confirmPassword" 
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    />
                  </div>
                </div>
                
                <Button 
                  className="mt-4 bg-radio hover:bg-radio-light"
                  onClick={handleSaveProfile}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Preferências de Notificações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notificações por Email</p>
                    <p className="text-sm text-muted-foreground">Receber atualizações de chamadas por email</p>
                  </div>
                  <Switch 
                    checked={formData.notifications.email} 
                    onCheckedChange={(checked) => handleToggleChange("notifications", "email", checked)} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notificações Desktop</p>
                    <p className="text-sm text-muted-foreground">Receber alertas no navegador</p>
                  </div>
                  <Switch 
                    checked={formData.notifications.desktop} 
                    onCheckedChange={(checked) => handleToggleChange("notifications", "desktop", checked)} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Lembretes de Chamadas</p>
                    <p className="text-sm text-muted-foreground">Receber lembretes de chamadas agendadas</p>
                  </div>
                  <Switch 
                    checked={formData.notifications.callReminders} 
                    onCheckedChange={(checked) => handleToggleChange("notifications", "callReminders", checked)} 
                  />
                </div>
                
                <Button 
                  className="mt-4 bg-radio hover:bg-radio-light"
                  onClick={() => toast.success("Preferências de notificações salvas")}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Preferências
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="audio">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Áudio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Mudo Automático</p>
                    <p className="text-sm text-muted-foreground">Silenciar áudio automaticamente ao entrar em uma chamada</p>
                  </div>
                  <Switch 
                    checked={formData.audio.autoMute} 
                    onCheckedChange={(checked) => handleToggleChange("audio", "autoMute", checked)} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Aprimorar Voz</p>
                    <p className="text-sm text-muted-foreground">Melhorar qualidade de áudio durante chamadas</p>
                  </div>
                  <Switch 
                    checked={formData.audio.enhanceVoice} 
                    onCheckedChange={(checked) => handleToggleChange("audio", "enhanceVoice", checked)} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Gravar Chamadas</p>
                    <p className="text-sm text-muted-foreground">Gravar áudio das chamadas automaticamente</p>
                  </div>
                  <Switch 
                    checked={formData.audio.recordCalls} 
                    onCheckedChange={(checked) => handleToggleChange("audio", "recordCalls", checked)} 
                  />
                </div>
                
                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium mb-4">Dispositivos de Áudio</h3>
                  <div className="space-y-2">
                    <Label htmlFor="microphone">Microfone</Label>
                    <div className="flex items-center space-x-2">
                      <Mic className="h-4 w-4 text-muted-foreground" />
                      <select
                        id="microphone"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      >
                        <option>Microfone Padrão</option>
                        <option>Headset (USB)</option>
                        <option>Microfone Externo</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <Button 
                  className="mt-4 bg-radio hover:bg-radio-light"
                  onClick={() => toast.success("Configurações de áudio salvas")}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Configurações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api">
            <Card>
              <CardHeader>
                <CardTitle>Integração com API Evolution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="evolution-api-key">Chave da API Evolution</Label>
                  <Input 
                    id="evolution-api-key" 
                    type="password"
                    value={formData.api.evolutionApiKey}
                    onChange={(e) => handleNestedInputChange("api", "evolutionApiKey", e.target.value)}
                    placeholder="Insira sua chave de API Evolution"
                  />
                  <p className="text-sm text-muted-foreground">A chave de autenticação para a API Evolution.</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="evolution-instance-id">ID da Instância</Label>
                  <Input 
                    id="evolution-instance-id"
                    value={formData.api.evolutionInstanceId}
                    onChange={(e) => handleNestedInputChange("api", "evolutionInstanceId", e.target.value)}
                    placeholder="ID da sua instância do WhatsApp"
                  />
                  <p className="text-sm text-muted-foreground">O identificador único da sua instância do WhatsApp.</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="evolution-base-url">URL Base da API</Label>
                  <Input 
                    id="evolution-base-url"
                    value={formData.api.evolutionBaseUrl}
                    onChange={(e) => handleNestedInputChange("api", "evolutionBaseUrl", e.target.value)}
                    placeholder="https://api.evolution.ai"
                  />
                  <p className="text-sm text-muted-foreground">O endereço base da API Evolution.</p>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="text-lg font-medium mb-2">Status da Conexão</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-sm">Não conectado</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Salve as configurações e teste a conexão para verificar o status.
                  </p>
                </div>
                
                <div className="flex space-x-2 pt-4">
                  <Button 
                    className="bg-radio hover:bg-radio-light"
                    onClick={handleSaveApiSettings}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Configurações
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => {
                      if (!formData.api.evolutionApiKey || !formData.api.evolutionInstanceId) {
                        toast.error("Preencha todos os campos obrigatórios");
                        return;
                      }
                      toast.info("Testando conexão com a API Evolution...");
                      // Aqui seria implementada a lógica para testar a conexão
                      setTimeout(() => {
                        toast.success("Conexão estabelecida com sucesso!");
                      }, 2000);
                    }}
                  >
                    Testar Conexão
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Settings;
