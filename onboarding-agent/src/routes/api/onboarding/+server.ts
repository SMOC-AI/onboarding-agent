import { json } from '@sveltejs/kit';

interface OnboardingAnswer {
	question: string;
	answer: string;
}

interface OnboardingRequest {
	companyName: string;
	answers: OnboardingAnswer[];
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
	const payloadBaseUrl = env?.PAYLOAD_BASE_URL;
	const payloadApiToken = env?.PAYLOAD_API_TOKEN;

	if (!payloadBaseUrl || !payloadApiToken) {
		return json(
			{
				ok: false,
				error: 'mangler PAYLOAD_BASE_URL eller PAYLOAD_API_TOKEN i worker secrets'
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

	let payloadStatus = 0;
	let payloadResponseBody: unknown = null;
	let payloadRawText = '';

	try {
		const response = await fetch(payloadBaseUrl, {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				authorization: `Bearer ${payloadApiToken}`
			},
			body: JSON.stringify(body)
		});
		payloadStatus = response.status;

		payloadRawText = await response.text();
		try {
			payloadResponseBody = payloadRawText ? JSON.parse(payloadRawText) : { note: 'payload svarte uten body' };
		} catch {
			payloadResponseBody = {
				note: 'payload svarte uten json body',
				rawPreview: payloadRawText.slice(0, 200)
			};
		}

		if (!response.ok) {
			return json(
				{
					ok: false,
					error: 'payload returnerte feilstatus',
					payloadBaseUrlUsed: payloadBaseUrl,
					payloadStatus,
					payloadResponseBody,
					payloadRawPreview: payloadRawText.slice(0, 200)
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
		message: 'onboarding api forwardet payload request',
		payloadBaseUrlUsed: payloadBaseUrl,
		payloadStatus,
		payloadResponseBody
	});
}
