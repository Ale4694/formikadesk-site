<script>
	import { onMount } from 'svelte';

	/* ============================================================== *
	 *  DA COMPILARE — sostituisci con i tuoi dati reali.
	 *  Il numero WhatsApp va in formato internazionale, solo cifre.
	 * ============================================================== */
	const WHATSAPP_NUMERO = '393204562042'; // <-- METTI IL TUO NUMERO
	const WHATSAPP_MSG = 'Ciao! Ho visto FormikaDesk e vorrei saperne di più.';
	const EMAIL = 'alessandroformica6@gmail.com'; // <-- opzionale
	const PIVA = ''; // <-- quando disponibile

	const waLink = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(WHATSAPP_MSG)}`;
	const anno = new Date().getFullYear();

	const features = [
		{
			t: 'Documenti',
			d: 'Fatture, DDT, preventivi e buoni. Numerazione automatica, stampa e PDF pronti.'
		},
		{ t: 'Magazzino', d: 'Articoli, giacenze e prezzi sempre sotto controllo.' },
		{ t: 'Report', d: 'Incassi per giorno, settimana, mese o anno. Sai sempre come va.' },
		{ t: 'Clienti', d: 'Anagrafiche complete e storico documenti a portata di clic.' },
		{ t: 'Stampe su misura', d: 'Layout dei documenti curati, pronti per la stampa e l’invio.' },
		{ t: 'Aggiornamenti', d: 'Nuove funzioni che arrivano da sole, senza interruzioni.' }
	];

	const settori = [
		{ t: 'Ricambi auto', d: 'Articoli a codice, fornitori, ricambi su misura.' },
		{ t: 'Ferramenta', d: 'Migliaia di articoli, prezzi e scorte sotto controllo.' },
		{ t: 'Librerie indipendenti', d: 'Titoli, ordini e resi gestiti senza fatica.' },
		{ t: 'E la tua attività?', d: 'Scrivici: vediamo se FormikaDesk fa al caso tuo.', open: true }
	];

	const faq = [
		{
			q: 'Funziona su Windows?',
			a: 'Sì, FormikaDesk è pensato per Windows. All’installazione e alla configurazione ci pensiamo noi.'
		},
		{
			q: 'Posso importare i miei dati attuali?',
			a: 'Sì. Migriamo i tuoi documenti e le anagrafiche dal programma che usi oggi.'
		},
		{
			q: 'Serve internet per usarlo?',
			a: 'No. Gira in locale sul tuo computer. Internet serve solo per ricevere gli aggiornamenti.'
		},
		{
			q: 'Cosa include gli 80 € al mese?',
			a: 'Tutti gli aggiornamenti, l’assistenza e le nuove funzioni. Nessun costo a sorpresa.'
		},
		{
			q: 'Dove finiscono i miei dati?',
			a: 'Restano sul tuo computer. Nessun server esterno, nessun cloud obbligatorio.'
		}
	];

	onMount(() => {
		const els = document.querySelectorAll('.reveal');
		if (!('IntersectionObserver' in window)) {
			els.forEach((el) => el.classList.add('is-visible'));
			return;
		}
		const io = new IntersectionObserver(
			(entries) => {
				for (const e of entries) {
					if (e.isIntersecting) {
						e.target.classList.add('is-visible');
						io.unobserve(e.target);
					}
				}
			},
			{ rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
		);
		els.forEach((el) => io.observe(el));
	});
</script>

<!-- ================= NAV ================= -->
<header
	class="sticky top-0 z-50 border-b border-line/70 bg-paper/85 backdrop-blur-md"
>
	<nav class="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
		<a href="#top" class="flex items-center gap-2.5">
			<span class="grid h-8 w-8 place-items-center rounded-lg bg-ink text-accent">
				<svg viewBox="0 0 24 24" class="h-5 w-5" aria-hidden="true" fill="currentColor">
					<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
				</svg>
			</span>
			<span class="font-display text-lg font-semibold tracking-tight">FormikaDesk</span>
		</a>
		<div class="hidden items-center gap-8 text-sm text-ink-soft md:flex">
			<a href="#cosa-fa" class="transition-colors hover:text-ink">Cosa fa</a>
			<a href="#in-locale" class="transition-colors hover:text-ink">In locale</a>
			<a href="#prezzo" class="transition-colors hover:text-ink">Prezzo</a>
		</div>
		<a
			href={waLink}
			target="_blank"
			rel="noopener"
			class="rounded-full bg-ink px-4 py-2 text-sm font-medium text-paper transition-transform hover:-translate-y-0.5"
		>
			Scrivici
		</a>
	</nav>
</header>

<main id="top">
	<!-- ================= HERO ================= -->
	<section class="relative overflow-hidden">
		<div
			class="pointer-events-none absolute -right-40 -top-40 h-[28rem] w-[28rem] rounded-full opacity-[0.07]"
			style="background: radial-gradient(circle, var(--color-accent), transparent 65%)"
		></div>

		<div class="mx-auto grid max-w-6xl gap-12 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:gap-8 lg:pt-24">
			<div class="rise flex flex-col justify-center">
				<span class="eyebrow">Gestionale in locale</span>
				<h1
					class="mt-5 font-display text-[2.6rem] font-semibold leading-[1.05] tracking-tight sm:text-6xl"
				>
					La tua attività,<br />gestita sul <span class="text-accent">tuo</span> computer.
				</h1>
				<p class="mt-6 max-w-md text-lg leading-relaxed text-ink-soft">
					FormikaDesk è il gestionale desktop per le piccole attività indipendenti: fatture,
					magazzino e report. I tuoi dati restano sul tuo computer — funziona anche senza internet.
				</p>
				<div class="mt-9 flex flex-wrap items-center gap-3">
					<a
						href={waLink}
						target="_blank"
						rel="noopener"
						class="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-accent-deep"
					>
						<svg viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor" aria-hidden="true">
							<path
								d="M12 2a10 10 0 0 0-8.7 14.9L2 22l5.3-1.4A10 10 0 1 0 12 2Zm5.5 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 .9-2.2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.1.1.3 0 .5l-.4.5-.3.3c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.7-.1l.8-1c.2-.2.4-.2.6-.1l1.8.9c.3.1.5.2.5.3.1.2.1.7-.1 1.2Z"
							/>
						</svg>
						Scrivici su WhatsApp
					</a>
					<a
						href="#cosa-fa"
						class="inline-flex items-center gap-1.5 rounded-full px-5 py-3.5 font-medium text-ink-soft transition-colors hover:text-ink"
					>
						Guarda cosa fa
						<span aria-hidden="true">↓</span>
					</a>
				</div>
				<p class="mt-7 font-mono text-xs text-muted">
					Nessun canone cloud nascosto · I dati restano tuoi
				</p>
			</div>

			<!-- FIRMA VISIVA: finestra dell'app ricostruita pulita -->
			<div class="rise flex items-center" style="animation-delay: 0.12s">
				<div
					class="w-full overflow-hidden rounded-xl border border-line bg-white shadow-[0_30px_60px_-30px_rgba(22,24,29,0.35)]"
				>
					<!-- barra titolo -->
					<div class="flex items-center gap-2 border-b border-line bg-paper-2 px-4 py-3">
						<span class="h-3 w-3 rounded-full bg-[#e8492c]"></span>
						<span class="h-3 w-3 rounded-full bg-[#e9c44a]"></span>
						<span class="h-3 w-3 rounded-full bg-[#56b96a]"></span>
						<span class="ml-2 font-mono text-xs text-muted">FormikaDesk — Anelli Ricambi</span>
						<span
							class="ml-auto inline-flex items-center gap-1.5 rounded-full bg-[#56b96a]/12 px-2.5 py-1 font-mono text-[0.65rem] font-bold text-[#3a8f4e]"
						>
							<span class="h-1.5 w-1.5 rounded-full bg-[#56b96a]"></span>
							IN LOCALE
						</span>
					</div>
					<div class="grid grid-cols-[auto_1fr]">
						<!-- sidebar -->
						<aside class="hidden border-r border-line bg-paper px-3 py-4 text-sm sm:block">
							{#each ['Documenti', 'Magazzino', 'Clienti', 'Report'] as v, i}
								<div
									class="mb-1 rounded-lg px-3 py-2 {i === 0
										? 'bg-ink font-medium text-paper'
										: 'text-ink-soft'}"
								>
									{v}
								</div>
							{/each}
						</aside>
						<!-- tabella documenti -->
						<div class="p-4">
							<div class="mb-3 flex items-center justify-between">
								<span class="font-display text-sm font-semibold">Documenti</span>
								<span class="font-mono text-xs text-muted">Giugno 2026</span>
							</div>
							<table class="w-full border-collapse text-left text-[0.8rem]">
								<thead>
									<tr class="text-muted">
										<th class="pb-2 font-mono text-[0.65rem] font-normal uppercase tracking-wider">N.</th>
										<th class="pb-2 font-mono text-[0.65rem] font-normal uppercase tracking-wider">Tipo</th>
										<th class="pb-2 font-mono text-[0.65rem] font-normal uppercase tracking-wider">Cliente</th>
										<th class="pb-2 text-right font-mono text-[0.65rem] font-normal uppercase tracking-wider">Totale</th>
									</tr>
								</thead>
								<tbody class="font-medium">
									{#each [['18', 'Fattura', 'Officina Lo Verde', '€ 412,00'], ['17', 'DDT', 'Autodemolizioni Sud', '€ 96,50'], ['16', 'Fattura', 'Garage Conti', '€ 1.230,00'], ['7', 'Preventivo', 'Privato', '€ 84,00'], ['8', 'Buono', 'Cassa', '€ 22,00']] as r}
										<tr class="border-t border-line/70">
											<td class="py-2.5 font-mono text-muted">{r[0]}</td>
											<td class="py-2.5">{r[1]}</td>
											<td class="py-2.5 text-ink-soft">{r[2]}</td>
											<td class="py-2.5 text-right tabular-nums">{r[3]}</td>
										</tr>
									{/each}
								</tbody>
							</table>
							<div
								class="mt-3 flex items-center justify-between border-t border-line pt-3 text-[0.8rem]"
							>
								<span class="font-mono text-xs text-muted">Totale periodo</span>
								<span class="font-display font-semibold tabular-nums">€ 1.844,50</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- ================= IL PROBLEMA ================= -->
	<section class="border-y border-line bg-paper-2/60">
		<div class="mx-auto max-w-6xl px-5 py-20 sm:px-8">
			<div class="reveal max-w-2xl">
				<span class="eyebrow">Il problema</span>
				<h2 class="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
					I gestionali per le piccole attività sono o troppo cari o troppo vecchi.
				</h2>
			</div>
			<div class="mt-12 grid gap-5 md:grid-cols-3">
				<div class="reveal rounded-2xl border border-line bg-paper p-7">
					<span class="font-mono text-xs text-muted">Gestionali in cloud</span>
					<p class="mt-3 leading-relaxed text-ink-soft">
						Canoni mensili che crescono, e se salta internet ti fermi. I tuoi dati finiscono sui
						server di qualcun altro.
					</p>
				</div>
				<div class="reveal rounded-2xl border border-line bg-paper p-7">
					<span class="font-mono text-xs text-muted">Software vecchi</span>
					<p class="mt-3 leading-relaxed text-ink-soft">
						Programmi ereditati dagli anni ’90, lenti e cervellotici. Nessuno li aggiorna più e
						l’assistenza è sparita.
					</p>
				</div>
				<div class="reveal rounded-2xl border-2 border-accent bg-paper p-7">
					<span class="font-mono text-xs font-bold text-accent">FormikaDesk</span>
					<p class="mt-3 leading-relaxed text-ink">
						Veloce e moderno, gira sul tuo PC. Prezzo chiaro, aggiornamenti continui, dati sempre
						tuoi.
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- ================= COSA FA ================= -->
	<section id="cosa-fa" class="scroll-mt-20">
		<div class="mx-auto max-w-6xl px-5 py-20 sm:px-8">
			<div class="reveal max-w-2xl">
				<span class="eyebrow">Cosa fa</span>
				<h2 class="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
					Tutto quello che serve per gestire documenti e magazzino.
				</h2>
			</div>
			<div class="mt-12 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
				{#each features as f}
					<div class="reveal bg-paper p-7">
						<h3 class="font-display text-lg font-semibold">{f.t}</h3>
						<p class="mt-2 leading-relaxed text-ink-soft">{f.d}</p>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- ================= PERCHÉ IN LOCALE (pannello scuro) ================= -->
	<section id="in-locale" class="scroll-mt-20 bg-night text-paper">
		<div class="mx-auto max-w-6xl px-5 py-24 sm:px-8">
			<div class="reveal max-w-2xl">
				<span class="eyebrow">Perché in locale</span>
				<h2 class="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
					I tuoi dati restano a casa tua.
				</h2>
				<p class="mt-5 text-lg leading-relaxed text-paper/70">
					“In locale” vuol dire che il programma gira sul tuo computer, non su un server lontano. È
					la differenza tra possedere e affittare.
				</p>
			</div>
			<div class="mt-14 grid gap-10 md:grid-cols-3">
				<div class="reveal">
					<div class="font-mono text-sm text-accent">→ Funziona offline</div>
					<p class="mt-3 leading-relaxed text-paper/65">
						Niente internet? Lavori lo stesso. Il programma non dipende da una connessione per farti
						emettere una fattura.
					</p>
				</div>
				<div class="reveal">
					<div class="font-mono text-sm text-accent">→ Nessun canone nascosto</div>
					<p class="mt-3 leading-relaxed text-paper/65">
						Paghi il software, non l’affitto di un server. Il prezzo è quello che leggi qui sotto,
						sempre.
					</p>
				</div>
				<div class="reveal">
					<div class="font-mono text-sm text-accent">→ Dati di tua proprietà</div>
					<p class="mt-3 leading-relaxed text-paper/65">
						Fatture e clienti stanno sul tuo PC. Fai il backup quando vuoi, come vuoi, senza chiedere
						permesso a nessuno.
					</p>
				</div>
			</div>
		</div>
	</section>

	<!-- ================= PER CHI È ================= -->
	<section>
		<div class="mx-auto max-w-6xl px-5 py-20 sm:px-8">
			<div class="reveal max-w-2xl">
				<span class="eyebrow">Per chi è</span>
				<h2 class="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
					Pensato per le piccole attività indipendenti.
				</h2>
			</div>
			<div class="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
				{#each settori as s}
					<div
						class="reveal flex min-h-[120px] flex-col justify-between rounded-2xl border p-6 {s.open
							? 'border-accent bg-accent text-white'
							: 'border-line bg-paper-2/50'}"
					>
						<span class="font-display text-xl font-semibold leading-tight">{s.t}</span>
						<span class="text-sm leading-relaxed {s.open ? 'text-white/85' : 'text-muted'}"
							>{s.d}</span
						>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- ================= PREZZO ================= -->
	<section id="prezzo" class="scroll-mt-20 border-y border-line bg-paper-2/60">
		<div class="mx-auto max-w-6xl px-5 py-20 sm:px-8">
			<div class="reveal mx-auto max-w-xl text-center">
				<span class="eyebrow">Prezzo</span>
				<h2 class="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
					Un prezzo chiaro, senza sorprese.
				</h2>
			</div>
			<div class="reveal mx-auto mt-12 max-w-2xl overflow-hidden rounded-3xl border border-line bg-paper">
				<div class="grid sm:grid-cols-3">
					<div class="border-b border-line p-8 sm:border-b-0 sm:border-r">
						<span class="font-mono text-xs text-muted">Attivazione</span>
						<div class="mt-2 font-sans text-4xl font-semibold tracking-tight tabular-nums">€ 600</div>
						<span class="text-sm text-muted">una tantum</span>
						<p class="mt-4 text-sm leading-relaxed text-ink-soft">
							Installazione, configurazione e migrazione dei dati dal tuo programma attuale.
						</p>
					</div>
					<div class="border-b border-line p-8 sm:border-b-0 sm:border-r">
						<span class="font-mono text-xs text-muted">Abbonamento</span>
						<div class="mt-2 font-sans text-4xl font-semibold tracking-tight tabular-nums">€ 80</div>
						<span class="text-sm text-muted">al mese</span>
						<p class="mt-4 text-sm leading-relaxed text-ink-soft">
							Aggiornamenti, assistenza e nuove funzioni. Tutto incluso, nessun extra.
						</p>
					</div>
					<div class="p-8">
						<span class="font-mono text-xs text-muted">Con PC incluso</span>
						<div class="mt-2 font-sans text-4xl font-semibold tracking-tight tabular-nums">€ 100</div>
						<span class="text-sm text-muted">al mese</span>
						<p class="mt-4 text-sm leading-relaxed text-ink-soft">
							PC Windows preconfigurato con FormikaDesk già installato. Pronto all'uso dal primo giorno.
						</p>
					</div>
				</div>
				<div class="border-t border-line bg-paper-2/60 p-6 text-center">
					<a
						href="https://wa.me/393204562042"
						target="_blank"
						rel="noopener"
						class="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-accent-deep"
					>
						Chiedi un preventivo su WhatsApp
					</a>
				</div>
			</div>
		</div>
	</section>

	<!-- ================= TESTIMONIANZA ================= -->
	<!-- DA APPROVARE: sostituisci con una frase reale e autorizzata da Valentina Anelli. -->
	<section>
		<div class="mx-auto max-w-4xl px-5 py-20 sm:px-8">
			<figure class="reveal text-center">
				<blockquote class="font-display text-2xl font-medium leading-snug tracking-tight sm:text-3xl">
					“Prima passavo le sere a sistemare i documenti. Ora è tutto in ordine, sul mio computer, e
					all’assistenza rispondono subito.”
				</blockquote>
				<figcaption class="mt-6 text-sm text-muted">
					<span class="font-medium text-ink">Valentina Anelli</span> — Anelli Ricambi, Casteltermini
					(AG)
				</figcaption>
			</figure>
		</div>
	</section>

	<!-- ================= FAQ ================= -->
	<section class="border-t border-line bg-paper-2/40">
		<div class="mx-auto max-w-3xl px-5 py-20 sm:px-8">
			<div class="reveal">
				<span class="eyebrow">Domande frequenti</span>
				<h2 class="mt-4 font-display text-3xl font-semibold tracking-tight">
					Le risposte rapide.
				</h2>
			</div>
			<div class="reveal mt-10 divide-y divide-line border-y border-line">
				{#each faq as item}
					<details class="group py-4">
						<summary
							class="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-medium"
						>
							{item.q}
							<span
								class="grid h-7 w-7 flex-none place-items-center rounded-full border border-line text-muted transition-transform group-open:rotate-45"
								aria-hidden="true">+</span
							>
						</summary>
						<p class="mt-3 max-w-xl leading-relaxed text-ink-soft">{item.a}</p>
					</details>
				{/each}
			</div>
		</div>
	</section>

	<!-- ================= CTA FINALE ================= -->
	<section class="bg-night text-paper">
		<div class="mx-auto max-w-4xl px-5 py-24 text-center sm:px-8">
			<h2 class="reveal font-display text-4xl font-semibold tracking-tight sm:text-5xl">
				Vediamo se fa per te.
			</h2>
			<p class="reveal mx-auto mt-5 max-w-lg text-lg leading-relaxed text-paper/70">
				Scrivici su WhatsApp: ti rispondiamo noi, ti mostriamo il programma e capiamo insieme se è
				quello che serve alla tua attività.
			</p>
			<div class="reveal mt-9">
				<a
					href={waLink}
					target="_blank"
					rel="noopener"
					class="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-4 text-lg font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-accent-deep"
				>
					<svg viewBox="0 0 24 24" class="h-5 w-5" fill="currentColor" aria-hidden="true">
						<path
							d="M12 2a10 10 0 0 0-8.7 14.9L2 22l5.3-1.4A10 10 0 1 0 12 2Zm5.5 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 .9-2.2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.1.1.3 0 .5l-.4.5-.3.3c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.7-.1l.8-1c.2-.2.4-.2.6-.1l1.8.9c.3.1.5.2.5.3.1.2.1.7-.1 1.2Z"
						/>
					</svg>
					Scrivici su WhatsApp
				</a>
			</div>
		</div>
	</section>
</main>

<!-- ================= FOOTER ================= -->
<footer class="border-t border-line">
	<div
		class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-10 text-sm text-muted sm:flex-row sm:px-8"
	>
		<div class="flex items-center gap-2">
			<span class="font-display font-semibold text-ink">FormikaDesk</span>
			<span class="text-line">·</span>
			<span>Software gestionale fatto in Italia</span>
		</div>
		<div class="flex items-center gap-5">
			<a href="mailto:{EMAIL}" class="transition-colors hover:text-ink">{EMAIL}</a>
			<span>© {anno}</span>
		</div>
	</div>
	<div class="mx-auto max-w-6xl px-5 pb-8 text-xs text-line sm:px-8">{PIVA}</div>
</footer>
