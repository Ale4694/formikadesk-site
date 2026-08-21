/**
 * Worker entry point per formikadesk-site (Workers-with-assets, no adapter-cloudflare).
 *
 * Deploy gestito da Cloudflare Workers Builds (Git integration su master),
 * configurata il 2026-08-19: da ora ogni push su master fa deploy automatico.
 *
 * Il sito è interamente statico (SvelteKit adapter-static → build/), servito
 * tramite il binding "assets" configurato in wrangler.jsonc. Questo script
 * viene invocato SOLO per le richieste che non combaciano con nessun asset
 * statico — in pratica: POST /api/recensioni, POST /api/preventivo, più
 * fallback su env.ASSETS.fetch per qualunque altro path non trovato (così
 * Cloudflare applica comunque la sua gestione di trailing slash / 404 sugli
 * asset).
 *
 * Riceve una recensione dal form pubblico (src/routes/recensioni/+page.svelte)
 * o una richiesta di preventivo dal configuratore (src/routes/preventivo/+page.svelte),
 * le valida, applica un rate limit basico per IP e invia una notifica email
 * via Resend. NON pubblica né salva nulla: per le recensioni, la pubblicazione
 * avviene sempre a mano, tramite commit su src/lib/data/reviews.json dopo
 * revisione; per i preventivi non c'è alcuna azione automatica oltre alla
 * notifica email — è solo un lead.
 *
 * Variabili d'ambiente richieste (Cloudflare dashboard → Settings → Variables and Secrets):
 *   RESEND_API_KEY   — API key di Resend (secret)
 *   NOTIFY_EMAIL     — indirizzo a cui inviare la notifica (dichiarato in wrangler.jsonc)
 *
 * Binding richiesto (dichiarato in wrangler.jsonc):
 *   RECENSIONI_KV    — namespace KV condiviso, usato per il rate limit per IP
 *                       sia di /api/recensioni che di /api/preventivo (chiavi
 *                       con prefisso diverso, così i due contatori restano
 *                       indipendenti pur condividendo il namespace)
 *   ASSETS           — binding verso la cartella build/ (statico)
 */

import {
	GESTIONALE,
	SITO_WEB,
	ASSISTENZA_PC,
	RECUPERO_BACKUP
} from '../src/lib/data/preventivo-servizi.js';

const RATE_LIMIT_WINDOW_SECONDS = 600; // 10 minuti
const RATE_LIMIT_MAX_REQUESTS = 3; // max invii per IP nella finestra

const NOME_MIN = 2;
const NOME_MAX = 60;
const ATTIVITA_MAX = 80;
const TESTO_MIN = 10;
const TESTO_MAX = 500;

const TELEFONO_MAX = 30;
const EMAIL_MAX = 120;
const ALTRO_MAX = 400;
const NOTE_MAX = 500;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DEFAULT_NOTIFY_EMAIL = 'alessandroformica6@gmail.com';

function jsonResponse(payload: unknown, status = 200): Response {
	return new Response(JSON.stringify(payload), {
		status,
		headers: { 'Content-Type': 'application/json' }
	});
}

