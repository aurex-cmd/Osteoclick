"""Voce del video con ElevenLabs: un MP3 per scena in public/voce/ e i tempi in src/audio.json.
Stesse impostazioni del video di Osteo Help: voce «Marco Romeo», Eleven Multilingual v2, Speed 1.05,
volume normalizzato a -16 LUFS (con ffmpeg, anche quello di Remotion). I tagli delle didascalie cadono a metà della pausa
tra una battuta e la successiva, misurata dai tempi dei caratteri restituiti da ElevenLabs.
Uso: ELEVENLABS_API_KEY=... python3 tools/voce.py [c1 c2 ...]
     python3 tools/voce.py --prova 3 c2  → tre varianti (seed 1–3) in public/voce/prove/, senza toccare audio.json"""
import base64, json, os, re, shutil, subprocess, sys, urllib.parse, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VOICE_NAME = "Marco Romeo"
MODEL = "eleven_multilingual_v2"
SPEED = 1.05

# Ritocchi per singola scena. SAY: testo pronunciato al posto della didascalia (una voce per battuta);
# TUNE: impostazioni della voce diverse da quelle salvate; SEED: la variante scelta all'ascolto.
SAY = {
    # «primo sì» staccato suonava come una pausa: attaccato si legge di seguito
    "c2": ["Primo: il questionario CFS.", "Le domande partono dai gradi più gravi: ti fermi al primosì."],
}
TUNE = {
    "c4": {"stability": 0.3, "style": 0.75},  # più slancio, come le altre scene
}
SEED = {"c2": 12, "c4": 11}
KEY = os.environ.get("ELEVENLABS_API_KEY") or sys.exit("Manca ELEVENLABS_API_KEY")

def api(path, body=None):
    req = urllib.request.Request("https://api.elevenlabs.io" + path, method="POST" if body else "GET",
                                 data=json.dumps(body).encode() if body else None,
                                 headers={"xi-api-key": KEY, "Content-Type": "application/json"})
    with urllib.request.urlopen(req) as r:
        return json.load(r)

def scenes():
    # Le battute di ogni scena, da src/script.ts: { id: "c1", ... lines: [ { say: "..." }, ... ] }
    src = (ROOT / "src/script.ts").read_text()
    out = {}
    for m in re.finditer(r'\{ id: "(\w+)".*?\]\}', src, re.S):
        out[m.group(1)] = re.findall(r'say: "((?:[^"\\]|\\.)*)"', m.group(0))
    return out

def ffmpeg():
    # ffmpeg di sistema, altrimenti quello incluso in Remotion (npm ci in video/)
    if shutil.which("ffmpeg"): return ["ffmpeg"]
    remotion = ROOT / "node_modules/.bin/remotion"
    return [str(remotion), "ffmpeg"] if remotion.exists() else None

def mp3_duration(path):
    # Somma dei frame MPEG-1 Layer III (ElevenLabs: CBR 44,1 kHz)
    data = path.read_bytes(); i = 0; t = 0.0
    if data[:3] == b"ID3": i = 10 + int.from_bytes(bytes(b & 0x7F for b in data[6:10]), "big")
    rates = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320]
    srs = [44100, 48000, 32000]
    while i + 4 <= len(data):
        h = int.from_bytes(data[i:i + 4], "big")
        if h >> 21 != 0x7FF: i += 1; continue
        br = rates[(h >> 12) & 0xF] * 1000; sr = srs[(h >> 10) & 3]; pad = (h >> 9) & 1
        if not br: i += 1; continue
        i += 144 * br // sr + pad; t += 1152 / sr
    return t

def generate(voice_id, settings, lines, mp3, seed=None):
    body = {"text": " ".join(lines), "model_id": MODEL, "voice_settings": settings}
    if seed is not None: body["seed"] = seed
    r = api(f"/v1/text-to-speech/{voice_id}/with-timestamps?output_format=mp3_44100_128", body)
    mp3.write_bytes(base64.b64decode(r["audio_base64"]))
    al = r["alignment"]; starts = al["character_start_times_seconds"]; ends = al["character_end_times_seconds"]
    cuts = []; pos = 0
    for line in lines[:-1]:
        pos += len(line)  # fine della battuta (il carattere a pos è lo spazio)
        cuts.append(round((ends[pos - 1] + starts[pos + 1]) / 2, 2))
        pos += 1
    ff = ffmpeg()
    if ff:
        tmp = mp3.with_suffix(".tmp.mp3")
        subprocess.run([*ff, "-y", "-loglevel", "error", "-i", str(mp3), "-af", "loudnorm=I=-16:TP=-1.5:LRA=11",
                        "-ar", "44100", "-b:a", "128k", str(tmp)], check=True)
        tmp.replace(mp3)
    return round(mp3_duration(mp3), 2), cuts

def find_voice():
    voices = api("/v1/voices")["voices"]
    voice = next((v for v in voices if VOICE_NAME.lower() in v["name"].lower()), None)
    if not voice:
        sys.exit(f"La voce «{VOICE_NAME}» non è tra quelle del tuo account ElevenLabs: aggiungila dalla Voice Library.")
    print("Voce:", voice["name"], voice["voice_id"])
    settings = api(f"/v1/voices/{voice['voice_id']}/settings")
    settings["speed"] = SPEED
    return voice["voice_id"], settings

if __name__ == "__main__":
    args = sys.argv[1:]
    prova = int(args.pop(args.index("--prova") + 1)) if "--prova" in args else 0
    if prova: args.remove("--prova")
    all_scenes = scenes()
    wanted = args or list(all_scenes)
    voice_id, base = find_voice()
    outdir = ROOT / "public/voce"; outdir.mkdir(parents=True, exist_ok=True)
    audio_json = ROOT / "src/audio.json"
    timings = json.loads(audio_json.read_text() or "{}")

    for sid in wanted:
        lines = SAY.get(sid, all_scenes[sid])
        settings = {**base, **TUNE.get(sid, {})}
        if prova:
            (outdir / "prove").mkdir(exist_ok=True)
            for seed in range(1, prova + 1):
                dur, cuts = generate(voice_id, settings, lines, outdir / f"prove/{sid}-s{seed}.mp3", seed)
                print(f"{sid} seed {seed}: {dur}s, tagli {cuts}")
            continue
        dur, cuts = generate(voice_id, settings, lines, outdir / f"{sid}.mp3", SEED.get(sid))
        timings[sid] = {"dur": dur, "start": 0.0, "cuts": cuts}
        print(f"{sid}: {dur}s, tagli {cuts}")

    if not prova:
        audio_json.write_text(json.dumps({k: timings[k] for k in all_scenes if k in timings}, indent=1) + "\n")
    if not ffmpeg(): print("Attenzione: ffmpeg assente, volume non normalizzato a -16 LUFS.")
