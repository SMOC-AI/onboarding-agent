import { json } from '@sveltejs/kit';
import { createOnboardingInPayload, isValidOnboardingRequest } from '$lib/server/onboarding-agent';

export async function POST({
	request,
	platform,
	locals
}: {
	request: Request;
	platform: App.Platform | undefined;
	locals: App.Locals;
}) {
	// API skal kun kunne kalles av innloggede brukere
	if (!locals.session) {
		return json(
			{
				ok: false,
				error: 'du må være logget inn for å gå videre'
			},
			{ status: 401 }
		);
	}

	const env = platform?.env as Record<string, string | undefined> | undefined;
	// Cloudflare service binding mot payload worker
	const payloadService = env?.PAYLOAD_SERVICE as Fetcher | undefined;

	if (!payloadService) {
		return json(
			{
				ok: false,
				error: 'mangler PAYLOAD_SERVICE i worker config'
			},
			{ status: 500 }
		);
	}

	let body: unknown;

	try {
		body = await request.json();
	} catch {
		return json(
			{
				ok: false,
				error: 'request body må være gyldig json'
			},
			{ status: 400 }
		);
	}

	if (!isValidOnboardingRequest(body)) {
		return json(
			{
				ok: false,
				error: 'ugyldig payload: krever companyName og alle gyldige spørsmål/svar'
			},
			{ status: 400 }
		);
	}

	const result = await createOnboardingInPayload(payloadService, body);

	if (result === 'payload-error') {
		return json(
			{
				ok: false,
				error: 'payload returnerte feilstatus'
			},
			{ status: 502 }
		);
	}

	if (result === 'network-error') {
		return json(
			{
				ok: false,
				error: 'kunne ikke nå payload'
			},
			{ status: 502 }
		);
	}

	return json({
		ok: true,
		message: 'onboarding api opprettet company og company assets i payload'
	});
}
