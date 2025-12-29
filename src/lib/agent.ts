export const AGENT_ID = process.env.NEXT_PUBLIC_AGENT_ID || '';
export const AGENT_NAME = "Gabriela Salvador";

let warned = false;
export function ensureAgentConfigured() {
  if (!AGENT_ID && !warned) {
    warned = true;
    console.error('NEXT_PUBLIC_AGENT_ID no configurado. Acciones de Take/Send deshabilitadas.');
  }
  return !!AGENT_ID;
}
