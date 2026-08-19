/**
 * Worker entry point per formikadesk-site (Workers-with-assets, no adapter-cloudflare).
 *
 * Deploy gestito da Cloudflare Workers Builds (Git integration su master),
 * configurata il 2026-08-19: da ora ogni push su master fa deploy automatico.
 *
 * Il sito è interamente statico (SvelteKit adapter-static → build/), servito
 * tramite il binding "assets" configurato in wrangler.jsonc. Questo script
 * viene invocato SOLO per le richieste che non combaciano con nessun asset
 * statico — in pratica: POST /api/recensioni, più fallback su env.ASSETS.fetch
 * per qualunque altro path non trovato (così Cloudflare applica comunque la
 * sua gestione di trailing slash / 404 sugli asset).
 *
 * Riceve una recensione dal form pubblico (src/routes/recensioni/+page.svelte),
 * la valida, applica un rate limit basico per IP e invia una notifica email
 * via Resend. NON pubblica nulla: la pubblicazione avviene sempre a mano,
 * tramite commit su src/lib/data/reviews.json dopo revisione.
 *
 * Variabili d'ambiente richieste (Cloudflare dashboard → Settings → Variables and Secrets):
 *   RESEND_API_KEY   — API key di Resend (secret)
 *   NOTIFY_EMAIL     — indirizzo a cui inviare la notifica (dichiarato in wrangler.jsonc)
 *
 * Binding richiesto (dichiarato in wrangler.jsonc):
 *   RECENSIONI_KV    — namespace KV usato per il rate limit per IP
 *   ASSETS           — binding verso la cartella build/ (statico)
 */

const RATE_LIMIT_WINDOW_SECONDS = 600; // 10 minuti
const RATE_LIMIT_MAX_REQUESTS = 3; // max invii per IP nella finestra

const NOME_MIN = 2;
const NOME_MAX = 60;
const ATTIVITA_MAX = 80;
const TESTO_MIN = 10;
const TESTO_MAX = 500;

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
 * Rate limit basico per IP. Non atomico (read-then-write su KV), quindi non
 * è una garanzia stretta sotto race condition — ma è sufficiente a scoraggiare
 * spam automatico banale, che è l'obiettivo qui.
 */
async function checkRateLimit(kv: KVNamespace, ip: string): Promise<boolean> {
	const key = `ratelimit:${ip}`;
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
		const allowed = await checkRateLimit(env.RECENSIONI_KV, ip);
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

		// Qualunque altro path arrivato qui non ha combaciato con un asset
		// statico: rilanciamo su ASSETS per farci gestire da Cloudflare il
		// comportamento di default (trailing slash, 404, ecc.).
		return env.ASSETS.fetch(request);
	}
};
