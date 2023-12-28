import { json } from '@sveltejs/kit';
import { healthcheckInputSchema, RhombusUtilities, type HealthcheckOutput } from './common';
import * as esbuild from 'esbuild';
import * as vm from 'node:vm';
import * as net from 'node:net';

export async function POST({ request }) {
	const healthcheck = healthcheckInputSchema.parse(await request.json());

	const js =
		RhombusUtilities + healthcheck.typescript + '\n' + 'rhombusFinalExportResult = await health();';

	try {
		// eslint-disable-next-line no-var
		var build = await esbuild.transform(js, {
			loader: 'ts',
			platform: 'node'
		});
	} catch (error) {
		const { message } = error as Error;
		return json({ status: 'error', message } satisfies HealthcheckOutput);
	}

	try {
		let logs = '';
		const context = vm.createContext({
			rhombusFinalExportResult: false,
			fetch,
			net,
			setTimeout,
			clearTimeout,
			console: {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				log: function (...args: any[]) {
					logs += args.join(' ') + '\n';
				},
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				error: function (...args: any[]) {
					logs += args.join(' ') + '\n';
				}
			}
		});
		const script = new vm.SourceTextModule(build.code, { context });
		await script.link((spec) => import(/* @vite-ignore */ spec));
		const evaluation = script.evaluate({ timeout: 10 * 1000, breakOnSigint: true });
		const timeout = new Promise<boolean>((resolve) => {
			setTimeout(() => resolve(true), 10 * 1000, 'two');
		});
		const timedOut = await Promise.race([timeout, evaluation]);
		if (timedOut) {
			return json({ status: 'error', message: 'Timed out' } satisfies HealthcheckOutput);
		}

		return json({
			status: 'ran',
			logs,
			healthy: !!context.rhombusFinalExportResult
		} satisfies HealthcheckOutput);
	} catch (error) {
		const { message } = error as Error;
		return json({ status: 'error', message } satisfies HealthcheckOutput);
	}
}
