import React from "react";
import { AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont } from "@remotion/fonts";
import { FPS, LEAD, SCENES, TRANSITION, timing } from "./script";

// Inter variabile, incluso nel progetto (rsms/inter, SIL Open Font License)
const fontFamily = "Inter";
loadFont({ family: fontFamily, url: staticFile("fonts/inter-latin-wght-normal.woff2"), weight: "100 900" });

// palette di Osteoclick
const C = {
  bg: "#F7F5F1", ink: "#172231", muted: "#6B7584", line: "#E1E5EB", box: "#FFFFFF", faint: "#B5BECA",
  accent: "#2B587D", accentBox: "#E3ECF5", blue: "#BCD2E8", peach: "#F5CAB0",
  A: "#3D6E35", Abox: "#E6F1E4", B: "#9E511B", Bbox: "#FBEBDF", Cc: "#A33A3A", Cbox: "#F8E6E6",
};
const GROUP = { A: { fg: C.A, bg: C.Abox, cfs: [1, 2, 3, 4], range: "CFS 1–4" }, B: { fg: C.B, bg: C.Bbox, cfs: [5, 6, 7], range: "CFS 5–7" }, C: { fg: C.Cc, bg: C.Cbox, cfs: [8, 9], range: "CFS 8–9" } } as const;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = Easing.bezier(0.2, 0.7, 0.2, 1);
const fade = (f: number, from: number, len = 18) => interpolate(f, [from, from + len], [0, 1], { ...clamp, easing: ease });
const useSpring = (delay: number, damping = 16) => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  return spring({ frame: f - delay, fps, config: { damping, mass: 0.8 } });
};

/* ---------- elementi comuni ---------- */
const Rise: React.FC<{ delay: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ delay, children, style }) => {
  const s = useSpring(delay);
  return <div style={{ opacity: s, transform: `translateY(${(1 - s) * 50}px)`, ...style }}>{children}</div>;
};

const Title: React.FC<{ children: React.ReactNode; delay?: number; size?: number }> = ({ children, delay = 4, size = 92 }) => (
  <Rise delay={delay}><div style={{ fontSize: size, lineHeight: 1.04, fontWeight: 800, letterSpacing: -2.5, color: C.ink }}>{children}</div></Rise>
);

// evidenziatore che scorre sotto una parola
const Mark: React.FC<{ children: React.ReactNode; color: string; bg: string; delay: number }> = ({ children, color, bg, delay }) => {
  const f = useCurrentFrame();
  const w = interpolate(f, [delay, delay + 16], [0, 100], { ...clamp, easing: ease });
  return <span style={{ position: "relative", color, whiteSpace: "nowrap" }}>
    <span style={{ position: "absolute", left: -8, right: -8, bottom: 4, height: "42%", background: bg, borderRadius: 10, zIndex: -1, clipPath: `inset(0 ${100 - w}% 0 0)` }} />
    {children}
  </span>;
};

const Background: React.FC = () => {
  const f = useCurrentFrame();
  const a = Math.sin(f / 90), b = Math.cos(f / 110);
  const blob = (c: string, x: number, y: number, r: number) => (
    <div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: "50%", background: c, filter: "blur(120px)", opacity: 0.6 }} />
  );
  return <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>
    {blob(C.peach, 980 + a * 60, 240 + b * 40, 360)}
    {blob(C.blue, 80 + b * 50, 1500 + a * 60, 420)}
  </AbsoluteFill>;
};

const Body: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", left: 90, right: 90, top: 330, bottom: 300, display: "flex", flexDirection: "column", justifyContent: "center", gap: 40 }}>{children}</div>
);

/* ---------- l'app disegnata dal vivo, in px logici ---------- */
const A = { ink: "#172231", muted: "#6B7584", faint: "#B5BECA", line: "#E6E9EE", fill: "#F4F5F7", accent: "#2B587D", teal: "#0E7571" };
const LW = 330, LH = 714;
const PHONE_H = 1050, K = PHONE_H / LH, PHONE_W = Math.round(LW * K);
const PHONE_TOP = 470, PHONE_L = (1080 - PHONE_W - 28) / 2, PHONE_R = PHONE_L + PHONE_W + 28;
const vy = (y: number) => PHONE_TOP + 14 + y * K;
const TOP = 88;

const StatusBar: React.FC = () => (
  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 44, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 28px 0", fontSize: 15, fontWeight: 600, color: A.ink }}>
    <span>9:41</span>
    <span style={{ display: "flex", gap: 6, alignItems: "center" }}>
      <svg width="18" height="11" viewBox="0 0 18 11"><rect x="0" y="7" width="3" height="4" rx="1" fill={A.ink} /><rect x="5" y="5" width="3" height="6" rx="1" fill={A.ink} /><rect x="10" y="2.5" width="3" height="8.5" rx="1" fill={A.ink} /><rect x="15" y="0" width="3" height="11" rx="1" fill={A.ink} /></svg>
      <svg width="25" height="12" viewBox="0 0 25 12"><rect x="0.5" y="0.5" width="21" height="11" rx="3" fill="none" stroke={A.ink} opacity=".4" /><rect x="2" y="2" width="16" height="8" rx="1.6" fill={A.ink} /><rect x="23" y="4" width="1.6" height="4" rx=".8" fill={A.ink} opacity=".4" /></svg>
    </span>
  </div>
);

const AppBar: React.FC<{ title: string; act?: string }> = ({ title, act }) => (
  <div style={{ position: "absolute", top: 44, left: 0, right: 0, height: 44, display: "grid", gridTemplateColumns: "80px 1fr 80px", alignItems: "center", padding: "0 16px" }}>
    <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke={A.muted} strokeWidth={1.8} strokeLinecap="round"><path d="m15 5-7 7 7 7" /></svg>
    <div style={{ textAlign: "center", fontSize: 14.4, fontWeight: 600, color: A.ink }}>{title}</div>
    <div style={{ textAlign: "right", fontSize: 13.2, fontWeight: 500, color: A.muted }}>{act}</div>
  </div>
);

