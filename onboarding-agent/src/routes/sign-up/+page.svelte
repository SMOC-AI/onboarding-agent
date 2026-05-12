<script lang="ts">
	import SignUp from 'clerk-sveltekit/client/SignUp.svelte';
</script>

<svelte:head>
	<title>Opprett bruker | SMOC.AI Onboarding</title>
</svelte:head>

<section class="center">
	<SignUp redirectUrl="/" />
</section>

<style>
	.center {
		min-height: calc(100vh - 8rem);
		display: grid;
		place-items: center;
	}
</style>
