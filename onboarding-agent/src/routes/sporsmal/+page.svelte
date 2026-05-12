<script lang="ts">
	import { page } from '$app/state';
	import { fade, slide } from 'svelte/transition';
	import ArrowInput from '$lib/components/ArrowInput.svelte';
	import { validateText } from '$lib/utils/validation';

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
	let triedCurrentStep = false;

	$: companyName = page.url.searchParams.get('companyName') || 'selskapet deres';
	$: isDone = step >= questions.length;
	$: inputError = validateText(input, {
		fieldLabel: 'Svar',
		minLength: 2,
		maxLength: 280
	});
	$: showInputError = !!inputError && triedCurrentStep;

// Sender ferdige svar til backend endepunktet som oppretter company i Payload
	async function submitOnboarding(collectedAnswers: string[]) {
		const payload = {
			companyName: companyName.trim(),
			answers: questions.map((question, index) => ({
				question,
				answer: collectedAnswers[index]
			}))
		};

		// Error handling her er laget med AI som utgangspunkt og finpusset av meg etterpå
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 10000);

		try {
			const response = await fetch('/api/onboarding', {
				method: 'POST',
				headers: {
					'content-type': 'application/json'
				},
				body: JSON.stringify(payload),
				signal: controller.signal
			});

			if (!response.ok) {
				const data = (await response.json().catch(() => ({}))) as { error?: string };

				if (response.status >= 500) {
					throw new Error('Teknisk feil hos serveren, prøv igjen om litt');
				}

				throw new Error(data.error || 'Noe i skjemaet må rettes før innsending');
			}
		} catch (error) {
			if (error instanceof DOMException && error.name === 'AbortError') {
				throw new Error('Serveren brukte for lang tid, prøv igjen');
			}

			if (error instanceof TypeError) {
				throw new Error('Nettverksfeil. Sjekk tilkoblingen din og prøv igjen.');
			}

			throw error;
		} finally {
			clearTimeout(timeoutId);
		}
	}

	// Legger til ett svar av gangen, på siste spørsmål trigges innsending
	async function handleNext(event: SubmitEvent) {
		event.preventDefault();
		triedCurrentStep = true;
		if (inputError) return;

		submitError = '';
		submitSuccess = false;
		const isLastQuestion = step === questions.length - 1;

		answers = [...answers, input.trim()];
		step += 1;
		input = '';
		triedCurrentStep = false;

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
				<form on:submit={handleNext} novalidate>
					<ArrowInput
						placeholder="Skriv svaret ditt her"
						inputId={`question-${step}`}
						error={showInputError ? inputError : ''}
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
