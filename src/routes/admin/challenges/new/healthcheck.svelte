<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';
	import { mode } from 'mode-watcher';
	import * as Select from '$lib/components/ui/select';
	import { Label } from '$lib/components/ui/label';

	let editor: Monaco.editor.IStandaloneCodeEditor;
	let model: Monaco.editor.ITextModel;
	let monaco: typeof Monaco;
	let editorContainer: HTMLElement;
	let selected: 'http' | 'tcp' | 'none' = 'http';

	const httpTemplate =
		`
/**
 * Called at an interval on the server with nodejs. Should
 * return true if the challenge is up. Maximum execution
 * time of 30 seconds.
 */
export async function health(): Promise<boolean> {
	const result = await fetch("https://webchallenge.pwn.rhombus.gg");
	return result.status === 200;
}
`.trim() + '\n';

	const tcpTemplate =
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

	let content = httpTemplate;

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

		editor = monaco.editor.create(editorContainer);
		model = monaco.editor.createModel(content, 'typescript');
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

	function selectChange(value: any) {
		selected = value.value;
		if (selected === 'http') {
			content = httpTemplate;
		} else if (selected === 'tcp') {
			content = tcpTemplate;
		} else if (selected === 'none') {
			content = '';
		}
		model.setValue(content);
	}
</script>

<div class="flex items-center gap-x-2">
	<Select.Root onSelectedChange={selectChange} selected={{ value: 'http', label: 'HTTP' }}>
		<Select.Trigger class="w-[180px]" id="healthcheck">
			<Select.Value />
		</Select.Trigger>
		<Select.Content>
			<Select.Item class="cursor-pointer" value="http">HTTP</Select.Item>
			<Select.Item class="cursor-pointer" value="tcp">TCP/Netcat</Select.Item>
			<Select.Item class="cursor-pointer" value="none">No healthcheck</Select.Item>
		</Select.Content>
	</Select.Root>
	<Label
		id="healthcheck-label"
		for="healthcheck"
		class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
	>
		Healthcheck Template
	</Label>
</div>
<div class="h-[300px]" bind:this={editorContainer} hidden={selected === 'none'} />
<input type="hidden" name="healthcheck" bind:value={content} />
