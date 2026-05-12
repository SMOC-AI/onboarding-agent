export interface OnboardingAnswer {
	question: string;
	answer: string;
}

export interface OnboardingRequest {
	companyName: string;
	answers: OnboardingAnswer[];
}

// Lager en stabil key som matcher forventet format i Payload, generert av AI
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

// Runtime validation av request body før det sendes videre til Payload
export function isValidOnboardingRequest(body: unknown): body is OnboardingRequest {
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

// Mapper onboarding data til feltene som companies collectionen forventer
function mapToCompanyPayload(body: OnboardingRequest) {
	const title = body.companyName.trim();
	const key = toCompanyKey(title);

	return {
		companyId: crypto.randomUUID(),
		title,
		key
	};
}

// Sender company data til payload via cloudflare service binding
export async function createCompanyInPayload(
	payloadService: Fetcher,
	body: OnboardingRequest
): Promise<'payload-error' | 'network-error' | 'ok'> {
	const companyPayload = mapToCompanyPayload(body);

	try {
		const serviceRequest = new Request('https://internal/api/companies', {
			method: 'POST',
			headers: {
				'content-type': 'application/json'
			},
			body: JSON.stringify(companyPayload)
		});

		const response = await payloadService.fetch(serviceRequest);
		return response.ok ? 'ok' : 'payload-error';
	} catch {
		return 'network-error';
	}
}