// schermata con contenuto a posizioni fisse (y logiche dall'alto dello schermo), che può scorrere
const Screen: React.FC<{ title?: string; act?: string; children: React.ReactNode; scroll?: number; home?: boolean }> = ({ title, act, children, scroll = 0, home }) => (
  <div style={{ position: "absolute", inset: 0, background: "#fff", overflow: "hidden" }}>
    <div style={{ position: "absolute", inset: 0, transform: `translateY(${-scroll}px)` }}>{children}</div>
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: TOP, background: "#fff" }} />
    <StatusBar />
    {home
      ? <div style={{ position: "absolute", top: 44, left: 16, right: 16, height: 44, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 800, fontSize: 16, color: A.ink }}><span style={{ width: 32, height: 32, borderRadius: 9, background: A.ink, color: "#fff", display: "grid", placeItems: "center", fontSize: 13 }}>OC</span>Osteoclick</span>
          <span style={{ width: 36, height: 36, borderRadius: "50%", background: A.fill }} />
        </div>
      : <AppBar title={title ?? ""} act={act} />}
  </div>
);
const At: React.FC<{ y: number; children: React.ReactNode; h?: number }> = ({ y, children, h }) => (
  <div style={{ position: "absolute", top: y, left: 16, right: 16, height: h }}>{children}</div>
);
const Lbl: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ fontSize: 10.9, fontWeight: 700, letterSpacing: 1.1, textTransform: "uppercase", color: A.muted }}>{children}</div>
);

const Tap: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => {
  const f = useCurrentFrame();
  const k = interpolate(f, [t - 8, t, t + 16], [0, 1, 2], clamp);
  if (k <= 0 || k >= 2) return null;
  return <>
    <div style={{ position: "absolute", left: x - 22, top: y - 22, width: 44, height: 44, borderRadius: "50%", background: "rgba(23,34,49,.22)", opacity: k < 1 ? k : 2 - k, transform: `scale(${k < 1 ? 1.3 - k * 0.3 : 1})` }} />
    <div style={{ position: "absolute", left: x - 34, top: y - 34, width: 68, height: 68, borderRadius: "50%", border: "3px solid rgba(23,34,49,.45)", opacity: k > 1 ? 2 - k : 0, transform: `scale(${k > 1 ? 0.5 + (k - 1) : 0.5})` }} />
  </>;
};

// la nuova schermata entra da destra, la precedente scivola un po' a sinistra
const Nav: React.FC<{ screens: { t: number; el: React.ReactNode }[] }> = ({ screens }) => {
  const f = useCurrentFrame();
  let cur = 0; screens.forEach((s, i) => { if (f >= s.t) cur = i; });
  return <>{screens.map((s, i) => {
    if (i < cur - 1 || i > cur) return null;
    const enter = interpolate(f, [screens[cur].t, screens[cur].t + 14], [0, 1], { ...clamp, easing: ease });
    const x = i === cur ? (cur === 0 ? 0 : (1 - enter) * LW) : -enter * LW * 0.28;
    return <div key={i} style={{ position: "absolute", inset: 0, transform: `translateX(${x}px)`, boxShadow: i === cur && cur > 0 ? "-8px 0 24px rgba(0,0,0,.08)" : "none" }}>{s.el}</div>;
  })}</>;
};

const Phone: React.FC<{ children: React.ReactNode; out?: number }> = ({ children, out = 1e9 }) => {
  const f = useCurrentFrame(), { fps } = useVideoConfig();
  const pop = spring({ frame: f, fps, config: { damping: 18, mass: 0.8 } });
  const leave = interpolate(f, [out, out + 14], [0, 1], { ...clamp, easing: ease });
  return <div style={{ position: "absolute", left: 0, right: 0, top: PHONE_TOP, display: "flex", justifyContent: "center", opacity: pop * (1 - leave) }}>
    <div style={{ width: PHONE_W + 28, height: PHONE_H + 28, borderRadius: 78, background: C.ink, padding: 14, boxShadow: "0 40px 100px rgba(23,34,49,.25)", transform: `translateY(${(1 - pop) * 80 - leave * 60}px) scale(${0.94 + pop * 0.06 - leave * 0.06})` }}>
      <div style={{ position: "relative", width: PHONE_W, height: PHONE_H, borderRadius: 64, overflow: "hidden", background: "#fff" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: LW, height: LH, transform: `scale(${K})`, transformOrigin: "0 0", fontFamily }}>{children}</div>
      </div>
    </div>
  </div>;
};

const Dock: React.FC<{ title: string; sub: string; show: number }> = ({ title, sub, show }) => (
  <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "10px 16px 22px", background: "linear-gradient(to top,#fff 70%,rgba(255,255,255,0))", transform: `translateY(${(1 - show) * 100}px)` }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, borderRadius: 18, padding: "14px 16px", background: A.ink, color: "#fff" }}>
      <div><b style={{ display: "block", fontSize: 15.7 }}>{title}</b><span style={{ display: "block", fontSize: 12.5, opacity: 0.7 }}>{sub}</span></div>
      <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round"><path d="M12 5v14m-6-6 6 6 6-6" /></svg>
    </div>
  </div>
);

// titolo in alto, come nelle scene senza telefono
const AppTitle: React.FC<{ children: React.ReactNode; size?: number }> = ({ children, size = 80 }) => (
  <div style={{ position: "absolute", left: 90, right: 90, top: 290 }}><Title size={size}>{children}</Title></div>
);

