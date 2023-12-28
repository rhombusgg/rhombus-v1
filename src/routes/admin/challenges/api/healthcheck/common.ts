import { z } from 'zod';

export const healthcheckInputSchema = z.object({
	typescript: z.string()
});

export type HealthcheckInput = z.infer<typeof healthcheckInputSchema>;

// export const healthcheckOutputSchema = z.object({
// 	status: z.enum(['success', 'error']),
// 	message: z.string().optional()
// });

export const healthcheckOutputSchema = z
	.object({
		status: z.enum(['ran']),
		logs: z.string(),
		healthy: z.boolean()
	})
	.or(
		z.object({
			status: z.enum(['error']),
			message: z.string()
		})
	);

export type HealthcheckOutput = z.infer<typeof healthcheckOutputSchema>;

export const RhombusUtilities = `
namespace Rhombus {
    // const net = require('node:net');

    /**
     * Connects to a raw TCP server and returns the initial response. Roughly equivalent to
     * running \`nc\` from the command line and looking at the first couple of lines of output.
     * @param serverAddress The address of the server to connect to.
     * @param serverPort The port of the server to connect to.
     * @param timeoutMs The timeout in milliseconds.
     */
    export function tcpConnect(
        serverAddress: string,
        serverPort: number,
        timeoutMs = 5000
    ): Promise<
        { status: 'success'; buffer: Buffer; value: string } | { status: 'error'; error: string }
    > {
        return new Promise((resolve) => {
            const socket = net.createConnection(serverPort, serverAddress);
            const timeout = setTimeout(() => {
                resolve({ status: 'error', error: 'timeout' });
                socket.end();
            }, timeoutMs);

            socket.on('data', (data) => {
                socket.end();
                clearTimeout(timeout);
                resolve({ status: 'success', buffer: data, value: data.toString() });
            });

            socket.on('error', (err) => {
                socket.end();
                clearTimeout(timeout);
                resolve({ status: 'error', error: err.message });
            });
        });
    }
}
        `;
