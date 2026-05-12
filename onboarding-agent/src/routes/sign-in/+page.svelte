<script lang="ts">
	import SignIn from 'clerk-sveltekit/client/SignIn.svelte';
</script>

<svelte:head>
	<title>Logg inn | SMOC.AI Onboarding</title>
</svelte:head>

<section class="auth-center">
	<SignIn redirectUrl="/" />
</section>

<style>
	.auth-center {
		min-height: calc(100vh - 8rem);
		display: grid;
		place-items: center;
	}
</style>
