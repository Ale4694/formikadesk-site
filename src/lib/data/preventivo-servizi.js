/**
 * Catalogo dei servizi mostrati nel configuratore /preventivo.
 *
 * File condiviso: importato sia dal form (src/routes/preventivo/+page.svelte)
 * sia dal Worker (worker/index.ts) per costruire l'email di notifica, così le
 * etichette restano identiche nei due posti senza doverle tenere allineate a mano.
 *
 * Le sezioni "gestionale" e "sitoWeb" sono blocchi a selezione singola (una
 * checkbox sola che indica l'intero pacchetto); "assistenzaPc" e
 * "recuperoBackup" sono liste di voci selezionabili singolarmente.
 */

export const GESTIONALE = {
	titolo: 'Gestionale su misura',
	descrizione:
		'Gestione magazzino e catalogo, anagrafica clienti/fornitori, ricerca e ' +
		'suggerimento prezzi, statistiche e dashboard, importazione dati da sistemi ' +
		'esistenti, assistenza e aggiornamenti continuativi'
};

export const SITO_WEB = {
	titolo: 'Sito web',
	descrizione:
		'Sito vetrina, modulo contatti/preventivo, sistema recensioni, e-commerce, ' +
		'restyling di siti esistenti, dominio e hosting'
};

export const ASSISTENZA_PC = {
	titolo: 'Assistenza PC',
	voci: [
		{ id: 'formattazione', label: 'Formattazione e reinstallazione sistema' },
		{ id: 'virus', label: 'Rimozione virus e malware' },
		{ id: 'nuovo-pc', label: 'Configurazione nuovo PC' },
		{ id: 'manutenzione', label: 'Manutenzione e pulizia periodica' },
		{ id: 'upgrade-hardware', label: 'Upgrade hardware (RAM, SSD)' },
		{ id: 'ottimizzazione', label: 'Ottimizzazione prestazioni' },
		{ id: 'periferiche', label: 'Configurazione stampanti e periferiche' },
		{ id: 'remoto', label: 'Assistenza da remoto' }
	]
};

export const RECUPERO_BACKUP = {
	titolo: 'Recupero e backup dati',
	voci: [
		{ id: 'file-persi', label: 'Recupero file cancellati o persi' },
		{ id: 'dispositivo-danneggiato', label: 'Recupero da dispositivo danneggiato' },
		{ id: 'backup-automatico', label: 'Configurazione backup automatico' },
		{ id: 'accessi-email', label: 'Recupero accessi/dati da email o account' },
		{ id: 'migrazione', label: 'Migrazione dati verso un nuovo PC' },
		{ id: 'organizzazione-file', label: 'Organizzazione e pulizia file/cartelle' }
	]
};
