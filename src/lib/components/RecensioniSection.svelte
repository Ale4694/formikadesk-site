<script>
	import reviews from '$lib/data/reviews.json';

	const media = reviews.length
		? (reviews.reduce((sum, r) => sum + r.stelle, 0) / reviews.length).toFixed(1)
		: null;
</script>

{#if reviews.length}
	<!-- ================= RECENSIONI ================= -->
	<section id="recensioni" class="scroll-mt-20 border-t border-line bg-paper-2/40">
		<div class="mx-auto max-w-6xl px-5 py-20 sm:px-8">
			<div class="reveal flex flex-wrap items-end justify-between gap-6">
				<div class="max-w-xl">
					<span class="eyebrow">Recensioni</span>
					<h2 class="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
						Chi usa FormikaDesk lo racconta meglio di noi.
					</h2>
					{#if media}
						<p class="mt-3 font-mono text-sm text-muted">
							★ {media} su 5 · {reviews.length}
							{reviews.length === 1 ? 'recensione' : 'recensioni'}
						</p>
					{/if}
				</div>
				<a
					href="/recensioni/"
					class="inline-flex flex-none items-center gap-1.5 rounded-full border border-line px-5 py-2.5 text-sm font-medium text-ink-soft transition-colors hover:border-accent hover:text-ink"
				>
					Lascia una recensione
					<span aria-hidden="true">→</span>
				</a>
			</div>

			<div class="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
				{#each reviews as r}
					<figure
						class="reveal flex flex-col justify-between rounded-2xl border border-line bg-paper p-7"
					>
						<div>
							<div
								class="text-accent"
								aria-label="{r.stelle} su 5 stelle"
							>
								<span aria-hidden="true">{'★'.repeat(r.stelle)}{'☆'.repeat(5 - r.stelle)}</span>
							</div>
							<blockquote class="mt-3 leading-relaxed text-ink-soft">
								“{r.testo}”
							</blockquote>
						</div>
						<figcaption class="mt-6 text-sm text-muted">
							<span class="font-medium text-ink">{r.nome}</span>
							{#if r.attivita}
								<span> — {r.attivita}</span>
							{/if}
						</figcaption>
					</figure>
				{/each}
			</div>
		</div>
	</section>
{/if}
