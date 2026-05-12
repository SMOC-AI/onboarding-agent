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
	if (!Array.isArray(candidate.answers) || candidate.answers.length < 8) return false;

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
function mapToCompanyPayload(companyId: string, body: OnboardingRequest) {
	const title = body.companyName.trim();
	const key = toCompanyKey(title);

	return {
		companyId,
		title,
		key
	};
}

function mapToCompanyAssetsPayload(companyId: string, body: OnboardingRequest) {
	const values = body.answers.map((entry) => entry.answer.trim());

	return {
		companyId,
		basics: {
			productsYouSell: values[0] ?? '',
			targetCustomer: values[1] ?? '',
			idealCustomer: values[2] ?? '',
			regularCustomerLast6Months: values[3] ?? '',
			customerMotivations: values[4] ?? '',
			excludeAudiences: values[5] ?? '',
			uniqueSellingPoints: values[6] ?? '',
			salesProcessToday: values[7] ?? ''
		}
	};
}

async function postToPayload(
	payloadService: Fetcher,
	path: string,
	data: unknown
): Promise<'ok' | 'payload-error' | 'network-error'> {
	try {
		const serviceRequest = new Request(`https://internal${path}`, {
			method: 'POST',
			headers: {
				'content-type': 'application/json'
			},
			body: JSON.stringify(data)
		});

		const response = await payloadService.fetch(serviceRequest);
		return response.ok ? 'ok' : 'payload-error';
	} catch {
		return 'network-error';
	}
}

// Sender company + company assets (spørsmål og svar) til payload via cloudflare service binding
export async function createOnboardingInPayload(
	payloadService: Fetcher,
	body: OnboardingRequest
): Promise<'payload-error' | 'network-error' | 'ok'> {
	const companyId = crypto.randomUUID();
	const companyPayload = mapToCompanyPayload(companyId, body);
	const companyAssetsPayload = mapToCompanyAssetsPayload(companyId, body);

	const companyResult = await postToPayload(payloadService, '/api/companies', companyPayload);
	if (companyResult !== 'ok') return companyResult;

	const assetsResult = await postToPayload(payloadService, '/api/company-assets', companyAssetsPayload);
	if (assetsResult !== 'ok') {
		return assetsResult;
	}

	return 'ok';
}
