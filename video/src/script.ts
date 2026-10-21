// Copione: una voce per scena. Le battute di una scena sono pezzi della stessa frase.
// Con l'audio i tempi vengono da src/audio.json (durata e pause misurate); senza, sono stimati.
import audio from "./audio.json";

export const FPS = 30;

export type Line = { say: string };
export type SceneDef = { id: string; lines: Line[]; extra?: number };

export const SCENES: SceneDef[] = [
  { id: "c1", lines: [
    { say: "Paziente con frattura di femore da fragilità:" },
    { say: "Osteoclick ti guida nel percorso FLS in tre passi." },
  ]},
  { id: "c2", extra: 2.2, lines: [
    { say: "Primo: il questionario CFS." },
    { say: "Le domande partono dai gradi più gravi: ti fermi al primo sì." },
  ]},
  { id: "c3", extra: 1.2, lines: [
    { say: "Il primo sì assegna la categoria" },
    { say: "e il gruppo: A, B o C." },
  ]},
  { id: "c4", extra: 2.4, lines: [
    { say: "Secondo: la scheda del gruppo," },
    { say: "con esami, correzione della vitamina D e trattamento." },
  ]},
  { id: "c5", extra: 1.6, lines: [
    { say: "Terzo, solo nel gruppo A: il Charlson." },
    { say: "Da sei in su, percorso del gruppo B; sotto, pannello completo e Bone Specialist." },
  ]},
  { id: "c6", extra: 0.8, lines: [
    { say: "Dalla home trovi anche il diagramma di flusso, gli esami, la vitamina D e le fonti del protocollo." },
  ]},
  { id: "c7", extra: 2.6, lines: [
    { say: "Osteoclick." },
  ]},
];

const CPS = 15, TAIL = 1.1;
export const LEAD = 0.5;
export type Voice = { dur: number; cuts: number[] };
const VOICE = audio as Record<string, Voice>;

export function timing(s: SceneDef) {
  const v = VOICE[s.id];
  const chars = s.lines.map(l => l.say.length);
  const total = chars.reduce((a, b) => a + b, 0);
  let bounds: number[];
  if (v) bounds = [0, ...v.cuts, v.dur];
  else {
    const speech = total / CPS + (s.lines.length - 1) * 0.45;
    let acc = 0;
    bounds = [0, ...chars.map(c => (acc += c) / total * speech)];
  }
  const speech = bounds[bounds.length - 1];
  const frames = Math.round((LEAD + speech + TAIL + (s.extra ?? 0)) * FPS);
  const lines = s.lines.map((l, i) => ({ ...l, from: Math.round((LEAD + bounds[i]) * FPS), to: Math.round((LEAD + bounds[i + 1]) * FPS) }));
  return { frames, lines, hasAudio: !!v };
}

export const TRANSITION = 14;
export const totalFrames = () =>
  SCENES.reduce((a, s) => a + timing(s).frames, 0) - TRANSITION * (SCENES.length - 1);