// etichetta accanto al telefono, all'altezza dell'elemento indicato
const Callout: React.FC<{ t: number; until?: number; side: "l" | "r"; y: number; color?: string; children: React.ReactNode }> = ({ t, until = 1e9, side, y, color = C.accent, children }) => {
  const f = useCurrentFrame();
  const s = spring({ frame: f - t, fps: FPS, config: { damping: 15, mass: 0.6 } });
  const o = Math.min(s, interpolate(f, [until, until + 10], [1, 0], clamp));
  if (o <= 0) return null;
  const pos: React.CSSProperties = side === "l" ? { right: 1080 - PHONE_L + 26 } : { left: PHONE_R + 26 };
  return <div style={{ position: "absolute", top: vy(y), ...pos, transform: `translateY(-50%) translateX(${(1 - s) * (side === "l" ? -30 : 30)}px)`, opacity: o, display: "flex", alignItems: "center", flexDirection: side === "l" ? "row" : "row-reverse" }}>
    <div style={{ maxWidth: 240, background: "#fff", borderRadius: 24, padding: "14px 20px", fontSize: 35, fontWeight: 800, lineHeight: 1.15, color, letterSpacing: -0.5, boxShadow: "0 14px 40px rgba(23,34,49,.14)", textAlign: side === "l" ? "right" : "left" }}>{children}</div>
    <div style={{ width: 22, height: 4, borderRadius: 2, background: color }} />
  </div>;
};

/* ---------- gli omini della Clinical Frailty Scale ---------- */
// le illustrazioni dell'app (img/cfs-N.jpg) con un piccolo movimento proprio di ciascuna
const CfsFigure: React.FC<{ n: number; size: number; delay: number; on?: number; dim?: number }> = ({ n, size, delay, on = 0, dim = 0 }) => {
  const f = useCurrentFrame();
  const s = spring({ frame: f - delay, fps: FPS, config: { damping: 12, mass: 0.7 } });
  const t = (f - delay) / FPS;
  // 1 corre, 2 si allunga, 3–4 respirano, 5 avanza col deambulatore, 6 cammina accompagnata, 7 carrozzina, 8 riposa, 9 carrozzina ferma
  const mv: Record<number, string> = {
    1: `translateY(${-Math.abs(Math.sin(t * 6)) * 10}px) rotate(${Math.sin(t * 6) * 2}deg)`,
    2: `rotate(${Math.sin(t * 2.4) * 3}deg)`,
    3: `scale(${1 + Math.sin(t * 2) * 0.015})`,
    4: `scale(${1 + Math.sin(t * 1.8) * 0.012})`,
    5: `translateX(${Math.sin(t * 1.6) * 6}px)`,
    6: `translateX(${Math.sin(t * 1.4) * 5}px) rotate(${Math.sin(t * 2.8) * 1}deg)`,
    7: `translateX(${Math.sin(t * 1.2) * 7}px)`,
    8: `scale(1, ${1 + Math.sin(t * 1.5) * 0.012})`,
    9: `rotate(${Math.sin(t * 1) * 0.6}deg)`,
  };
  return <div style={{ width: size, height: size * 1.25, display: "flex", alignItems: "flex-end", justifyContent: "center", opacity: s * (1 - dim * 0.6), filter: dim ? `grayscale(${dim * 0.7})` : "none", transform: `translateY(${(1 - s) * 40}px) scale(${(0.7 + s * 0.3) * (1 + on * 0.18)})`, zIndex: on ? 2 : 1 }}>
    <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 26, overflow: "hidden", boxShadow: on ? `0 0 0 ${on * 7}px ${C.B}, 0 24px 50px rgba(23,34,49,.25)` : "0 14px 36px rgba(23,34,49,.12)", background: "#fff" }}>
      <Img src={staticFile(`cfs/cfs-${n}.jpg`)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: mv[n], transformOrigin: "50% 100%" }} />
      <div style={{ position: "absolute", left: 10, top: 10, width: 44, height: 44, borderRadius: 14, background: "rgba(255,255,255,.92)", display: "grid", placeItems: "center", fontSize: 26, fontWeight: 800, color: C.ink }}>{n}</div>
    </div>
  </div>;
};

/* ---------- scene ---------- */
const C1: React.FC<{ at: number[] }> = ({ at }) => {
  const steps = [["Questionario CFS", "o direttamente le schede"], ["Scheda", "categoria e gruppo"], ["Percorso", "esami, vitamina D, terapia"]];
  return <Body>
    <Title size={96}>Frattura di femore:<br />il percorso in <Mark color={C.accent} bg={C.accentBox} delay={22}>3 passi</Mark></Title>
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {steps.map(([t, s], i) => <Rise key={t} delay={at[1] + i * 10}>
        <div style={{ display: "flex", alignItems: "center", gap: 30, background: C.box, borderRadius: 34, padding: "30px 34px", boxShadow: "0 20px 60px rgba(23,34,49,.06)" }}>
          <div style={{ width: 84, height: 84, borderRadius: "50%", background: C.accent, color: "#fff", display: "grid", placeItems: "center", fontSize: 44, fontWeight: 800, flex: "0 0 auto" }}>{i + 1}</div>
          <div><div style={{ fontSize: 46, fontWeight: 800, color: C.ink }}>{t}</div><div style={{ fontSize: 31, color: C.muted, marginTop: 4 }}>{s}</div></div>
        </div>
      </Rise>)}
    </div>
  </Body>;
};

