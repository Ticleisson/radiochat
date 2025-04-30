
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // This would normally connect to a real auth system
    try {
      // Simulate authentication
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (email === "demo@radio.com" && password === "password") {
        localStorage.setItem("user", JSON.stringify({
          id: "1",
          name: "Demo User",
          email,
          company: "Radio Central FM",
          role: "admin"
        }));
        toast.success("Login successful!");
        navigate("/dashboard");
      } else {
        toast.error("Invalid credentials");
      }
    } catch (error) {
      toast.error("An error occurred during login");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6 rounded-xl bg-white p-8 shadow-md">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Radio Chat Central</h1>
        <p className="mt-2 text-sm text-gray-600">Sign in to your account</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="your@email.com" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
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
              Forgot your password?
            </a>
          </div>
        </div>
        
        <Button 
          className="w-full bg-radio hover:bg-radio-light" 
          type="submit" 
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>
      
      <div className="mt-6 text-center text-sm text-gray-600">
        <div className="flex justify-center space-x-1">
          <span>Don't have an account?</span>
          <a href="#" className="font-medium text-accent hover:text-accent/80">
            Contact us
          </a>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          <p>Use demo@radio.com / password to test</p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
