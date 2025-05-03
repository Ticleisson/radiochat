
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, Users, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  
  useEffect(() => {
    if (!isLoading) {
      if (user) {
        navigate("/dashboard");
      } else {
        navigate("/auth");
      }
    }
  }, [navigate, user, isLoading]);
  
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-radio-muted to-white lg:flex-row">
      <div className="flex flex-1 items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-md space-y-6 text-center">
          <h1 className="text-4xl font-bold">Radio Chat Central</h1>
          <p className="mt-2 text-xl">Carregando...</p>
          <Button 
            onClick={() => navigate("/auth")} 
            className="bg-radio hover:bg-radio-light"
          >
            Ir para Login
          </Button>
        </div>
      </div>
      
      <div className="hidden flex-1 flex-col items-center justify-center bg-radio p-6 text-white lg:flex lg:w-1/2">
        <div className="w-full max-w-md space-y-6">
          <div>
            <h1 className="text-4xl font-bold">Radio Chat Central</h1>
            <p className="mt-2 text-xl">Simplifique suas entrevistas com integração WhatsApp</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-radio">
                <Phone className="h-4 w-4" />
              </div>
              <p>Conecte-se com convidados via WhatsApp</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-radio">
                <Users className="h-4 w-4" />
              </div>
              <p>Gerencie múltiplos convidados em uma chamada</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-radio">
                <Video className="h-4 w-4" />
              </div>
              <p>Compatível com OBS Studio para transmissões ao vivo</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
