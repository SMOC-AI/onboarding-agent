<script lang="ts">
	import { goto } from '$app/navigation';

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
		<form on:submit={handleSubmit}>
			<input
				name="companyName"
				placeholder="Hva heter firmaet ditt?"
				bind:value={companyName}
				required
			/>

			<button type="submit" disabled={!isValid}>Fortsett</button>
		</form>
	</div>
</section>

<!-- Styling for det meste generert av AI for å slippe hacking fram og tilbake -->
<style>
	.intro {
		flex: 1;
		display: grid;
		place-items: center;
		padding: 1rem;
	}

	h1 {
		margin: 0 0 1.25rem;
		font-size: 1.75rem;
		text-align: left;
	}

	input {
		width: 100%;
		padding: 0.7rem 0.85rem;
		border-radius: 0.5rem;
		border: 1px solid rgb(0 0 0 / 15%);
		background: rgb(255 255 255 / 95%);
	}

	input:focus {
		outline: 2px solid rgb(64 117 166 / 40%);
		outline-offset: 1px;
	}

	button {
		margin-top: 0.5rem;
		padding: 0.5rem 1rem;
		border-radius: 0.5rem;
		background: #2563eb;
		color: #fff;
		cursor: pointer;
	}

	button:disabled {
		background: #93c5fd;
		cursor: not-allowed;
	}
</style>
