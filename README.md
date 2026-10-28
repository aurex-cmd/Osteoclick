# Osteoclick

Algoritmo decisionale Fracture Liaison Service, basato sulla Clinical Frailty Scale (CFS), per la valutazione del paziente con frattura di femore ricoverato in Ortopedia, secondo il Protocollo FLS dell'Azienda ULSS 6 Euganea.

L'app è pubblicata su GitHub Pages: `https://<username>.github.io/osteoclick/`. Interfaccia minimale: una schermata per volta, fondo bianco, home nello stile di Osteo Help (due riquadri pastello e l’elenco Consulta), carattere Manrope.

## Come si usa

- **Questionario CFS**: una domanda per schermata; il primo "Sì" porta alla scheda del risultato.
- **Schede CFS**: la card della home apre un pannello a scomparsa con le 9 categorie raggruppate per percorso (Gruppo A, B, C); tornando indietro da una scheda il pannello si riapre. Si chiude toccando fuori, con la X o trascinandolo in giù.
- **Scheda della categoria**: illustrazione, descrizione e percorso diagnostico-terapeutico in tendine (esami, imaging, vitamina D, trattamento).
- **Gruppo A**: il pulsante **Calcola** apre il calcolatore del Charlson Comorbidity Index corretto per l'età. CCI ≥ 6 → percorso del Gruppo B; CCI < 6 → pannello diagnostico completo e Bone Specialist. Una barra in basso mostra il punteggio mentre si spuntano le condizioni; il calcolatore si può ridurre e si azzera a ogni cambio di schermata.
- **Tondo «?»** nella barra della home, in alto a destra: apre un video verticale di circa un minuto, saltabile, con voce narrante (ElevenLabs, voce «Marco Romeo») e musica di sottofondo.
- Dalla home si consultano anche il diagramma di flusso del protocollo (ingrandibile con due dita), il calcolatore CCI, gli esami di laboratorio e la correzione della vitamina D; oltre alle fonti del protocollo.

## File

| File | Contenuto |
|---|---|
| `index.html` | L'intera app (HTML, CSS e JavaScript in un unico file) |
| `media/osteoclick.mp4`, `.jpg` | Video aperto dal tondo «?» (H.264/AAC, circa 8 MB) e locandina; si genera con il progetto Remotion in `video/` |
| `img/` | Illustrazioni delle 9 categorie CFS (`cfs-N.jpg` nella scheda, `cfs-N-thumb.jpg` nell'elenco) |
| `manifest.webmanifest`, `favicon.svg`, `favicon-32.png`, `apple-touch-icon-180.png`, `icon-192.png`, `icon-512.png` | Installazione come app (PWA) e icone |
| `original/` | La versione originale dell'app (vedi sotto) |
| `minimal/` | Rimando automatico alla pagina principale per chi aveva salvato il vecchio indirizzo `/minimal/` |

Unica risorsa esterna: il font Manrope da Google Fonts (senza connessione si usa il font di sistema).

## Versione originale

La prima versione di Osteoclick, con sfondo illustrato, barra di navigazione in basso e immagini incorporate nel file, resta disponibile in `original/` ed è pubblicata su `https://<username>.github.io/osteoclick/original/`. Ha gli stessi contenuti clinici, aggiornati al Protocollo FLS ULSS 6.

## Pubblicazione su GitHub Pages

**Settings → Pages → Build and deployment**: *Deploy from a branch*, branch `main`, cartella `/ (root)`. Dopo ogni modifica su `main` la pubblicazione si aggiorna in un paio di minuti.

## Installazione come app

- **iPhone/iPad (Safari)**: Condividi → Aggiungi alla schermata Home.
- **Android (Chrome)**: menu ⋮ → Installa app.

Chi aveva già installato la versione precedente vede la nuova all'apertura; per aggiornare anche icona e nome sulla schermata Home basta rimuovere l'app e aggiungerla di nuovo.
