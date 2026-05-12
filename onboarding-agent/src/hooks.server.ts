import { env } from '$env/dynamic/private';
import type { Handle } from '@sveltejs/kit';
import { handleClerk } from 'clerk-sveltekit/server';

// Beskytter onboarding routes og API når Clerk secret er satt
const clerkHandle = env.CLERK_SECRET_KEY
	? handleClerk(env.CLERK_SECRET_KEY, {
			signInUrl: '/sign-in',
			protectedPaths: [
				({ url }) =>
					url.pathname === '/' ||
					url.pathname.startsWith('/sporsmal') ||
					url.pathname.startsWith('/api/onboarding')
			]
		})
	: null;

export const handle: Handle = async ({ event, resolve }) => {
	// Fallback for lokalt/dev når Clerk-nøkler ikke er satt.
	if (!clerkHandle) return resolve(event);
	return clerkHandle({ event, resolve });
};