function escapeHtml(str: string): string {
	return str.replace(/[&<>"']/g, (c) =>
		({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string
	);
}

interface ParsedReview {
	nome: string;
	attivita: string;
	stelle: number;
	testo: string;
}

function validatePayload(body: any): { valid: boolean; data: ParsedReview } {
	const nome = typeof body?.nome === 'string' ? body.nome.trim() : '';
	const attivita = typeof body?.attivita === 'string' ? body.attivita.trim() : '';
	const stelle = Number(body?.stelle);
	const testo = typeof body?.testo === 'string' ? body.testo.trim() : '';

	const valid =
		nome.length >= NOME_MIN &&
		nome.length <= NOME_MAX &&
		attivita.length <= ATTIVITA_MAX &&
		Number.isInteger(stelle) &&
		stelle >= 1 &&
		stelle <= 5 &&
		testo.length >= TESTO_MIN &&
		testo.length <= TESTO_MAX;

	return { valid, data: { nome, attivita, stelle, testo } };
}

/**
 * Rate limit basico per IP, con contatore separato per endpoint (`bucket`) così
 * l'invio di una recensione non consuma anche il margine per una richiesta di
 * preventivo, pur condividendo lo stesso namespace KV. Non atomico
 * (read-then-write su KV), quindi non è una garanzia stretta sotto race
 * condition — ma è sufficiente a scoraggiare spam automatico banale, che è
 * l'obiettivo qui.
 */
async function checkRateLimit(kv: KVNamespace, bucket: string, ip: string): Promise<boolean> {
	const key = `ratelimit:${bucket}:${ip}`;
	const raw = await kv.get(key);
	const count = raw ? parseInt(raw, 10) : 0;

	if (count >= RATE_LIMIT_MAX_REQUESTS) return false;

	await kv.put(key, String(count + 1), { expirationTtl: RATE_LIMIT_WINDOW_SECONDS });
	return true;
}

async function sendNotificationEmail(
	env: Env,
	review: ParsedReview,
	meta: { ip: string; ts: string }
): Promise<void> {
	const to = env.NOTIFY_EMAIL || DEFAULT_NOTIFY_EMAIL;
	const stelleStr = '★'.repeat(review.stelle) + '☆'.repeat(5 - review.stelle);

	const html = `
		<h2>Nuova recensione ricevuta</h2>
		<p><strong>Nome:</strong> ${escapeHtml(review.nome)}</p>
		<p><strong>Attività:</strong> ${review.attivita ? escapeHtml(review.attivita) : '<em>non indicata</em>'}</p>
		<p><strong>Valutazione:</strong> ${stelleStr} (${review.stelle}/5)</p>
		<p><strong>Testo:</strong></p>
		<blockquote style="margin:0;padding-left:12px;border-left:3px solid #185FA5;">
			${escapeHtml(review.testo).replace(/\n/g, '<br />')}
		</blockquote>
		<hr />
		<p style="color:#6b6f78;font-size:12px;">
			IP: ${escapeHtml(meta.ip)} · Ricevuta il ${escapeHtml(meta.ts)}<br />
			Questa recensione NON è stata pubblicata automaticamente. Per pubblicarla,
			aggiungila a mano a <code>src/lib/data/reviews.json</code> e fai il commit.
		</p>
	`;

	const res = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${env.RESEND_API_KEY}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			from: 'FormikaDesk <onboarding@resend.dev>',
			to: [to],
			subject: `Nuova recensione da ${review.nome} (${review.stelle}★)`,
			html
		})
	});

	if (!res.ok) {
		const errText = await res.text().catch(() => '');
		throw new Error(`Resend error ${res.status}: ${errText}`);
	}
}

interface ParsedPreventivo {
	nome: string;
	telefono: string;
	email: string;
	attivita: string;
	gestionale: boolean;
	sitoWeb: boolean;
	assistenzaPc: string[];
	recuperoBackup: string[];
	altro: string;
	note: string;
}

const ASSISTENZA_PC_LABELS = new Map(ASSISTENZA_PC.voci.map((v: { id: string; label: string }) => [v.id, v.label]));
const RECUPERO_BACKUP_LABELS = new Map(
	RECUPERO_BACKUP.voci.map((v: { id: string; label: string }) => [v.id, v.label])
);

function sanitizeIds(input: unknown, validLabels: Map<string, string>): string[] {
	if (!Array.isArray(input)) return [];
	const seen = new Set<string>();
	for (const item of input) {
		if (typeof item === 'string' && validLabels.has(item)) seen.add(item);
	}
	return [...seen];
}

