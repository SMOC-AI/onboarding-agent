import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createOnboardingInPayload, isValidOnboardingRequest, type OnboardingRequest } from './onboarding-agent';

const validBody: OnboardingRequest = {
	companyName: 'Otern AS',
	answers: [
		{ question: 'q1', answer: 'a1' },
		{ question: 'q2', answer: 'a2' },
		{ question: 'q3', answer: 'a3' },
		{ question: 'q4', answer: 'a4' },
		{ question: 'q5', answer: 'a5' },
		{ question: 'q6', answer: 'a6' },
		{ question: 'q7', answer: 'a7' },
		{ question: 'q8', answer: 'a8' }
	]
};

describe('isValidOnboardingRequest', () => {
	it('returnerer true for gyldig body', () => {
		expect(isValidOnboardingRequest(validBody)).toBe(true);
	});

	it('returnerer false når det er færre enn 8 svar', () => {
		const invalid = { ...validBody, answers: validBody.answers.slice(0, 7) };
		expect(isValidOnboardingRequest(invalid)).toBe(false);
	});

	it('returnerer false når et svar er tomt', () => {
		const invalid = {
			...validBody,
			answers: validBody.answers.map((entry, index) =>
				index === 2 ? { ...entry, answer: '   ' } : entry
			)
		};
		expect(isValidOnboardingRequest(invalid)).toBe(false);
	});
});

describe('createOnboardingInPayload', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue('11111111-1111-1111-1111-111111111111');
	});

	it('poster company og company-assets og returnerer ok', async () => {
		const fetchMock = vi
			.fn()
			.mockResolvedValueOnce(new Response('{}', { status: 201 }))
			.mockResolvedValueOnce(new Response('{}', { status: 201 }));

		const payloadService = { fetch: fetchMock } as unknown as Fetcher;
		const result = await createOnboardingInPayload(payloadService, validBody);

		expect(result).toBe('ok');
		expect(fetchMock).toHaveBeenCalledTimes(2);

		const [companyRequest] = fetchMock.mock.calls[0] as [Request];
		expect(companyRequest.url).toBe('https://internal/api/companies');

		const companyPayload = JSON.parse(await companyRequest.text()) as {
			companyId: string;
			title: string;
			key: string;
		};
		expect(companyPayload).toEqual({
			companyId: '11111111-1111-1111-1111-111111111111',
			title: 'Otern AS',
			key: 'otern-as'
		});

		const [assetsRequest] = fetchMock.mock.calls[1] as [Request];
		expect(assetsRequest.url).toBe('https://internal/api/company-assets');

		const assetsPayload = JSON.parse(await assetsRequest.text()) as {
			companyId: string;
			basics: Record<string, string>;
		};
		expect(assetsPayload.companyId).toBe('11111111-1111-1111-1111-111111111111');
		expect(assetsPayload.basics.productsYouSell).toBe('a1');
		expect(assetsPayload.basics.salesProcessToday).toBe('a8');
	});

	it('returnerer payload-error når company-kallet feiler', async () => {
		const fetchMock = vi.fn().mockResolvedValueOnce(new Response('{}', { status: 500 }));
		const payloadService = { fetch: fetchMock } as unknown as Fetcher;

		const result = await createOnboardingInPayload(payloadService, validBody);

		expect(result).toBe('payload-error');
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it('returnerer network-error når company-kallet kaster exception', async () => {
		const fetchMock = vi.fn().mockRejectedValueOnce(new Error('network down'));
		const payloadService = { fetch: fetchMock } as unknown as Fetcher;

		const result = await createOnboardingInPayload(payloadService, validBody);

		expect(result).toBe('network-error');
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});
});