// domande vere dell'app, dalla 1 (CFS 9) alla 4 (CFS 6)
const QS = [
  "Il paziente ha una prognosi inferiore a 6 mesi oppure è affetto da patologia in fase terminale per la quale è in carico alle cure palliative domiciliari o residenziali (Hospice)?",
  "Il paziente è totalmente dipendente per tutte le attività della vita quotidiana ed è altamente vulnerabile anche a minime variazioni dello stato clinico?",
  "Il paziente è completamente dipendente nelle attività di base della vita quotidiana (come lavarsi, vestirsi ecc.), per cause fisiche o cognitive, ma è clinicamente stabile?",
  "Il paziente necessita di assistenza per tutte le attività fuori casa, nonché per alcune attività quotidiane (es. igiene personale o vestizione)?",
];
const BTN_Y = 330, BTN_H = 52;
const Question: React.FC<{ i: number; yes?: number }> = ({ i, yes = 0 }) => (
  <Screen title="Questionario CFS" act={i ? "Ricomincia" : undefined}>
    <At y={TOP + 8}><Lbl>Domanda {i + 1} di 9</Lbl>
      <div style={{ height: 3, borderRadius: 2, background: A.line, marginTop: 8 }}><div style={{ height: 3, borderRadius: 2, background: A.accent, width: `${(i + 1) / 9 * 100}%` }} /></div>
    </At>
    <At y={TOP + 40}><div style={{ fontSize: 17, lineHeight: 1.45, color: A.ink }}>{QS[i]}</div></At>
    <At y={BTN_Y} h={BTN_H}><div style={{ display: "flex", gap: 8, height: "100%" }}>
      <div style={{ flex: 1, borderRadius: 14, background: A.accent, color: "#fff", display: "grid", placeItems: "center", fontSize: 16, fontWeight: 700, transform: `scale(${1 - Math.sin(Math.min(yes, 1) * Math.PI) * 0.05})` }}>Sì</div>
      <div style={{ flex: 1, borderRadius: 14, background: A.fill, color: A.ink, display: "grid", placeItems: "center", fontSize: 16, fontWeight: 600 }}>No</div>
    </div></At>
    <At y={BTN_Y + 84}><Lbl>Come rispondere</Lbl>
      {["Riferirsi sempre allo stato funzionale del paziente nelle 2 settimane precedenti l'evento acuto.", "Procedere con le domande in ordine fino alla prima risposta affermativa.", "In caso di dubbio tra due categorie, assegnare il livello di minor fragilità."].map((t, k) =>
        <div key={k} style={{ display: "flex", gap: 12, padding: "9px 0", borderBottom: k < 2 ? `1px solid ${A.line}` : "none", fontSize: 13.5, lineHeight: 1.45, color: A.ink }}><span style={{ color: A.muted }}>{k + 1}</span><span>{t}</span></div>)}
    </At>
  </Screen>
);

const C2: React.FC<{ at: number[] }> = ({ at }) => {
  const f = useCurrentFrame();
  // i tre No scandiscono la seconda battuta; il Sì arriva con «il primo sì», dopo che l'ultima domanda si è letta
  const t0 = at[1] + 10, yesT = at[2] + 18, STEP = Math.max(30, Math.round((yesT - 38 - t0) / 2));
  const noT = [t0, t0 + STEP, t0 + STEP * 2];
  const yes = interpolate(f, [yesT, yesT + 8], [0, 1], clamp);
  const noX = LW * 0.75, yesX = LW * 0.25, by = BTN_Y + BTN_H / 2;
  return <>
    <AppTitle>Il <Mark color={C.accent} bg={C.accentBox} delay={16}>questionario</Mark> CFS</AppTitle>
    <Phone>
      <Nav screens={[0, 1, 2, 3].map(i => ({ t: i === 0 ? 0 : noT[i - 1] + 6, el: <Question i={i} yes={i === 3 ? yes : 0} /> }))} />
      {noT.map(t => <Tap key={t} x={noX} y={by} t={t} />)}
      <Tap x={yesX} y={by} t={yesT} />
    </Phone>
    <Callout t={12} until={noT[2] + 4} side="l" y={TOP + 90}>si parte da CFS 9</Callout>
    <Callout t={noT[0] + 4} until={yesT - 4} side="r" y={by}>No → domanda successiva</Callout>
    <Callout t={yesT + 4} side="r" y={by} color={C.B}>primo Sì: CFS 6</Callout>
  </>;
};

const C3: React.FC<{ at: number[] }> = ({ at }) => {
  const f = useCurrentFrame();
  const tGroups = at[1] - 4, tSel = at[1] + 24;
  const on = interpolate(f, [tSel, tSel + 14], [0, 1], { ...clamp, easing: ease });
  const g = fade(f, tGroups, 16);
  const SIZE = 220;
  return <Body>
    <Title size={84}>Ogni categoria ha il suo <Mark color={C.B} bg={C.Bbox} delay={at[1]}>gruppo</Mark></Title>
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {(["A", "B", "C"] as const).map((k, r) => {
        const G = GROUP[k];
        return <div key={k} style={{ position: "relative", borderRadius: 36, padding: "20px 22px 20px 22px", background: `color-mix(in srgb, ${G.bg} ${g * 100}%, rgba(255,255,255,.55))`, display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 120, flex: "0 0 auto", opacity: g, transform: `translateX(${(1 - g) * -20}px)` }}>
            <div style={{ fontSize: 30, fontWeight: 700, color: G.fg, letterSpacing: 1, textTransform: "uppercase" }}>Gruppo</div>
            <div style={{ fontSize: 96, fontWeight: 800, color: G.fg, lineHeight: 0.95 }}>{k}</div>
            <div style={{ fontSize: 24, fontWeight: 600, color: G.fg, opacity: 0.8, marginTop: 6 }}>{G.range}</div>
          </div>
          <div style={{ display: "flex", gap: 14 }}>
            {G.cfs.map((n, j) => <CfsFigure key={n} n={n} size={SIZE * (k === "A" ? 0.8 : 1) * 0.92} delay={4 + (n - 1) * 5 + r * 2} on={n === 6 ? on : 0} dim={n === 6 ? 0 : on * 0.5} />)}
          </div>
        </div>;
      })}
    </div>
  </Body>;
};

/* --- la scheda del gruppo B --- */
const ACC: [string, string][] = [["Esami di laboratorio", "tube"], ["Correzione vitamina D", "pill"], ["Trattamento", "shield"]];
const ACC_Y = 548, ACC_H = 54, ES_H = 104;
const AccIcon: React.FC<{ k: string }> = ({ k }) => <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke={A.muted} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
  {k === "tube" ? <path d="M9 3h6M10 3v14a2 2 0 0 0 4 0V3M10 11h4" /> : k === "pill" ? <><rect x="3" y="8.5" width="18" height="7" rx="3.5" transform="rotate(-35 12 12)" /><path d="m9.3 8.2 5.4 7.6" /></> : <path d="M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6z" />}
