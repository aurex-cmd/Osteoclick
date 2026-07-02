# Osteoclick

Algoritmo decisionale Fracture Liaison Service, basato sulla Clinical Frailty Scale (CFS), per la valutazione del paziente con frattura di femore ricoverato in Ortopedia.

App single-file, offline-capable, pensata per essere pubblicata su GitHub Pages.

## Contenuto

- `index.html` — applicazione completa (HTML/CSS/JS in un unico file, immagini incorporate in base64)
- `manifest.json` — manifest PWA
- `favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png` — icone

## Pubblicazione su GitHub Pages

1. Crea un nuovo repository (es. `osteoclick`)
2. Carica tutti i file di questa cartella nella root del repository
3. Vai su **Settings → Pages**, seleziona il branch `main` e la cartella `/root`
4. L'app sarà disponibile su `https://<username>.github.io/osteoclick/`

## Funzionalità

- **Questionario C.F.S.**: 9 domande sequenziali per determinare la categoria di fragilità clinica del paziente
- **Schede visive**: consultazione diretta delle 9 categorie CFS, raggruppate per percorso diagnostico-terapeutico
- Percorso diagnostico-terapeutico automatico in base al gruppo di fragilità (1: CFS 1–4, 2: CFS 5–7, 3: CFS 8–9)
