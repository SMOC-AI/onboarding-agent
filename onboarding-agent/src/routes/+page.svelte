<svelte:head>
	<title>SMOC.AI Onboarding</title>
	<meta name="description" content="Start onboarding for company setup" />
</svelte:head>

<section class="intro">
	<div class="intro-card">
		<h1>Hei, hyggelig å møte deg! <br>La oss bli kjent.</h1>
		<input id="company-name" name="companyName" type="text" placeholder="Hva heter firmaet ditt?" />
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

	.intro-card {
		width: 100%;
		max-width: 32rem;
		padding: 0.5rem 0;
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
</style>