</svg>;
const Scheda: React.FC<{ scroll: number; open: number; openEs?: number }> = ({ scroll, open, openEs = 0 }) => (
  <Screen title="Risultato" act="Ricomincia" scroll={scroll}>
    <At y={TOP + 8}><span style={{ display: "inline-block", fontSize: 11.2, fontWeight: 700, letterSpacing: 0.7, textTransform: "uppercase", padding: "4px 9px", borderRadius: 6, background: C.Bbox, color: C.B }}>Gruppo B</span></At>
    <At y={TOP + 38}><div style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.7, color: A.ink }}>Moderately Frail</div></At>
    <At y={TOP + 76}><div style={{ fontSize: 14.7, color: A.muted }}>CFS 6 · Moderatamente fragili</div></At>
    <At y={TOP + 112} h={210}><div style={{ display: "flex", justifyContent: "center", height: "100%" }}><Img src={staticFile("cfs/cfs-6.jpg")} style={{ height: "100%", borderRadius: 12 }} /></div></At>
    <At y={TOP + 336}><div style={{ fontSize: 14.7, lineHeight: 1.5, color: A.ink }}>Persone che necessitano di assistenza per tutte le attività all'esterno e per il mantenimento della casa. A domicilio sono parzialmente dipendenti.</div></At>
    <At y={ACC_Y - 30}><Lbl>Percorso</Lbl></At>
    {ACC.map(([t, ic], i) => <At key={t} y={ACC_Y + i * ACC_H + (i > 0 ? openEs * ES_H : 0)} h={ACC_H}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, height: "100%", fontSize: 15.5, fontWeight: 700, color: A.ink }}>
        <AccIcon k={ic} /><span style={{ flex: 1 }}>{t}</span>
        <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke={A.faint} strokeWidth={2} strokeLinecap="round" style={{ transform: `rotate(${(i === 2 ? open : i === 0 ? openEs : 0) * 90}deg)` }}><path d="m9 6 6 6-6 6" /></svg>
      </div>
    </At>)}
    <At y={ACC_Y + ACC_H} h={ES_H * openEs}><div style={{ overflow: "hidden", height: "100%", opacity: openEs }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: A.muted }}>Pannello 1</div>
      <div style={{ fontSize: 14, lineHeight: 1.5, color: A.ink, marginTop: 4 }}>Creatinina, albumina, calcemia, fosforemia, 25-OH-vitamina D, PTH, fosfatasi alcalina, protidogramma.</div>
    </div></At>
    <At y={ACC_Y + 3 * ACC_H + openEs * ES_H}><div style={{ opacity: open, transform: `translateY(${(1 - open) * -10}px)`, fontSize: 14, lineHeight: 1.5, color: A.ink, display: "flex", flexDirection: "column", gap: 8 }}>
      <div>Supplementazione di calcio/vitamina D.</div>
      <div>Terapia anti-fratturativa di prima scelta: <b>acido zoledronico 5 mg EV</b>, durante il ricovero o nel setting di destinazione.</div>
      <div>In alternativa, con controindicazioni: <b>denosumab</b>.</div>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: A.muted, marginTop: 4 }}>Zoledronato · checklist pre-somministrazione</div>
      {["Funzione renale", "Calcio e vitamina D", "Idratazione"].map((t, i) => <div key={t} style={{ display: "flex", gap: 10 }}><span style={{ color: A.muted }}>{i + 1}</span><b>{t}</b></div>)}
    </div></At>
  </Screen>
);

const SchedaTop: React.FC<{ at: number[] }> = ({ at }) => <>
  <AppTitle>Secondo: la <Mark color={C.accent} bg={C.accentBox} delay={16}>scheda</Mark></AppTitle>
  <Phone><Scheda scroll={0} open={0} /></Phone>
  <Callout t={14} side="l" y={TOP + 18} color={C.B}>Gruppo B</Callout>
  <Callout t={26} side="r" y={TOP + 60}>CFS 6 · Moderately Frail</Callout>
  <Callout t={at[1] + 6} side="l" y={TOP + 370}>descrizione</Callout>
</>;

const Percorso: React.FC<{ at: number[] }> = ({ at }) => {
  const f = useCurrentFrame();
  const S = 330, tEs = 26, tTr = Math.max(at[1] + 40, tEs + 56);
  const scroll = interpolate(f, [0, 16], [S - 120, S], { ...clamp, easing: ease });
  const openEs = interpolate(f, [tEs + 4, tEs + 16, tTr, tTr + 12], [0, 1, 1, 0], { ...clamp, easing: ease });
  const open = interpolate(f, [tTr + 4, tTr + 16], [0, 1], { ...clamp, easing: ease });
  const y = (yy: number) => yy - S;
  return <>
    <AppTitle>Terzo: il <Mark color={C.accent} bg={C.accentBox} delay={16}>percorso</Mark></AppTitle>
    <Phone>
      <Scheda scroll={scroll} open={open} openEs={openEs} />
      <Tap x={LW / 2} y={y(ACC_Y + ACC_H / 2)} t={tEs} />
      <Tap x={LW / 2} y={y(ACC_Y + 2 * ACC_H + ACC_H / 2 + ES_H)} t={tTr} />
    </Phone>
    <Callout t={tEs + 14} until={tTr} side="l" y={y(ACC_Y + ACC_H + 50)}>esami</Callout>
    <Callout t={tEs + 26} until={tTr} side="r" y={y(ACC_Y + ACC_H * 1.5 + ES_H)}>vitamina D</Callout>
    <Callout t={tTr + 20} side="r" y={y(ACC_Y + 3 * ACC_H + 50)}>acido zoledronico</Callout>
    <Callout t={tTr + 32} side="l" y={y(ACC_Y + 3 * ACC_H + 150)}>con la checklist</Callout>
  </>;
};