function validatePreventivoPayload(body: any): { valid: boolean; data: ParsedPreventivo } {
	const nome = typeof body?.nome === 'string' ? body.nome.trim() : '';
	const telefono = typeof body?.telefono === 'string' ? body.telefono.trim() : '';
	const email = typeof body?.email === 'string' ? body.email.trim() : '';
	const attivita = typeof body?.attivita === 'string' ? body.attivita.trim() : '';
	const gestionale = body?.gestionale === true;
	const sitoWeb = body?.sitoWeb === true;
	const assistenzaPc = sanitizeIds(body?.assistenzaPc, ASSISTENZA_PC_LABELS);
	const recuperoBackup = sanitizeIds(body?.recuperoBackup, RECUPERO_BACKUP_LABELS);
	const altro = typeof body?.altro === 'string' ? body.altro.trim() : '';
	const note = typeof body?.note === 'string' ? body.note.trim() : '';

	const haContatto = telefono.length > 0 || email.length > 0;
	const haSelezione =
		gestionale || sitoWeb || assistenzaPc.length > 0 || recuperoBackup.length > 0 || altro.length > 0;

	const valid =
		nome.length >= NOME_MIN &&
		nome.length <= NOME_MAX &&
		telefono.length <= TELEFONO_MAX &&
		email.length <= EMAIL_MAX &&
		(email.length === 0 || EMAIL_RE.test(email)) &&
		attivita.length <= ATTIVITA_MAX &&
		altro.length <= ALTRO_MAX &&
		note.length <= NOTE_MAX &&
		haContatto &&
		haSelezione;

	return {
		valid,
		data: { nome, telefono, email, attivita, gestionale, sitoWeb, assistenzaPc, recuperoBackup, altro, note }
	};
}

function buildServiziHtml(data: ParsedPreventivo): string {
	const blocchi: string[] = [];

	if (data.gestionale) {
		blocchi.push(
			`<li><strong>${escapeHtml(GESTIONALE.titolo)}</strong><br /><span style="color:#6b6f78;font-size:13px;">${escapeHtml(GESTIONALE.descrizione)}</span></li>`
		);
	}
	if (data.sitoWeb) {
		blocchi.push(
			`<li><strong>${escapeHtml(SITO_WEB.titolo)}</strong><br /><span style="color:#6b6f78;font-size:13px;">${escapeHtml(SITO_WEB.descrizione)}</span></li>`
		);
	}
	if (data.assistenzaPc.length > 0) {
		const voci = data.assistenzaPc
			.map((id) => `<li>${escapeHtml(ASSISTENZA_PC_LABELS.get(id) || id)}</li>`)
			.join('');
		blocchi.push(
			`<li><strong>${escapeHtml(ASSISTENZA_PC.titolo)}</strong><ul>${voci}</ul></li>`
		);
	}
	if (data.recuperoBackup.length > 0) {
		const voci = data.recuperoBackup
			.map((id) => `<li>${escapeHtml(RECUPERO_BACKUP_LABELS.get(id) || id)}</li>`)
			.join('');
		blocchi.push(
			`<li><strong>${escapeHtml(RECUPERO_BACKUP.titolo)}</strong><ul>${voci}</ul></li>`
		);
	}

	if (blocchi.length === 0) return '<p><em>Nessun servizio dal catalogo selezionato.</em></p>';
	return `<ul>${blocchi.join('')}</ul>`;
}

async function sendPreventivoNotificationEmail(
	env: Env,
	data: ParsedPreventivo,
	meta: { ip: string; ts: string }
): Promise<void> {
	const to = env.NOTIFY_EMAIL || DEFAULT_NOTIFY_EMAIL;

	const html = `
		<h2>Nuova richiesta di preventivo</h2>
		<p><strong>Nome:</strong> ${escapeHtml(data.nome)}</p>
		<p><strong>Telefono:</strong> ${data.telefono ? escapeHtml(data.telefono) : '<em>non indicato</em>'}</p>
		<p><strong>Email:</strong> ${data.email ? escapeHtml(data.email) : '<em>non indicata</em>'}</p>
		<p><strong>Attività / Professione:</strong> ${data.attivita ? escapeHtml(data.attivita) : '<em>non indicata</em>'}</p>
		<h3>Servizi richiesti</h3>
		${buildServiziHtml(data)}
		${
			data.altro
				? `<p><strong>Altro:</strong></p><blockquote style="margin:0;padding-left:12px;border-left:3px solid #185FA5;">${escapeHtml(data.altro).replace(/\n/g, '<br />')}</blockquote>`
				: ''
		}
		${
			data.note
				? `<p><strong>Note aggiuntive:</strong></p><blockquote style="margin:0;padding-left:12px;border-left:3px solid #185FA5;">${escapeHtml(data.note).replace(/\n/g, '<br />')}</blockquote>`
				: ''
		}
		<hr />
		<p style="color:#6b6f78;font-size:12px;">
			IP: ${escapeHtml(meta.ip)} · Ricevuta il ${escapeHtml(meta.ts)}<br />
			Questa richiesta NON attiva alcuna azione automatica: è solo una notifica via email.
		</p>
	`;

	const res = await fetch('https://api.resend.com/emails', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${env.RESEND_API_KEY}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			from: 'FormikaDesk <onboarding@resend.dev>',
			to: [to],
			subject: `Richiesta di preventivo da ${data.nome}`,
			html
		})
	});

	if (!res.ok) {
		const errText = await res.text().catch(() => '');
		throw new Error(`Resend error ${res.status}: ${errText}`);
	}
}

