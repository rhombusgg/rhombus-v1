import esbuild from 'esbuild';
import vm from 'node:vm';
import net from 'node:net';
import { RhombusUtilities, type HealthcheckOutput } from './clientHealthcheck';
import prisma from './db';

export async function runHealthcheck(typescript: string): Promise<HealthcheckOutput> {
	const ts = [RhombusUtilities, typescript, 'rhombusFinalExportResult = await health();'].join(
		'\n'
	);

	try {
		const build = await esbuild.transform(ts, {
			loader: 'ts',
			platform: 'node'
		});

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
			return { status: 'error', message: 'Timed out' };
		}

		return {
			status: 'ran',
			logs,
			healthy: !!context.rhombusFinalExportResult
		};
	} catch (error) {
		const { message } = error as Error;
		return { status: 'error', message };
	}
}

export const runHealthchecks = async () => {
	const challenges = await prisma.challenge.findMany({
		where: {
			health: { isNot: null }
		},
		select: {
			health: {
				select: {
					id: true,
					script: true
				}
			}
		}
	});

	console.log('Running challenge healthchecks...');

	challenges.forEach(async (challenge) => {
		try {
			const healthcheck = await runHealthcheck(challenge.health!.script);

			await prisma.challengeHealth.update({
				where: {
					id: challenge.health!.id
				},
				data: {
					healthy: healthcheck.status === 'ran' && healthcheck.healthy,
					lastChecked: new Date()
				}
			});
		} catch (e) {
			console.error(e);
		}
	});
};
