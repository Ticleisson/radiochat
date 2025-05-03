
import { toast } from "sonner";

/**
 * Carrega o script Jitsi Meet
 * @param callback Função a ser chamada quando o script for carregado
 */
export const loadJitsiMeetScript = (callback: () => void) => {
  if (window.JitsiMeetJS) {
    callback();
    return;
  }

  const script = document.createElement('script');
  script.src = 'https://jitsi.radiochat.cleissoncardoso.com/libs/lib-jitsi-meet.min.js';
  script.async = true;
  script.onload = () => {
    callback();
  };
  script.onerror = () => {
    toast.error("Erro ao carregar o script do Jitsi. Verifique se o servidor está acessível.");
    console.error("Failed to load Jitsi Meet script");
  };
  document.body.appendChild(script);
};

/**
 * Inicializa o Jitsi Meet
 * @returns Boolean indicando se a inicialização foi bem-sucedida
 */
export const initJitsiMeet = (): boolean => {
  if (!window.JitsiMeetJS) {
    return false;
  }

  const JitsiMeetJS = window.JitsiMeetJS;
  
  JitsiMeetJS.init();
  JitsiMeetJS.setLogLevel(JitsiMeetJS.logLevels.ERROR);

  return true;
};

/**
 * Exibe um toast de erro
 * @param message Mensagem de erro
 */
export const showErrorToast = (message: string) => {
  console.error(message);
  toast.error(message);
};
