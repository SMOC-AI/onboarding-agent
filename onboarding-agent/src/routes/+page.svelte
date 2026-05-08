<script lang="ts">
	import { goto } from '$app/navigation';
	import ArrowInput from '$lib/components/ArrowInput.svelte';

	let companyName = '';
	$: isValid = companyName.trim().length >= 2;

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
	<div class="intro-card">
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
