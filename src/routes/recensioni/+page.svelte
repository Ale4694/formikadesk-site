<script>
	const TESTO_MIN = 10;
	const TESTO_MAX = 500;

	let nome = $state('');
	let attivita = $state('');
	let stelle = $state(0);
	let testo = $state('');
	let sitoWeb = $state(''); // honeypot: un umano non lo vede né lo compila

	let inviando = $state(false);
	let inviata = $state(false);
	let errore = $state('');

	async function handleSubmit(e) {
		e.preventDefault();
		errore = '';

		if (nome.trim().length < 2) {
			errore = 'Inserisci il tuo nome.';
			return;
		}
		if (!stelle) {
			errore = 'Seleziona una valutazione da 1 a 5 stelle.';
			return;
		}
		if (testo.trim().length < TESTO_MIN) {
			errore = `Scrivi qualche parola in più (minimo ${TESTO_MIN} caratteri).`;
			return;
		}
		if (testo.length > TESTO_MAX) {
			errore = `Il testo non può superare i ${TESTO_MAX} caratteri.`;
			return;
		}

		inviando = true;
		try {
			const res = await fetch('/api/recensioni', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					nome: nome.trim(),
					attivita: attivita.trim(),
					stelle,
					testo: testo.trim(),
					sito_web: sitoWeb
				})
			});

			if (!res.ok) {
				if (res.status === 429) {
					errore = 'Hai inviato troppe recensioni in poco tempo. Riprova più tardi.';
				} else {
					errore = 'Non è stato possibile inviare la recensione. Riprova.';
				}
				return;
			}

			inviata = true;
		} catch {
			errore = 'Errore di rete. Controlla la connessione e riprova.';
		} finally {
			inviando = false;
		}
	}
</script>

<svelte:head>
	<title>Lascia una recensione — FormikaDesk</title>
</svelte:head>

<!-- ================= NAV ================= -->
<header class="border-b border-line/70 bg-paper/85 backdrop-blur-md">
	<nav class="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
		<a href="/" class="flex items-center gap-2.5">
			<span class="grid h-8 w-8 place-items-center rounded-lg bg-ink text-accent">
				<svg viewBox="0 0 24 24" class="h-5 w-5" aria-hidden="true" fill="currentColor">
					<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
				</svg>
			</span>
			<span class="font-display text-lg font-semibold tracking-tight">FormikaDesk</span>
		</a>
		<a href="/" class="text-sm font-medium text-ink-soft transition-colors hover:text-ink">
			← Torna al sito
		</a>
	</nav>
</header>

<main>
	<section class="mx-auto max-w-xl px-5 py-16 sm:px-8 sm:py-24">
		{#if inviata}
			<div class="rounded-2xl border border-line bg-paper-2/50 p-8 text-center">
				<span class="eyebrow">Grazie!</span>
				<h1 class="mt-4 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
					Recensione inviata.
				</h1>
				<p class="mt-4 leading-relaxed text-ink-soft">
					Grazie per aver dedicato un minuto a FormikaDesk. La leggiamo e, se tutto è a posto, la
					pubblichiamo sul sito nei prossimi giorni.
				</p>
				<a
					href="/"
					class="mt-7 inline-flex items-center gap-1.5 rounded-full bg-accent px-6 py-3 font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-accent-deep"
				>
					Torna al sito
				</a>
			</div>
		{:else}
			<span class="eyebrow">Recensioni</span>
			<h1 class="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
				Raccontaci la tua esperienza.
			</h1>
			<p class="mt-4 leading-relaxed text-ink-soft">
				La tua recensione non viene pubblicata subito: la leggiamo prima noi e, se tutto è a
				posto, la aggiungiamo al sito.
			</p>

			<form class="mt-10 space-y-6" onsubmit={handleSubmit} novalidate>
				<div>
					<label for="nome" class="text-sm font-medium text-ink">Nome *</label>
					<input
						id="nome"
						name="nome"
						type="text"
						bind:value={nome}
						required
						minlength="2"
						maxlength="60"
						placeholder="Mario Rossi"
						class="mt-2 w-full rounded-lg border border-line bg-paper px-4 py-2.5 text-ink placeholder:text-muted focus:border-accent focus:outline-none"
					/>
				</div>

				<div>
					<label for="attivita" class="text-sm font-medium text-ink">
						Nome attività <span class="text-muted">(opzionale)</span>
					</label>
					<input
						id="attivita"
						name="attivita"
						type="text"
						bind:value={attivita}
						maxlength="80"
						placeholder="Es. Ferramenta Rossi"
						class="mt-2 w-full rounded-lg border border-line bg-paper px-4 py-2.5 text-ink placeholder:text-muted focus:border-accent focus:outline-none"
					/>
				</div>

				<fieldset>
					<legend class="text-sm font-medium text-ink">Valutazione *</legend>
					<div
						class="mt-2 flex items-center gap-1"
						role="radiogroup"
						aria-label="Valutazione da 1 a 5 stelle"
					>
						{#each [1, 2, 3, 4, 5] as n}
							<label
								class="cursor-pointer text-3xl leading-none transition-colors {n <= stelle
									? 'text-accent'
									: 'text-line'}"
							>
								<input
									type="radio"
									name="stelle"
									value={n}
									bind:group={stelle}
									required
									class="sr-only"
								/>
								<span aria-hidden="true">★</span>
							</label>
						{/each}
					</div>
				</fieldset>

				<div>
					<div class="flex items-center justify-between">
						<label for="testo" class="text-sm font-medium text-ink">Recensione *</label>
						<span class="font-mono text-xs text-muted">{testo.length}/{TESTO_MAX}</span>
					</div>
					<textarea
						id="testo"
						name="testo"
						bind:value={testo}
						required
						minlength={TESTO_MIN}
						maxlength={TESTO_MAX}
						rows="5"
						placeholder="Racconta com'è stata la tua esperienza con FormikaDesk…"
						class="mt-2 w-full resize-none rounded-lg border border-line bg-paper px-4 py-2.5 text-ink placeholder:text-muted focus:border-accent focus:outline-none"
					></textarea>
				</div>

				<!-- Honeypot anti-bot: invisibile e non raggiungibile via tastiera per un umano. -->
				<div class="hp-field" aria-hidden="true">
					<label for="sito_web">Sito web</label>
					<input
						type="text"
						id="sito_web"
						name="sito_web"
						bind:value={sitoWeb}
						tabindex="-1"
						autocomplete="off"
					/>
				</div>

				{#if errore}
					<p class="rounded-lg bg-[#e8492c]/10 px-4 py-3 text-sm text-[#e8492c]">{errore}</p>
				{/if}

				<button
					type="submit"
					disabled={inviando}
					class="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 font-medium text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-accent-deep disabled:pointer-events-none disabled:opacity-60"
				>
					{inviando ? 'Invio in corso…' : 'Invia recensione'}
				</button>
			</form>
		{/if}
	</section>
</main>

<footer class="border-t border-line">
	<div class="mx-auto max-w-6xl px-5 py-10 text-center text-sm text-muted sm:px-8">
		<span class="font-display font-semibold text-ink">FormikaDesk</span>
		<span class="text-line"> · </span>
		<span>Software gestionale fatto in Italia</span>
	</div>
</footer>

<style>
	.hp-field {
		position: absolute;
		left: -9999px;
		width: 1px;
		height: 1px;
		overflow: hidden;
	}
</style>
