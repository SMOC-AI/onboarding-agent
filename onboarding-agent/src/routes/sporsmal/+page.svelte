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

	$: companyName = page.url.searchParams.get('companyName')
	$: isDone = step >= questions.length;
	$: isValid = isFilled(input);

	function handleNext(event: SubmitEvent) {
		event.preventDefault();
		if (!isValid) return;

		answers = [...answers, input.trim()];
		step += 1;
		input = '';
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
			<p>ferdig</p>
		{/if}
	</div>
</section>
