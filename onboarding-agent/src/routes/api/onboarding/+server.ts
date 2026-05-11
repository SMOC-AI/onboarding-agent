import { json } from '@sveltejs/kit';

interface OnboardingAnswer {
	question: string;
	answer: string;
}

interface OnboardingRequest {
	companyName: string;
	answers: OnboardingAnswer[];
}

function toCompanyKey(value: string): string {
	return value
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[^\w\s-]/g, '')
		.trim()
		.replace(/[\s_-]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 80);
}

function isValidOnboardingRequest(body: unknown): body is OnboardingRequest {
	if (!body || typeof body !== 'object') return false;

	const candidate = body as Partial<OnboardingRequest>;

	if (typeof candidate.companyName !== 'string') return false;
	if (candidate.companyName.trim().length < 2) return false;
	if (!Array.isArray(candidate.answers) || candidate.answers.length === 0) return false;

	return candidate.answers.every(
		(entry) =>
			entry &&
			typeof entry.question === 'string' &&
			entry.question.trim().length > 0 &&
			typeof entry.answer === 'string' &&
			entry.answer.trim().length > 0
	);
}

export async function POST({ request, platform }: { request: Request; platform: App.Platform | undefined }) {
	const env = platform?.env as Record<string, string | undefined> | undefined;
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
				error: 'ugyldig payload: krever companyName og minst ett gyldig spørsmål/svar'
			},
			{ status: 400 }
		);
	}

	const title = body.companyName.trim();
	const key = toCompanyKey(title);
	const companyPayload = {
		companyId: crypto.randomUUID(),
		title,
		key
	};

	try {
		const serviceRequest = new Request('https://internal/api/companies', {
			method: 'POST',
			headers: {
				'content-type': 'application/json'
			},
			body: JSON.stringify(companyPayload)
		});
		const response = await payloadService.fetch(serviceRequest);

		if (!response.ok) {
			return json(
				{
					ok: false,
					error: 'payload returnerte feilstatus'
				},
				{ status: 502 }
			);
		}
	} catch {
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
		message: 'onboarding api opprettet company i payload'
	});
}
