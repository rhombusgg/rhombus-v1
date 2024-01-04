import { json } from '@sveltejs/kit';
import { runHealthcheck } from '$lib/serverHealthcheck';
import { healthcheckInputSchema, type HealthcheckOutput } from '$lib/clientHealthcheck';

export async function POST({ request, locals }) {
	if (!locals.session?.isAdmin) {
		return json({ status: 'error', message: 'Not authorized' } satisfies HealthcheckOutput, {
			status: 403
		});
	}

	const input = healthcheckInputSchema.parse(await request.json());

	const healthcheck = await runHealthcheck(input.typescript);
	return json(healthcheck);
}
