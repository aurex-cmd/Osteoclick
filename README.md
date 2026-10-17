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
- Percorso diagnostico-terapeutico automatico in base al gruppo di fragilità (A: CFS 1–4, B: CFS 5–7, C: CFS 8–9), secondo il Protocollo FLS dell'Azienda ULSS 6 Euganea
- **Calcolatore Charlson Comorbidity Index (CCI)** per il Gruppo A, corretto per l'età: CCI ≥ 6 → percorso del Gruppo B; CCI < 6 → pannello diagnostico completo e Bone Specialist
- Correzione del deficit di vitamina D per tutti i gruppi

## Versione minimal

La cartella `minimal/` contiene una riscrittura grafica di Osteoclick nello stile di [Osteo Help](https://github.com/aurex-cmd/Osteo-Help): stessi contenuti clinici e stessa logica, interfaccia ridotta all'essenziale (niente sfondi né illustrazioni, una schermata per volta, tema chiaro/scuro). È pubblicata su `https://<username>.github.io/osteoclick/minimal/`.

- **Questionario CFS**: una domanda per schermata; il primo "Sì" porta alla scheda del risultato.
- **Schede CFS**: la card della home apre un pannello a scomparsa con le 9 categorie raggruppate per percorso (A, B, C); tornando indietro da una scheda il pannello si riapre. Si chiude toccando fuori, con la X o trascinandolo in giù.
- **Gruppo A**: il pulsante **Calcola** apre il calcolatore del CCI; una barra in basso mostra il punteggio mentre si spuntano le condizioni.
- Dalla home si consultano anche il calcolatore CCI, gli esami di laboratorio e la correzione della vitamina D; le fonti del protocollo sono linkate in fondo alla pagina.
- Illustrazioni delle 9 categorie CFS in `minimal/img/` (`cfs-N.jpg` nella scheda, `cfs-N-thumb.jpg` nell'elenco), le stesse dell'app principale con fondo bianco.
- Unica risorsa esterna: il font Inter da Google Fonts (senza connessione si usa il font di sistema).
