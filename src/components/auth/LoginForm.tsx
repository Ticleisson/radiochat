
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await signIn(email, password);
      // The auth context will handle navigation on successful login
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6 rounded-xl bg-white p-8 shadow-md">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Radio Chat Central</h1>
        <p className="mt-2 text-sm text-gray-600">Entre na sua conta</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="seu@email.com" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input 
            id="password" 
            type="password" 
            placeholder="••••••••" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-sm">
            <a href="#" className="font-medium text-accent hover:text-accent/80">
              Esqueceu sua senha?
            </a>
          </div>
        </div>
        
        <Button 
          className="w-full bg-radio hover:bg-radio-light" 
          type="submit" 
          disabled={isLoading}
        >
          {isLoading ? "Entrando..." : "Entrar"}
        </Button>
      </form>
      
      <div className="mt-6 text-center text-sm text-gray-600">
        <div className="flex justify-center space-x-1">
          <span>Não tem uma conta?</span>
          <a href="#/auth?tab=signup" className="font-medium text-accent hover:text-accent/80">
            Cadastre-se
          </a>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
