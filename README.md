# FormikaDesk — sito vetrina

Landing page statica di FormikaDesk, costruita con **SvelteKit + Tailwind CSS v4**,
prerenderizzata (`adapter-static`) e pronta per il deploy su `formikadesk.it`.

CTA unico: contatto diretto su **WhatsApp**.

## Avvio in locale

```bash
npm install
npm run dev      # http://localhost:5173
```

## Build di produzione

```bash
npm run build    # genera la cartella ./build (HTML statico)
npm run preview  # anteprima della build
```

## ⚠️ Da compilare prima di pubblicare

Tutto in `src/routes/+page.svelte`, in cima allo `<script>`:

| Costante          | Cosa mettere                                              |
| ----------------- | -------------------------------------------------------- |
| `WHATSAPP_NUMERO` | Il tuo numero in formato internazionale, **solo cifre** (es. `39333…`) |
| `WHATSAPP_MSG`    | Il messaggio precompilato (già pronto, modificabile)     |
| `EMAIL`           | Email di contatto nel footer (opzionale)                 |
| `PIVA`            | Partita IVA nel footer, quando disponibile               |

Altre due cose da sistemare nel markup:

- **Testimonianza** (sezione con commento `DA APPROVARE`): sostituisci la frase con
  una **dichiarazione reale e autorizzata** da Valentina Anelli prima di pubblicarla.
- **Screenshot reali**: la finestra dell'app nell'hero è ricostruita in HTML/CSS. Se
  vuoi, si può sostituire con uno screenshot vero del gestionale di Valentina.

## Deploy su Cloudflare Pages (consigliato)

1. Push del repo su GitHub.
2. Cloudflare → Pages → Connect to Git → seleziona il repo.
3. Build command: `npm run build` · Output directory: `build`.
4. In **Custom domains** aggiungi `formikadesk.it` e segui le istruzioni DNS.

Stesso schema su **Netlify** (publish dir `build`) o **GitHub Pages**
(in quel caso serve `@sveltejs/adapter-static` con `paths.base` se non sei sul dominio root).

## Identità visiva

- **Display/titoli**: Space Grotesk · **Label/dati**: Space Mono · **Corpo**: Inter
- **Accento**: rosso "Formica rufa" `#E8492C`, usato con parsimonia
- **Firma**: la finestra dell'app nell'hero + il pill verde **IN LOCALE**, che
  trasforma l'offline da limite in argomento di vendita

I token (colori, font) sono in `src/app.css`, blocco `@theme`.
