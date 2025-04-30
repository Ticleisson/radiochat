
import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, User, Bell, Radio, Mic, FileText } from "lucide-react";
import { toast } from "sonner";

const Settings = () => {
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profileCompany, setProfileCompany] = useState("");
  
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [enableSoundAlerts, setEnableSoundAlerts] = useState(true);
  const [enableCallReminders, setEnableCallReminders] = useState(true);
  
  const [microphoneInput, setMicrophoneInput] = useState("");
  const [speakerOutput, setSpeakerOutput] = useState("");
  const [audioQuality, setAudioQuality] = useState("medium");

  const [apiKey, setApiKey] = useState("");
  const [instanceId, setInstanceId] = useState("");
  const [baseUrl, setBaseUrl] = useState("https://api.evolution.com");

  const [deepSeekApiKey, setDeepSeekApiKey] = useState("");
  
  useEffect(() => {
    // Load user profile
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setProfileName(user.name || "");
      setProfileEmail(user.email || "");
      setProfileCompany(user.company || "");
    }
    
    // Load notification settings
    const notificationSettings = localStorage.getItem("notificationSettings");
    if (notificationSettings) {
      const settings = JSON.parse(notificationSettings);
      setEnableNotifications(settings.enableNotifications);
      setEnableSoundAlerts(settings.enableSoundAlerts);
      setEnableCallReminders(settings.enableCallReminders);
    }
    
    // Load audio settings
    const audioSettings = localStorage.getItem("audioSettings");
    if (audioSettings) {
      const settings = JSON.parse(audioSettings);
      setMicrophoneInput(settings.microphoneInput || "");
      setSpeakerOutput(settings.speakerOutput || "");
      setAudioQuality(settings.audioQuality || "medium");
    }

    // Load API settings
    const apiSettings = localStorage.getItem("apiSettings");
    if (apiSettings) {
      const settings = JSON.parse(apiSettings);
      setApiKey(settings.apiKey || "");
      setInstanceId(settings.instanceId || "");
      setBaseUrl(settings.baseUrl || "https://api.evolution.com");
      setDeepSeekApiKey(settings.deepSeekApiKey || "");
    }
  }, []);
  
  const handleSaveProfile = () => {
    const user = { name: profileName, email: profileEmail, company: profileCompany };
    localStorage.setItem("user", JSON.stringify(user));
    toast.success("Perfil salvo com sucesso!");
  };
  
  const handleSaveNotifications = () => {
    const settings = { 
      enableNotifications, 
      enableSoundAlerts, 
      enableCallReminders 
    };
    localStorage.setItem("notificationSettings", JSON.stringify(settings));
    toast.success("Configurações de notificação salvas com sucesso!");
  };
  
  const handleSaveAudio = () => {
    const settings = {
      microphoneInput,
      speakerOutput,
      audioQuality
    };
    localStorage.setItem("audioSettings", JSON.stringify(settings));
    toast.success("Configurações de áudio salvas com sucesso!");
  };

  const handleSaveApi = () => {
    const settings = {
      apiKey,
      instanceId,
      baseUrl,
      deepSeekApiKey
    };
    localStorage.setItem("apiSettings", JSON.stringify(settings));
    toast.success("Configurações de API salvas com sucesso!");
  };

  const handleTestConnection = () => {
    // This would actually test the connection in a real app
    if (!apiKey || !instanceId) {
      toast.error("Chave de API e ID da Instância são obrigatórios");
      return;
    }
    
    toast.info("Testando conexão...");
    setTimeout(() => {
      toast.success("Conexão estabelecida com sucesso!");
    }, 1500);
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Configurações</h1>
          <p className="text-muted-foreground">
            Gerencie suas preferências e configurações.
          </p>
        </div>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
            <TabsTrigger value="audio">Áudio</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Perfil</CardTitle>
                <CardDescription>
                  Gerencie as informações do seu perfil.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input 
                    id="name" 
                    value={profileName} 
                    onChange={(e) => setProfileName(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={profileEmail} 
                    onChange={(e) => setProfileEmail(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Empresa</Label>
                  <Input 
                    id="company" 
                    value={profileCompany} 
                    onChange={(e) => setProfileCompany(e.target.value)} 
                  />
                </div>
                <Button onClick={handleSaveProfile}>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notificações</CardTitle>
                <CardDescription>
                  Configure suas preferências de notificação.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="enable-notifications">Ativar Notificações</Label>
                  <Switch 
                    id="enable-notifications" 
                    checked={enableNotifications} 
                    onCheckedChange={setEnableNotifications} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="sound-alerts">Alertas Sonoros</Label>
                  <Switch 
                    id="sound-alerts" 
                    checked={enableSoundAlerts} 
                    onCheckedChange={setEnableSoundAlerts} 
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="call-reminders">Lembretes de Chamada</Label>
                  <Switch 
                    id="call-reminders" 
                    checked={enableCallReminders} 
                    onCheckedChange={setEnableCallReminders} 
                  />
                </div>
                <Button onClick={handleSaveNotifications}>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Preferências
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="audio">
            <Card>
              <CardHeader>
                <CardTitle>Áudio</CardTitle>
                <CardDescription>
                  Configure suas preferências de áudio para chamadas.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="microphone">Dispositivo de Entrada (Microfone)</Label>
                  <Input 
                    id="microphone" 
                    value={microphoneInput} 
                    onChange={(e) => setMicrophoneInput(e.target.value)} 
                    placeholder="Microfone padrão"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="speaker">Dispositivo de Saída (Alto-falante)</Label>
                  <Input 
                    id="speaker" 
                    value={speakerOutput} 
                    onChange={(e) => setSpeakerOutput(e.target.value)} 
                    placeholder="Alto-falante padrão"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="audio-quality">Qualidade de Áudio</Label>
                  <select 
                    id="audio-quality"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={audioQuality}
                    onChange={(e) => setAudioQuality(e.target.value)}
                  >
                    <option value="low">Baixa (Economiza dados)</option>
                    <option value="medium">Média</option>
                    <option value="high">Alta (Melhor qualidade)</option>
                    <option value="hd">HD</option>
                  </select>
                </div>
                <Button onClick={handleSaveAudio}>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Configurações
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api">
            <Card>
              <CardHeader>
                <CardTitle>Configurações de API</CardTitle>
                <CardDescription>
                  Configure as integrações com APIs externas.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium flex items-center">
                      <Radio className="mr-2 h-5 w-5" />
                      API Evolution
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Conecte-se à API Evolution para recursos avançados de comunicação.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="api-key">Chave de API</Label>
                    <Input 
                      id="api-key" 
                      value={apiKey} 
                      onChange={(e) => setApiKey(e.target.value)} 
                      placeholder="Sua chave de API"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instance-id">ID da Instância</Label>
                    <Input 
                      id="instance-id" 
                      value={instanceId} 
                      onChange={(e) => setInstanceId(e.target.value)} 
                      placeholder="ID da sua instância"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="base-url">URL Base</Label>
                    <Input 
                      id="base-url" 
                      value={baseUrl} 
                      onChange={(e) => setBaseUrl(e.target.value)} 
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleSaveApi}>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar
                    </Button>
                    <Button variant="outline" onClick={handleTestConnection}>
                      Testar Conexão
                    </Button>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <h3 className="text-lg font-medium flex items-center">
                      <FileText className="mr-2 h-5 w-5" />
                      API DeepSeek
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Conecte-se à API DeepSeek para geração de conteúdo a partir de transcrições.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deepseek-api-key">Chave de API DeepSeek</Label>
                    <Input 
                      id="deepseek-api-key" 
                      value={deepSeekApiKey} 
                      onChange={(e) => setDeepSeekApiKey(e.target.value)} 
                      placeholder="Sua chave de API DeepSeek"
                      type="password"
                    />
                  </div>
                  <Button onClick={handleSaveApi}>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar
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
