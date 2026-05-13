import { describe, expect, it } from 'vitest';
import { isValidOnboardingRequest, type OnboardingRequest } from './onboarding-agent';

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
		const invalidBody = { ...validBody, answers: validBody.answers.slice(0, 7) };
		expect(isValidOnboardingRequest(invalidBody)).toBe(false);
	});
});
