
import JitsiManager from "./JitsiManager";
import { JitsiParticipant, JitsiEventHandlers } from "./types";

// Exportamos uma única instância para uso em toda a aplicação
export const jitsiManager = new JitsiManager();

export type { JitsiParticipant, JitsiEventHandlers };
