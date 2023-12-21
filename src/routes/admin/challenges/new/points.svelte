<script lang="ts">
	import { Label } from '$lib/components/ui/label';
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { Input } from '$lib/components/ui/input';

	let checked = true;
	let value = 50;
</script>

<div class="flex flex-col gap-2">
	<div class="flex items-center gap-x-2">
		<Checkbox id="dynamic-scale" bind:checked aria-labelledby="dynamic-scale-label" />
		<Label
			id="dynamic-scale-label"
			for="dynamic-scale"
			class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
		>
			Dynamically scaled challenge
		</Label>
	</div>

	{#if !checked}
		<Input class="w-72" type="number" name="points" min="0" bind:value autocomplete="off" />
	{/if}
</div>
