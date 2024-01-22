<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { slug as slugger } from 'github-slugger';

	export let initial: string | undefined;
	let name: string = initial || '';

	$: slug = slugger(name);
</script>

<div class="flex items-center gap-2">
	<Input class="w-72" type="text" name="name" autocomplete="off" bind:value={name} />
	<input type="hidden" name="slug" value={slug} />
	<div class="text-sm text-muted-foreground">slug: {slug}</div>
</div>
