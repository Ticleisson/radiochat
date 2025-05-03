
import React, { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface CallLoadingProps {
  isLoading: boolean;
  error: unknown;
  onBackToDashboard: () => void;
  children?: ReactNode;
}

export const CallLoading = ({ isLoading, error, onBackToDashboard, children }: CallLoadingProps) => {
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Carregando detalhes da chamada...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <p>Erro ao carregar detalhes da chamada.</p>
        <Button className="mt-4" onClick={onBackToDashboard}>
          Voltar ao Dashboard
        </Button>
      </div>
    );
  }
  
  return <>{children}</>;
};
