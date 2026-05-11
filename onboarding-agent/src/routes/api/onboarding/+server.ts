import { json } from '@sveltejs/kit';

export async function POST({ platform }: { platform: App.Platform | undefined }) {
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

	let payloadStatus = 0;

	try {
		const response = await fetch(payloadBaseUrl, {
			method: 'GET',
			headers: {
				authorization: `Bearer ${payloadApiToken}`
			}
		});
		payloadStatus = response.status;
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
		message: 'onboarding api er satt opp og payload service er tilgjengelig!!',
		payloadStatus
	});
}
