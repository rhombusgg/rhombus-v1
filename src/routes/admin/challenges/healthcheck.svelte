<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';
	import { mode } from 'mode-watcher';

	let editor: Monaco.editor.IStandaloneCodeEditor;
	let monaco: typeof Monaco;
	let editorContainer: HTMLElement;
	let content =
		`
/**
 * Called at an interval on the server with nodejs. Should
 * return true if the challenge is up. Maximum execution
 * time of 30 seconds.
 */
export async function health(): Promise<boolean> {
	const result = await Rhombus.tcpConnect("pwn.rhombus.gg", 13377);
	if (result.status === "success") {
		return result.value.startsWith("Hello");
	}
	return false;
}
`.trim() + '\n';

	onMount(async () => {
		monaco = (await import('./monaco')).default;

		const source = `
namespace Rhombus {
    const net = require('node:net');

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

		const uri = 'ts:rhombus/tcp.ts';
		monaco.languages.typescript.javascriptDefaults.addExtraLib(source, uri);
		monaco.editor.createModel(source, 'typescript', monaco.Uri.parse(uri));

		const editor = monaco.editor.create(editorContainer);
		const model = monaco.editor.createModel(content, 'typescript');
		monaco.editor.defineTheme('customDark', {
			base: 'vs-dark',
			inherit: true,
			rules: [],
			colors: {
				'editor.background': '#020817' // from tailwindcss's slate-950, the dark theme's background color
			}
		});

		if ($mode === 'dark') {
			monaco.editor.setTheme('customDark');
		} else {
			monaco.editor.setTheme('vs');
		}
		editor.setModel(model);
		editor.updateOptions({
			minimap: { enabled: false },
			scrollBeyondLastLine: false,
			scrollbar: {
				verticalScrollbarSize: 0
			},
			folding: false
		});
		model.onDidChangeContent(() => {
			content = model.getValue();
		});
	});

	mode.subscribe((m) => {
		if (m === 'dark') {
			monaco?.editor.setTheme('customDark');
		} else {
			monaco?.editor.setTheme('vs');
		}
	});

	onDestroy(() => {
		monaco?.editor.getModels().forEach((model) => model.dispose());
		editor?.dispose();
	});
</script>

<div class="h-[300px]" bind:this={editorContainer} />
<input type="hidden" name="healthcheck" bind:value={content} />
