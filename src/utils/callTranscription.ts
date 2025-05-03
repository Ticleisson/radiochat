
export const SAMPLE_TRANSCRIPTIONS = [
  "Olá, hoje estamos em uma entrevista ao vivo.",
  "Vamos discutir os principais tópicos da semana.",
  "Obrigado por participar desta chamada.",
  "Como vocês estão se sentindo hoje?",
  "Nosso próximo tópico será sobre as novidades do mercado.",
  "Agradecemos a todos pela participação.",
];

/**
 * Gera uma transcrição aleatória para simular transcrições em tempo real
 */
export function getRandomTranscription(): string {
  return SAMPLE_TRANSCRIPTIONS[Math.floor(Math.random() * SAMPLE_TRANSCRIPTIONS.length)];
}

/**
 * Formata o tempo de duração da chamada
 * @param startTime Hora de início da chamada
 * @returns String formatada com a duração (MM:SS)
 */
export function formatCallDuration(startTime: Date): string {
  const diff = Date.now() - startTime.getTime();
  const minutes = Math.floor(diff / 60000).toString().padStart(2, '0');
  const seconds = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}
