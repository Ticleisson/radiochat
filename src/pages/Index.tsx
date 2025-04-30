
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "@/components/auth/LoginForm";
import { Phone, Users, Video } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      navigate("/dashboard");
    }
  }, [navigate]);
  
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-radio-muted to-white lg:flex-row">
      <div className="flex flex-1 items-center justify-center p-6 lg:w-1/2">
        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
      
      <div className="hidden flex-1 flex-col items-center justify-center bg-radio p-6 text-white lg:flex lg:w-1/2">
        <div className="w-full max-w-md space-y-6">
          <div>
            <h1 className="text-4xl font-bold">Radio Chat Central</h1>
            <p className="mt-2 text-xl">Streamline your radio interviews with WhatsApp integration</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-radio">
                <Phone className="h-4 w-4" />
              </div>
              <p>Connect with guests via WhatsApp</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-radio">
                <Users className="h-4 w-4" />
              </div>
              <p>Manage multiple guests in one call</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-radio">
                <Video className="h-4 w-4" />
              </div>
              <p>OBS Studio compatible for on-air broadcasts</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
