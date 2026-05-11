<script lang="ts">
	import { page } from '$app/state';
	import { fade, slide } from 'svelte/transition';
	import ArrowInput from '$lib/components/ArrowInput.svelte';
	import { isFilled } from '$lib/utils/validation';

	/**
	 * Spørsmål tatt i fra company assets i SMOC sin Payload
	 */
	const questions = [
		'Hvilke produkter selger dere?',
		'Hvem er målgruppen deres?',
		'Hvem er den ideelle kunden deres?',
		'Hvem har vært deres faste kunder de siste 6 månedene?',
		'Hva motiverer denne kundegruppen?',
		'Er det målgrupper dere ikke ønsker å inkludere?',
		'Hva er deres unike salgsargumenter?',
		'Hvordan gjør dere salg i dag?'
	];

	let step = 0;
	let input = '';
	let answers: string[] = [];
	let submitError = '';
	let submitSuccess = false;

	$: companyName = page.url.searchParams.get('companyName') || 'selskapet deres';
	$: isDone = step >= questions.length;
	$: isValid = isFilled(input);

	async function submitOnboarding(collectedAnswers: string[]) {
		const payload = {
			companyName: companyName.trim(),
			answers: questions.map((question, index) => ({
				question,
				answer: collectedAnswers[index]
			}))
		};

		const response = await fetch('/api/onboarding', {
			method: 'POST',
			headers: {
				'content-type': 'application/json'
			},
			body: JSON.stringify(payload)
		});

		if (!response.ok) {
			const data = (await response.json().catch(() => ({}))) as { error?: string };
			throw new Error(data.error || 'Klarte ikke å sende onboarding data');
		}
	}

	async function handleNext(event: SubmitEvent) {
		event.preventDefault();
		if (!isValid) return;

		submitError = '';
		submitSuccess = false;
		const isLastQuestion = step === questions.length - 1;

		answers = [...answers, input.trim()];
		step += 1;
		input = '';

		if (!isLastQuestion) return;

		try {
			await submitOnboarding(answers);
			submitSuccess = true;
		} catch (err) {
			submitError = err instanceof Error ? err.message : 'Ukjent feil';
		}
	}
</script>

<svelte:head>
	<title>SMOC.AI Onboarding</title>
</svelte:head>

<section class="intro">
	<div class="intro-card" in:fade={{ duration: 300 }}>
		<h1>Herlig! 🥳</h1>
		<p class="subtitle">
			Nå trenger vi litt mer informasjon om {companyName}. Svar kort og konkret, så får vi satt opp en god profil.
		</p>

		{#each answers as answer, i (i)}
			<div class="qa-block" in:slide={{ duration: 500 }}>
				<p>{questions[i]}</p>
				<p><strong>{answer}</strong></p>
			</div>
		{/each}

		{#if !isDone}
			<div class="qa-block" in:slide={{ duration: 500 }}>
				<p>{questions[step]}</p>
				<form on:submit={handleNext}>
					<ArrowInput
						placeholder="Skriv svaret ditt her"
						disabled={!isValid}
						bind:value={input}
					/>
				</form>
			</div>
		{:else}
			{#if submitError}
				<p>Noe gikk galt: {submitError}</p>
			{:else if submitSuccess}
				<p>Takk for svar! Dataen er sendt videre</p>
			{/if}
		{/if}
	</div>
</section>
