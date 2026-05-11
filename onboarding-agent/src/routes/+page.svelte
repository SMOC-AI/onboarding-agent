<script lang="ts">
	import { goto } from '$app/navigation';
	import { fade } from 'svelte/transition';
	import ArrowInput from '$lib/components/ArrowInput.svelte';
	import { isFilled } from '$lib/utils/validation';

	let companyName = '';
	$: isValid = isFilled(companyName, 2);

	// Lagrer companyName i query param til neste side
	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (!isValid) return;

		const name = encodeURIComponent(companyName.trim());
		goto(`/sporsmal?companyName=${name}`);
	}
</script>

<svelte:head>
	<title>SMOC.AI Onboarding</title>
	<meta name="description" content="Start onboarding for company setup" />
</svelte:head>

<section class="intro">
	<div class="intro-card" in:fade={{ duration: 300 }}>
		<h1>Hei, hyggelig å møte deg! <br/>La oss bli kjent.</h1>
		<p class="subtitle">Skal vi starte med navn?😉</p>

		<form on:submit={handleSubmit}>
			<ArrowInput
				name="companyName"
				placeholder="Navn på selskapet"
				minLength={2}
				disabled={!isValid}
				bind:value={companyName}
			/>
		</form>
	</div>
</section>