/* --- Charlson --- */
const AGES = ["50–59", "60–69", "70–79", "≥ 80"];
const C1P = ["Infarto miocardico pregresso", "Scompenso cardiaco congestizio", "Arteriopatia periferica", "Malattia cerebrovascolare", "Demenza"];
const C2P = ["Emiplegia", "Malattia renale moderata o severa"];
const SEG_Y = TOP + 104, ROW = 38, P1_Y = TOP + 186, P2_Y = P1_Y + 5 * ROW + 34;
const CkBox: React.FC<{ on: number }> = ({ on }) => (
  <span style={{ width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${on > 0 ? A.teal : A.faint}`, background: on > 0 ? A.teal : "transparent", display: "grid", placeItems: "center", flex: "0 0 auto" }}>
    {on > 0 && <svg viewBox="0 0 24 24" width={12} height={12} fill="none" stroke="#fff" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>}
  </span>
);
const Cci: React.FC<{ age: boolean; dem: boolean; ren: boolean }> = ({ age, dem, ren }) => (
  <Screen title="CCI" act="Azzera">
    <At y={TOP + 6}><div style={{ fontSize: 26, lineHeight: 1.1, fontWeight: 800, letterSpacing: -0.6, color: A.ink }}>Charlson Comorbidity Index</div></At>
    <At y={TOP + 72}><div style={{ fontSize: 13, color: A.muted }}>Corretto per l'età. Seleziona età e condizioni.</div></At>
    <At y={SEG_Y} h={46}><div style={{ display: "flex", gap: 3, padding: 3, borderRadius: 12, background: A.fill, height: "100%" }}>
      {AGES.map((a, i) => <div key={a} style={{ flex: 1, borderRadius: 9, display: "grid", placeItems: "center", background: age && i === 3 ? "#fff" : "transparent", boxShadow: age && i === 3 ? "0 1px 3px rgba(0,0,0,.12)" : "none", fontSize: 13, fontWeight: 600, color: age && i === 3 ? A.ink : A.muted, lineHeight: 1.1, textAlign: "center" }}>{a}<br /><span style={{ fontSize: 10 }}>+{i + 1}</span></div>)}
    </div></At>
    <At y={P1_Y - 22}><Lbl>1 punto</Lbl></At>
    {C1P.map((t, i) => <At key={t} y={P1_Y + i * ROW} h={ROW}><div style={{ display: "flex", alignItems: "center", gap: 12, height: "100%", borderBottom: `1px solid ${A.line}`, fontSize: 14.5, fontWeight: t === "Demenza" && dem ? 600 : 400, color: A.ink }}><CkBox on={t === "Demenza" && dem ? 1 : 0} />{t}</div></At>)}
    <At y={P2_Y - 22}><Lbl>2 punti</Lbl></At>
    {C2P.map((t, i) => <At key={t} y={P2_Y + i * ROW} h={ROW}><div style={{ display: "flex", alignItems: "center", gap: 12, height: "100%", borderBottom: `1px solid ${A.line}`, fontSize: 14.5, fontWeight: i === 1 && ren ? 600 : 400, color: A.ink }}><CkBox on={i === 1 && ren ? 1 : 0} />{t}</div></At>)}
  </Screen>
);

const C5: React.FC<{ at: number[] }> = ({ at }) => {
  const f = useCurrentFrame();
  const tAge = 34, tDem = tAge + 30, tRen = Math.max(at[1] + 4, tDem + 30);
  const score = (f >= tAge ? 4 : 0) + (f >= tDem ? 1 : 0) + (f >= tRen ? 2 : 0);
  const show = interpolate(f, [tAge + 2, tAge + 14], [0, 1], { ...clamp, easing: ease });
  const hi = score >= 6;
  return <>
    <AppTitle>Gruppo A: il <Mark color={C.A} bg={C.Abox} delay={16}>Charlson</Mark></AppTitle>
    <Phone>
      <Cci age={f >= tAge} dem={f >= tDem} ren={f >= tRen} />
      {f >= tAge && <Dock show={show} title={`CCI = ${score}`} sub={hi ? "≥ 6 · percorso del Gruppo B" : "< 6 · pannello completo e Bone Specialist"} />}
      <Tap x={16 + (LW - 32) * 0.875} y={SEG_Y + 23} t={tAge} />
      <Tap x={26} y={P1_Y + 4 * ROW + ROW / 2} t={tDem} />
      <Tap x={26} y={P2_Y + ROW + ROW / 2} t={tRen} />
    </Phone>
    <Callout t={tAge + 6} until={tRen} side="l" y={SEG_Y + 23}>età ≥ 80: +4</Callout>
    <Callout t={tAge + 16} until={tRen - 2} side="r" y={LH - 52} color={C.A}>sotto 6: pannello completo e Bone Specialist</Callout>
    <Callout t={tDem + 4} until={tRen + 40} side="l" y={P1_Y + 4 * ROW + ROW / 2}>+1</Callout>
    <Callout t={tRen + 4} side="l" y={P2_Y + ROW + ROW / 2}>+2</Callout>
    <Callout t={tRen + 14} side="r" y={LH - 52} color={C.B}>da 6 in su: come il gruppo B</Callout>
  </>;
};

/* --- le schede CFS aperte dalla home --- */
const SHEET_TOP = 118, SROW = 46;
const SHEET: [string, number[]][] = [["Gruppo A", [1, 2, 3, 4]], ["Gruppo B", [5, 6, 7]], ["Gruppo C", [8, 9]]];
const EN = ["", "Very Fit", "Well", "Managing Well", "Vulnerable", "Mildly Frail", "Moderately Frail", "Severely Frail", "Very Severely Frail", "Terminally Ill"];
const IT = ["", "Molto in forma", "In buona salute", "Ben compensati", "Vulnerabili", "Lievemente fragili", "Moderatamente fragili", "Fragilità severa", "Fragilità molto severa", "Terminale"];
const sheetY: Record<number, number> = {};
{ let y = SHEET_TOP + 56; for (const [, ns] of SHEET) { y += 26; for (const n of ns) { sheetY[n] = y + SROW / 2; y += SROW; } y += 4; } }
const Sheet: React.FC<{ up: number; pick: number }> = ({ up, pick }) => (
  <>
    <div style={{ position: "absolute", inset: 0, background: `rgba(15,20,28,${0.38 * up})` }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: SHEET_TOP, bottom: 0, background: "#fff", borderRadius: "22px 22px 0 0", boxShadow: "0 -6px 24px rgba(0,0,0,.14)", transform: `translateY(${(1 - up) * (LH - SHEET_TOP)}px)` }}>
      <div style={{ position: "absolute", top: 7, left: "50%", width: 36, height: 4, marginLeft: -18, borderRadius: 2, background: A.line }} />
      <div style={{ position: "absolute", top: 14, left: 0, right: 0, textAlign: "center", fontSize: 14.4, fontWeight: 600, color: A.ink, lineHeight: "30px" }}>Schede CFS</div>
      {SHEET.map(([g, ns]) => <React.Fragment key={g}>
        <div style={{ position: "absolute", left: 16, top: sheetY[ns[0]] - SROW / 2 - SHEET_TOP - 20 }}><Lbl>{g}</Lbl></div>
        {ns.map(n => <div key={n} style={{ position: "absolute", left: 10, right: 10, top: sheetY[n] - SROW / 2 - SHEET_TOP, height: SROW, display: "flex", alignItems: "center", gap: 12, padding: "0 6px", borderRadius: 10, background: n === 6 ? `rgba(158,81,27,${pick * 0.12})` : "transparent" }}>
          <Img src={staticFile(`cfs/cfs-${n}.jpg`)} style={{ width: 30, height: 38, objectFit: "cover", borderRadius: 5 }} />
          <span style={{ flex: 1 }}><b style={{ display: "block", fontSize: 14.5, fontWeight: 600, color: A.ink }}>{EN[n]}</b><span style={{ fontSize: 12, color: A.muted }}>CFS {n} · {IT[n]}</span></span>
        </div>)}
      </React.Fragment>)}
    </div>
  </>
);

const SchedeCFS: React.FC<{ at: number[] }> = ({ at }) => {
  const f = useCurrentFrame();
  const tHero = Math.max(at[1] - 8, 34), tPick = tHero + 52;
  const up = interpolate(f, [tHero + 4, tHero + 20], [0, 1], { ...clamp, easing: ease });
  const pick = interpolate(f, [tPick, tPick + 6], [0, 1], clamp);
  const heroY = TOP + 166 + 84 + 37;
  return <>
    <AppTitle>Oppure le <Mark color={C.B} bg={C.Bbox} delay={16}>schede CFS</Mark></AppTitle>
    <Phone>
      <Nav screens={[{ t: 0, el: <div style={{ position: "absolute", inset: 0 }}><Home hi={ROWS.map(() => 0)} /><Sheet up={up} pick={pick} /></div> }, { t: tPick + 10, el: <Scheda scroll={0} open={0} /> }]} />
      <Tap x={LW / 2} y={heroY} t={tHero} />
      <Tap x={LW / 2} y={sheetY[6]} t={tPick} />
    </Phone>
    <Callout t={14} until={tHero + 4} side="r" y={heroY}>categoria già nota?</Callout>
    <Callout t={tHero + 22} until={tPick + 10} side="l" y={sheetY[2]}>le 9 categorie per gruppo</Callout>
    <Callout t={tPick + 2} side="r" y={sheetY[6]} color={C.B}>CFS 6</Callout>
  </>;
};

/* --- la home: il resto da consultare --- */
const ROWS = ["Diagramma di flusso", "Charlson Comorbidity Index", "Esami", "Vitamina D", "Fonti"];
const ROWS_SUB = ["Il percorso del protocollo", "Calcolatore per il Gruppo A", "Laboratorio e imaging", "Correzione del deficit", "Protocollo e bibliografia"];
const ROW_Y = 452, ROW_H = 50;
const Home: React.FC<{ hi: number[] }> = ({ hi }) => (
  <Screen home>
    <At y={TOP + 22}><div style={{ fontSize: 29.6, lineHeight: 1.05, fontWeight: 800, letterSpacing: -0.74, color: A.ink, textTransform: "uppercase" }}>Fracture<br />Liaison Service</div></At>
    <At y={TOP + 100}><div style={{ height: 1, background: A.line }} /></At>
    <At y={TOP + 112}><div style={{ fontSize: 13.5, lineHeight: 1.45, color: A.muted }}>Frattura di femore da fragilità, secondo il Protocollo FLS dell'ULSS 6 Euganea.</div></At>
    {[["Questionario CFS", "Valuta la fragilità del paziente", C.blue], ["Schede CFS", "Le 9 categorie per gruppo", C.peach]].map(([t, s, bg], i) =>
      <At key={t} y={TOP + 166 + i * 84} h={74}><div style={{ display: "flex", alignItems: "center", gap: 12, height: "100%", borderRadius: 20, background: bg, padding: "0 14px" }}>
        <span style={{ width: 46, height: 46, borderRadius: 12, background: "#fff" }} /><span><b style={{ display: "block", fontSize: 15.5, color: A.ink }}>{t}</b><span style={{ fontSize: 12, color: "#3A4452" }}>{s}</span></span></div></At>)}
    <At y={ROW_Y - 22}><Lbl>Consulta</Lbl></At>
    {ROWS.map((t, i) => <At key={t} y={ROW_Y + i * ROW_H} h={ROW_H}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", height: "100%", borderBottom: `1px solid ${A.line}`, paddingLeft: 10, marginLeft: -10, marginRight: -10, borderRadius: 10, background: `rgba(43,88,125,${hi[i] * 0.12})` }}>
        <b style={{ fontSize: 14.5, color: A.ink, fontWeight: 600 }}>{t}</b><span style={{ fontSize: 12, color: A.muted }}>{ROWS_SUB[i]}</span>
      </div>
    </At>)}
  </Screen>
);

const C6: React.FC<{ at: number[]; frames: number }> = ({ frames }) => {
  const f = useCurrentFrame();
  const order = [0, 2, 3, 4], step = Math.round((frames - 70) / order.length);
  const ts = order.map((_, k) => 26 + k * step);
  const hi = ROWS.map((_, i) => { const k = order.indexOf(i); return k < 0 ? 0 : interpolate(f, [ts[k], ts[k] + 8, ts[k] + step], [0, 1, 0.35], clamp); });
  const labels = ["diagramma di flusso", "esami", "vitamina D", "fonti"];
  return <>
    <AppTitle>E dalla <Mark color={C.accent} bg={C.accentBox} delay={16}>home</Mark>…</AppTitle>
    <Phone><Home hi={hi} /></Phone>
    {order.map((r, k) => <Callout key={r} t={ts[k] + 2} side={k % 2 ? "r" : "l"} y={ROW_Y + r * ROW_H + ROW_H / 2}>{labels[k]}</Callout>)}
  </>;
};

const C7: React.FC = () => {
  const s = useSpring(6, 14);
  const f = useCurrentFrame();
  return <Body>
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 40, opacity: s, transform: `scale(${0.9 + s * 0.1})` }}>
      <div style={{ width: 230, height: 230, borderRadius: 56, background: C.ink, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
        <span style={{ color: "#fff", fontSize: 96, fontWeight: 800, letterSpacing: -3, lineHeight: 1 }}>OC</span>
        <span style={{ width: 108, height: 11, borderRadius: 6, background: "#7CC3BF", transform: `scaleX(${interpolate(f, [16, 32], [0, 1], { ...clamp, easing: ease })})` }} />
      </div>
      <div style={{ fontSize: 96, fontWeight: 800, letterSpacing: -3, color: C.ink }}>Osteoclick</div>
      <div style={{ fontSize: 38, lineHeight: 1.35, color: C.muted, textAlign: "center", opacity: fade(f, 22) }}>Frattura di femore da fragilità, secondo il<br />Protocollo FLS dell'ULSS 6 Euganea</div>
      <div style={{ fontSize: 30, color: C.muted, marginTop: 6, opacity: fade(f, 36) }}>Dr. Aurelio Guarnaccia</div>
    </div>
  </Body>;
};

/* ---------- montaggio ---------- */
const Scene: React.FC<{ frames: number; children: React.ReactNode }> = ({ frames, children }) => {
  const f = useCurrentFrame();
  const o = Math.min(fade(f, 0, TRANSITION), interpolate(f, [frames - TRANSITION, frames], [1, 0], clamp));
  const y = interpolate(f, [frames - TRANSITION, frames], [0, -40], clamp);
  return <AbsoluteFill style={{ opacity: o, transform: `translateY(${y}px)` }}>{children}</AbsoluteFill>;
};

const STARTS: number[] = [];
{ let from = 0; for (const s of SCENES) { STARTS.push(from); from += timing(s).frames - TRANSITION; } }
const TOTAL = STARTS[STARTS.length - 1] + timing(SCENES[SCENES.length - 1]).frames;
const END_AT = STARTS[STARTS.length - 1];

const MUSIC = 0.42, DUCK = 0.2, RAMP = 10;
const SPANS: [number, number][] = SCENES.flatMap((s, i) => timing(s).lines.map(l => [STARTS[i] + l.from, STARTS[i] + l.to] as [number, number]));
const musicVolume = (f: number) => {
  const d = Math.min(...SPANS.map(([a, b]) => f < a ? a - f : f > b ? f - b : 0));
  const out = interpolate(f, [TOTAL - 50, TOTAL - 4], [1, 0], clamp);
  return (DUCK + (MUSIC - DUCK) * Math.min(1, d / RAMP)) * out;
};

const Brand: React.FC = () => {
  const f = useCurrentFrame();
  return <div style={{ position: "absolute", top: 150, left: 90, display: "flex", alignItems: "center", gap: 22, opacity: interpolate(f, [END_AT, END_AT + 10], [1, 0], clamp) }}>
    <div style={{ width: 76, height: 76, borderRadius: 20, background: C.ink, color: C.bg, display: "grid", placeItems: "center", fontSize: 30, fontWeight: 800, letterSpacing: -1 }}>OC</div>
    <div style={{ fontSize: 38, fontWeight: 800, letterSpacing: -0.5, color: C.ink }}>Osteoclick</div>
  </div>;
};

export const Video: React.FC = () => (
  <AbsoluteFill style={{ fontFamily, color: C.ink }}>
    <Audio src={staticFile("musica/sottofondo.mp3")} volume={musicVolume} />
    <Background />
    <Brand />
    {SCENES.map((s, i) => {
      const t = timing(s);
      const at = t.lines.map(l => l.from);
      const body = { c1: <C1 at={at} />, c2: <C2 at={at} />, c3: <C3 at={at} />, c4: <SchedeCFS at={at} />, c5: <SchedaTop at={at} />, c6: <Percorso at={at} />, c7: <C5 at={at} />, c8: <C6 at={at} frames={t.frames} />, c9: <C7 /> }[s.id];
      return <Sequence key={s.id} from={STARTS[i]} durationInFrames={t.frames}>
        {t.hasAudio && <Sequence from={Math.round(LEAD * FPS)}><Audio src={staticFile(`voce/${s.id}.mp3`)} /></Sequence>}
        <Scene frames={t.frames}>{body}</Scene>
      </Sequence>;
    })}
  </AbsoluteFill>
);
