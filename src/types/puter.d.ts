/* eslint-disable @typescript-eslint/no-explicit-any */
interface PuterAI {
  txt2speech(text: string, options?: any): Promise<HTMLAudioElement>;
}

interface Puter {
  ai: PuterAI;
}

declare const puter: Puter;
