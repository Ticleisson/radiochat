
import { useState, useRef } from "react";
import JitsiManager from "@/utils/jitsi/JitsiManager";
import { toast } from "sonner";

export const useJitsiConnection = () => {
  const [isConnected, setIsConnected] = useState(false);
  const jitsiManagerRef = useRef<JitsiManager | null>(null);

  // Inicializa o gerenciador Jitsi
  const initializeJitsi = () => {
    if (!jitsiManagerRef.current) {
      console.log("Inicializando gerenciador Jitsi");
      jitsiManagerRef.current = new JitsiManager();
      return jitsiManagerRef.current;
    }
    
    return jitsiManagerRef.current;
  };

  // Configura manipuladores de eventos de conexão
  const setupConnectionEventHandlers = () => {
    return {
      connectionEstablished: () => {
        console.log("Conexão estabelecida com Jitsi");
        setIsConnected(true);
      },
      connectionFailed: (error: any) => {
        console.error("Falha na conexão com Jitsi:", error);
        setIsConnected(false);
        toast.error("Falha na conexão. Tente novamente.");
      },
      connectionStatusChanged: (status: "connected" | "connecting" | "disconnected" | "failed") => {
        console.log("Status da conexão alterado:", status);
        setIsConnected(status === "connected");
      }
    };
  };

  // Entra na sala Jitsi
  const joinJitsiRoom = async (roomName: string, displayName: string) => {
    const jitsi = initializeJitsi();
    console.log(`Entrando na sala: ${roomName} como ${displayName}`);
    return await jitsi.joinRoom(roomName, displayName);
  };

  // Sai da sala Jitsi
  const leaveJitsiRoom = () => {
    if (jitsiManagerRef.current) {
      jitsiManagerRef.current.leaveRoom();
    }
    setIsConnected(false);
  };

  return {
    isConnected,
    jitsiManagerRef,
    initializeJitsi,
    setupConnectionEventHandlers,
    joinJitsiRoom,
    leaveJitsiRoom
  };
};
