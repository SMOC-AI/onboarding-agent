<script lang="ts">
	import { page } from '$app/state';

	$: companyName = page.url.searchParams.get('companyName')
</script>

<svelte:head>
	<title>SMOC.AI Onboarding</title>
</svelte:head>

<section class="intro">
	<div class="intro-card">
		<h1>Herlig! 🥳</h1>
		<p class="subtitle">
			Nå trenger vi litt mer informasjon om {companyName}. Svar kort og konkret, så får vi satt opp en god profil.
		</p>
	</div>
</section>
