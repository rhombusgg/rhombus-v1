<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';
	import { mode } from 'mode-watcher';

	let editor: Monaco.editor.IStandaloneCodeEditor;
	let monaco: typeof Monaco;
	let editorContainer: HTMLElement;
	export let initial: string | undefined;
	export let none = '';
	let content = initial || none;
	export let name: string;

	onMount(async () => {
		monaco = (await import('./monaco')).default;

		const editor = monaco.editor.create(editorContainer);
		const model = monaco.editor.createModel(content, 'markdown');
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
			wordWrap: 'on',
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

<div class="h-[150px]" bind:this={editorContainer} />
<input type="hidden" {name} bind:value={content} />
