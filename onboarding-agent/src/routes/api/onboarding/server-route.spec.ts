import { describe, expect, it } from 'vitest';
import { POST } from './+server';

describe('POST /api/onboarding', () => {
	it('returnerer 401 når bruker ikke er innlogget', async () => {
		const response = await POST({
			request: new Request('https://example.test/api/onboarding', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: '{}'
			}),
			platform: {
				env: {
					PAYLOAD_SERVICE: { fetch: () => Promise.resolve(new Response()) } as unknown as Fetcher
				}
			} as unknown as App.Platform,
			locals: {} as App.Locals
		});

		const data = (await response.json()) as { error: string };
		expect(response.status).toBe(401);
		expect(data.error).toBe('du må være logget inn for å gå videre');
	});
});