async function handlePreventivo(request: Request, env: Env): Promise<Response> {
	let body: any;
	try {
		body = await request.json();
	} catch {
		return jsonResponse({ ok: false, error: 'invalid_json' }, 400);
	}

	// Honeypot: campo nascosto via CSS nel form pubblico ("Cognome", un campo
	// plausibile ma non presente nel form reale). Se è valorizzato è quasi
	// certamente un bot: rispondiamo "ok" senza inviare email né consumare il
	// rate limit, per non dargli alcun segnale utile.
	if (typeof body?.cognome === 'string' && body.cognome.trim() !== '') {
		return jsonResponse({ ok: true });
	}

	const { valid, data } = validatePreventivoPayload(body);
	if (!valid) {
		return jsonResponse({ ok: false, error: 'validation' }, 400);
	}

	const ip = request.headers.get('CF-Connecting-IP') || 'unknown';

	if (env.RECENSIONI_KV) {
		const allowed = await checkRateLimit(env.RECENSIONI_KV, 'preventivo', ip);
		if (!allowed) {
			return jsonResponse({ ok: false, error: 'rate_limited' }, 429);
		}
	}

	try {
		await sendPreventivoNotificationEmail(env, data, { ip, ts: new Date().toISOString() });
	} catch (err) {
		console.error('Errore invio email preventivo:', err);
		return jsonResponse({ ok: false, error: 'email_failed' }, 502);
	}

	return jsonResponse({ ok: true });
}

async function handleRecensioni(request: Request, env: Env): Promise<Response> {
	let body: any;
	try {
		body = await request.json();
	} catch {
		return jsonResponse({ ok: false, error: 'invalid_json' }, 400);
	}

	// Honeypot: campo nascosto via CSS nel form pubblico. Se è valorizzato,
	// è quasi certamente un bot: rispondiamo "ok" senza inviare email né
	// consumare il rate limit, per non dargli alcun segnale utile.
	if (typeof body?.sito_web === 'string' && body.sito_web.trim() !== '') {
		return jsonResponse({ ok: true });
	}

	const { valid, data } = validatePayload(body);
	if (!valid) {
		return jsonResponse({ ok: false, error: 'validation' }, 400);
	}

	const ip = request.headers.get('CF-Connecting-IP') || 'unknown';

	if (env.RECENSIONI_KV) {
		const allowed = await checkRateLimit(env.RECENSIONI_KV, 'recensioni', ip);
		if (!allowed) {
			return jsonResponse({ ok: false, error: 'rate_limited' }, 429);
		}
	}

	try {
		await sendNotificationEmail(env, data, { ip, ts: new Date().toISOString() });
	} catch (err) {
		console.error('Errore invio email recensione:', err);
		return jsonResponse({ ok: false, error: 'email_failed' }, 502);
	}

	return jsonResponse({ ok: true });
}

interface Env {
	ASSETS: { fetch: typeof fetch };
	RECENSIONI_KV?: KVNamespace;
	RESEND_API_KEY: string;
	NOTIFY_EMAIL?: string;
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);

		if (url.pathname === '/api/recensioni' && request.method === 'POST') {
			return handleRecensioni(request, env);
		}

		if (url.pathname === '/api/preventivo' && request.method === 'POST') {
			return handlePreventivo(request, env);
		}

		// Qualunque altro path arrivato qui non ha combaciato con un asset
		// statico: rilanciamo su ASSETS per farci gestire da Cloudflare il
		// comportamento di default (trailing slash, 404, ecc.).
		return env.ASSETS.fetch(request);
	}
};
