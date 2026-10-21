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
    { say: "Si parte dalla descrizione della CFS 9: se non corrisponde al paziente, si passa alla categoria successiva." },
    { say: "Il primo sì indica la categoria del paziente." },
  ]},
  { id: "c3", extra: 1.2, lines: [
    { say: "Ogni categoria appartiene a un gruppo:" },
    { say: "A, B o C." },
  ]},
  { id: "c4", extra: 1.6, lines: [
    { say: "Oppure, se conosci già la categoria," },
    { say: "apri direttamente le schede CFS." },
  ]},
  { id: "c5", extra: 1.2, lines: [
    { say: "Secondo: la scheda," },
    { say: "con la descrizione della categoria e il suo gruppo." },
  ]},
  { id: "c6", extra: 2.4, lines: [
    { say: "Terzo: il percorso del gruppo," },
    { say: "con esami, correzione della vitamina D e terapia." },
  ]},
  { id: "c7", extra: 1.4, lines: [
    { say: "Nel gruppo A, il Charlson orienta il percorso:" },
    { say: "da sei in su come il gruppo B; sotto, pannello completo e Bone Specialist." },
  ]},
  { id: "c8", extra: 0.8, lines: [
    { say: "Dalla home trovi anche il diagramma di flusso, gli esami, la vitamina D e le fonti del protocollo." },
  ]},
  { id: "c9", extra: 2.6, lines: [
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
