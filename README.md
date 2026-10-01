# Il Senato da Silla ad Augusto (79–27 a.C.)

Infografica interattiva in italiano, realizzata per **FocusAmerica**, sulla trasformazione del Senato romano dalla dittatura di Silla al principato di Augusto, in 25 sedute.

Per ogni seduta la pagina mostra:

- l'aula del Senato in 3D (three.js), con i senatori colorati per fazione che entrano, escono e cambiano schieramento;
- una vista piana di riserva quando il 3D non è disponibile;
- un'illustrazione animata: mappe storiche, grafici o scene (il Rubicone, Alesia, Cesare e Cleopatra, le Idi di marzo, il funerale di Cesare, la morte di Cleopatra, lo scudo d'oro di Augusto);
- il testo della seduta, i protagonisti con i ritratti antichi, la composizione dell'aula e le fonti.

La pagina pubblicata è **`index.html`**: è un unico file autonomo, con immagini e illustrazioni incorporate. Accanto ci sono il favicon e l'immagine di anteprima per i social, richiamati dai meta tag Open Graph e X. Si può aprire direttamente nel browser o pubblicare con GitHub Pages.

## Struttura del repository

```
index.html            la pagina finale
og-image.png          anteprima 1200×630 per i link su X e sugli altri social
favicon.svg, favicon.ico, apple-touch-icon.png, icon-192.png
src/
  social/             favicon.svg, og.html e render.py, che rigenera anteprima e favicon
                      share.html: pulsanti di condivisione inseriti in fondo a index.html
  build.py            inserisce in index.html illustrazioni e immagini generate
  assets/             Augusto di Prima Porta, busto di Cesare, denario DICT PERPETVO (base64)
  mapgen/
    partA.mjs         proiezioni e mappe di base (Natural Earth via world-atlas)
    partB.mjs         grafici (Silla, censori, dibattito, triumvirati, voti)
    partC.mjs         motore delle mappe, confini delle province, sedute 8–25, scena di Augusto
    partD.mjs         sedute 1–14 e scene illustrate (Rubicone, Cleopatra, Alesia, funerale, morte di Cleopatra…)
    assemble.py       unisce le quattro parti nel generatore gen2.mjs
    package.json
```

I ritratti dei protagonisti sono già incorporati in `index.html` (variabile `FACES`).

## Rigenerare la pagina dai sorgenti

Servono Node.js 18 o successivo e Python 3.

```bash
cd src/mapgen
npm install
npm run build
```

Il comando assembla il generatore, produce le illustrazioni per desktop e per mobile (`viz.json`) e le inserisce in `index.html`. Testo delle sedute, dati dell'aula, stile e logica 3D si modificano direttamente in `index.html`; mappe, grafici e scene nei file `src/mapgen/part*.mjs`.

## Fonti storiche principali

Appiano, *Guerre civili*; Cesare, *La guerra gallica* e *La guerra civile*; Cassio Dione, *Storia romana*; Cicerone, *Catilinarie* ed epistolario; Plutarco, *Vite* (Cesare, Pompeo, Crasso, Catone, Cicerone, Bruto, Antonio); Sallustio, *La congiura di Catilina*; Svetonio, *Vite dei Cesari* (Cesare, Augusto); Tacito, *Annali*; *Res gestae divi Augusti*; epitomi di Livio.

Le ripartizioni dei senatori per fazione sono stime ragionate, indicate come tali nella pagina. Le scene illustrate sono ricostruzioni simboliche.

## Tecnologie

- [three.js](https://threejs.org/) r128 e OrbitControls, caricati da CDN
- d3-geo, topojson-client, topojson-simplify, polygon-clipping per le mappe
- Dati geografici [Natural Earth](https://www.naturalearthdata.com/) (pubblico dominio) tramite world-atlas
- Font Cinzel da Google Fonts

## Crediti delle immagini

Vedi [CREDITS.md](CREDITS.md).
