import { json } from '@sveltejs/kit';

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

	let payloadStatus = 0;
	let payloadResponseBody: unknown = null;

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

		try {
			payloadResponseBody = await response.json();
		} catch {
			payloadResponseBody = { note: 'payload svarte uten json body' };
		}

		if (!response.ok) {
			return json(
				{
					ok: false,
					error: 'payload returnerte feilstatus',
					payloadStatus,
					payloadResponseBody
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
		payloadStatus,
		payloadResponseBody
	});
}
