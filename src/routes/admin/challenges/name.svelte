<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { slug } from 'github-slugger';

	let name: string;
</script>

<div class="flex items-center gap-2">
	<Input class="w-72" type="text" name="name" autocomplete="off" bind:value={name} />
	<div class="text-sm text-muted-foreground">slug: {slug(name)}</div>
</div>
