import { env } from '$env/dynamic/public';
import { initializeClerkClient } from 'clerk-sveltekit/client';

// Initialiserer Clerk komponenter når publishable key finnes
if (env.PUBLIC_CLERK_PUBLISHABLE_KEY) {
	initializeClerkClient(env.PUBLIC_CLERK_PUBLISHABLE_KEY, {
		signInUrl: '/sign-in',
		signUpUrl: '/sign-up',
		afterSignInUrl: '/',
		afterSignUpUrl: '/'
	});
}
