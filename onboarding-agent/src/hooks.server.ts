import { env } from '$env/dynamic/private';
import type { Handle } from '@sveltejs/kit';
import { handleClerk } from 'clerk-sveltekit/server';

const clerkSecretKey = env.CLERK_SECRET_KEY;

if (!clerkSecretKey) {
	throw new Error('mangler CLERK_SECRET_KEY');
}

// Beskytter onboarding routes og API med Clerk
const clerkHandle = handleClerk(clerkSecretKey, {
	signInUrl: '/sign-in',
	protectedPaths: [
		({ url }) =>
			url.pathname === '/' ||
			url.pathname.startsWith('/sporsmal') ||
			url.pathname.startsWith('/api/onboarding')
	]
});

export const handle: Handle = async ({ event, resolve }) => {
	return clerkHandle({ event, resolve });
};
