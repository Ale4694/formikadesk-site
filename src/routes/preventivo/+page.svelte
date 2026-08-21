<script>
	import { GESTIONALE, SITO_WEB, ASSISTENZA_PC, RECUPERO_BACKUP } from '$lib/data/preventivo-servizi.js';

	const NOME_MIN = 2;
	const NOME_MAX = 60;
	const ATTIVITA_MAX = 80;
	const ALTRO_MAX = 400;
	const NOTE_MAX = 500;
	const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	let nome = $state('');
	let telefono = $state('');
	let email = $state('');
	let attivita = $state('');

	let gestionale = $state(false);
	let sitoWeb = $state(false);
	let assistenzaPc = $state(/** @type {Record<string, boolean>} */ ({}));
	let recuperoBackup = $state(/** @type {Record<string, boolean>} */ ({}));

	let altro = $state('');
	let note = $state('');
	let cognome = $state(''); // honeypot: un umano non lo vede né lo compila

	let inviando = $state(false);
	let inviata = $state(false);
	let errore = $state('');

	function haSelezioni() {
		return (
			gestionale ||
			sitoWeb ||
			Object.values(assistenzaPc).some(Boolean) ||
			Object.values(recuperoBackup).some(Boolean) ||
			altro.trim().length > 0
		);
	}

	async function handleSubmit(e) {
		e.preventDefault();
		errore = '';

		if (nome.trim().length < NOME_MIN) {
			errore = 'Inserisci il tuo nome.';
			return;
		}
		if (!telefono.trim() && !email.trim()) {
			errore = 'Lascia almeno un telefono o un indirizzo email per poterti ricontattare.';
			return;
		}
		if (email.trim() && !EMAIL_RE.test(email.trim())) {
			errore = "L'indirizzo email non sembra valido.";
			return;
		}
		if (!haSelezioni()) {
			errore = 'Seleziona almeno un servizio, oppure descrivi la tua richiesta nel campo "Altro".';
			return;
		}

		inviando = true;
		try {
			const res = await fetch('/api/preventivo', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					nome: nome.trim(),
					telefono: telefono.trim(),
					email: email.trim(),
					attivita: attivita.trim(),
					gestionale,
					sitoWeb,
					assistenzaPc: Object.keys(assistenzaPc).filter((id) => assistenzaPc[id]),
					recuperoBackup: Object.keys(recuperoBackup).filter((id) => recuperoBackup[id]),
					altro: altro.trim(),
					note: note.trim(),
					cognome
				})
			});

			if (!res.ok) {
				if (res.status === 429) {
					errore = 'Hai inviato troppe richieste in poco tempo. Riprova più tardi.';
				} else {
					errore = 'Non è stato possibile inviare la richiesta. Riprova.';
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
	<title>Richiedi un preventivo — FormikaDesk</title>
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
	<section class="mx-auto max-w-2xl px-5 py-16 sm:px-8 sm:py-24">
		{#if inviata}
			<div class="rounded-2xl border border-line bg-paper-2/50 p-8 text-center">
				<span class="eyebrow">Grazie!</span>
				<h1 class="mt-4 font-display text-2xl font-semibold tracking-tight sm:text-3xl">
					Richiesta inviata.
				</h1>
				<p class="mt-4 leading-relaxed text-ink-soft">
					Ho ricevuto la tua richiesta con l'elenco di ciò che ti serve. Ti ricontatto il prima
					possibile per parlarne insieme.
				</p>
				<a
					href="/"
					class="mt-7 inline-flex items-center gap-1.5 rounded-full bg-accent px-6 py-3 font-medium text-white transition-all hover:-translate-y-0.5 hover:bg-accent-deep"
				>
					Torna al sito
				</a>
			</div>
		{:else}
			<span class="eyebrow">Preventivo</span>
			<h1 class="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
				Dicci cosa ti serve.
			</h1>
			<p class="mt-4 leading-relaxed text-ink-soft">
				Seleziona i servizi che ti interessano e lascia i tuoi contatti: ti ricontatto per un
				preventivo gratuito e senza impegno.
			</p>
			<a
				href="https://wa.me/393204562042"
				target="_blank"
				rel="noopener"
				class="mt-5 inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink-soft transition-all hover:-translate-y-0.5 hover:border-accent hover:text-ink"
			>
				<svg viewBox="0 0 24 24" class="h-4 w-4" fill="currentColor" aria-hidden="true">
					<path
						d="M12 2a10 10 0 0 0-8.7 14.9L2 22l5.3-1.4A10 10 0 1 0 12 2Zm5.5 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .1-1.7-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 .9-2.2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.1.1.3 0 .5l-.4.5-.3.3c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.3.1.5.1.7-.1l.8-1c.2-.2.4-.2.6-.1l1.8.9c.3.1.5.2.5.3.1.2.1.7-.1 1.2Z"
					/>
				</svg>
				Preferisci scrivere subito su WhatsApp?
			</a>

			<form class="mt-10 space-y-10" onsubmit={handleSubmit} novalidate>
				<!-- ================= CONTATTI ================= -->
				<div class="space-y-6">
					<div>
						<label for="nome" class="text-sm font-medium text-ink">Nome *</label>
						<input
							id="nome"
							name="nome"
							type="text"
							bind:value={nome}
							required
							minlength={NOME_MIN}
							maxlength={NOME_MAX}
							placeholder="Mario Rossi"
							class="mt-2 w-full rounded-lg border border-line bg-paper px-4 py-2.5 text-ink placeholder:text-muted focus:border-accent focus:outline-none"
						/>
					</div>

					<div class="grid gap-6 sm:grid-cols-2">
						<div>
							<label for="telefono" class="text-sm font-medium text-ink">Telefono</label>
							<input
								id="telefono"
								name="telefono"
								type="tel"
								bind:value={telefono}
								maxlength="30"
								placeholder="333 1234567"
								class="mt-2 w-full rounded-lg border border-line bg-paper px-4 py-2.5 text-ink placeholder:text-muted focus:border-accent focus:outline-none"
							/>
						</div>
						<div>
							<label for="email" class="text-sm font-medium text-ink">Email</label>
							<input
								id="email"
								name="email"
								type="email"
								bind:value={email}
								maxlength="120"
								placeholder="mario.rossi@email.it"
								class="mt-2 w-full rounded-lg border border-line bg-paper px-4 py-2.5 text-ink placeholder:text-muted focus:border-accent focus:outline-none"
							/>
						</div>
					</div>
					<p class="-mt-3 text-xs text-muted">Lascia almeno uno tra telefono ed email.</p>

					<div>
						<label for="attivita" class="text-sm font-medium text-ink">
							Attività / Professione <span class="text-muted">(opzionale)</span>
						</label>
						<input
							id="attivita"
							name="attivita"
							type="text"
							bind:value={attivita}
							maxlength={ATTIVITA_MAX}
							placeholder="Es. Ferramenta Rossi, insegnante, libero professionista…"
							class="mt-2 w-full rounded-lg border border-line bg-paper px-4 py-2.5 text-ink placeholder:text-muted focus:border-accent focus:outline-none"
						/>
					</div>
				</div>

				<!-- ================= GESTIONALE ================= -->
				<fieldset class="border-t border-line pt-8">
					<legend class="font-display text-lg font-semibold tracking-tight text-ink">
						Servizi
					</legend>
					<label class="mt-4 flex cursor-pointer items-start gap-3">
						<input
							type="checkbox"
							bind:checked={gestionale}
							class="mt-1 h-4 w-4 flex-none accent-accent"
						/>
						<span class="font-medium text-ink">{GESTIONALE.titolo}</span>
					</label>
					<p class="mt-2 pl-7 text-sm leading-relaxed text-muted">{GESTIONALE.descrizione}</p>
				</fieldset>

				<!-- ================= SITO WEB ================= -->
				<fieldset>
					<label class="flex cursor-pointer items-start gap-3">
						<input
							type="checkbox"
							bind:checked={sitoWeb}
							class="mt-1 h-4 w-4 flex-none accent-accent"
						/>
						<span class="font-medium text-ink">{SITO_WEB.titolo}</span>
					</label>
					<p class="mt-2 pl-7 text-sm leading-relaxed text-muted">{SITO_WEB.descrizione}</p>
				</fieldset>

				<!-- ================= ASSISTENZA PC ================= -->
				<fieldset>
					<legend class="font-medium text-ink">{ASSISTENZA_PC.titolo}</legend>
					<div class="mt-3 space-y-2.5">
						{#each ASSISTENZA_PC.voci as voce}
							<label class="flex cursor-pointer items-start gap-3">
								<input
									type="checkbox"
									bind:checked={assistenzaPc[voce.id]}
									class="mt-0.5 h-4 w-4 flex-none accent-accent"
								/>
								<span class="text-ink-soft">{voce.label}</span>
							</label>
						{/each}
					</div>
				</fieldset>

				<!-- ================= RECUPERO E BACKUP DATI ================= -->
				<fieldset>
					<legend class="font-medium text-ink">{RECUPERO_BACKUP.titolo}</legend>
					<div class="mt-3 space-y-2.5">
						{#each RECUPERO_BACKUP.voci as voce}
							<label class="flex cursor-pointer items-start gap-3">
								<input
									type="checkbox"
									bind:checked={recuperoBackup[voce.id]}
									class="mt-0.5 h-4 w-4 flex-none accent-accent"
								/>
								<span class="text-ink-soft">{voce.label}</span>
							</label>
						{/each}
					</div>
				</fieldset>

				<!-- ================= ALTRO ================= -->
				<div>
					<label for="altro" class="text-sm font-medium text-ink">
						Altro <span class="text-muted">(non trovi quello che ti serve?)</span>
					</label>
					<textarea
						id="altro"
						name="altro"
						bind:value={altro}
						maxlength={ALTRO_MAX}
						rows="3"
						placeholder="Descrivi qui la tua esigenza…"
						class="mt-2 w-full resize-none rounded-lg border border-line bg-paper px-4 py-2.5 text-ink placeholder:text-muted focus:border-accent focus:outline-none"
					></textarea>
				</div>

				<!-- ================= NOTE AGGIUNTIVE ================= -->
				<div>
					<label for="note" class="text-sm font-medium text-ink">
						Note aggiuntive <span class="text-muted">(opzionale)</span>
					</label>
					<textarea
						id="note"
						name="note"
						bind:value={note}
						maxlength={NOTE_MAX}
						rows="3"
						placeholder="Altri dettagli utili, orari in cui preferisci essere contattato…"
						class="mt-2 w-full resize-none rounded-lg border border-line bg-paper px-4 py-2.5 text-ink placeholder:text-muted focus:border-accent focus:outline-none"
					></textarea>
				</div>

				<!-- Honeypot anti-bot: invisibile e non raggiungibile via tastiera per un umano. -->
				<div class="hp-field" aria-hidden="true">
					<label for="cognome">Cognome</label>
					<input
						type="text"
						id="cognome"
						name="cognome"
						bind:value={cognome}
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
					{inviando ? 'Invio in corso…' : 'Richiedi preventivo'}
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
