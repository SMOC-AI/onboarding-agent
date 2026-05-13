import { env } from '$env/dynamic/private';
import type { Handle } from '@sveltejs/kit';
import { handleClerk } from 'clerk-sveltekit/server';

// Beskytter onboarding routes og API med Clerk når secret finnes i runtime
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

function isProtectedPath(pathname: string): boolean {
	return pathname === '/' || pathname.startsWith('/sporsmal') || pathname.startsWith('/api/onboarding');
}

export const handle: Handle = async ({ event, resolve }) => {
	// Hvis clerk mangler, blokker beskyttede ruter i stedet for å åpne dem
	if (!clerkHandle && isProtectedPath(event.url.pathname)) {
		return new Response('mangler CLERK_SECRET_KEY', { status: 500 });
	}

	if (!clerkHandle) return resolve(event);
	return clerkHandle({ event, resolve });
};
