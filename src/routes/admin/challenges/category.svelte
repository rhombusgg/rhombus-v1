<script lang="ts">
	import { Pencil, Trash2 } from 'lucide-svelte';
	import type { Writable } from 'svelte/store';
	import clsx from 'clsx';

	export let category: {
		id: string;
		name: string;
		color: string;
	};

	export let inUse: boolean = true;

	export let dialogOpen: Writable<boolean>;
	export let categoryStore: Writable<
		| {
				id: string;
				name: string;
				color: string;
		  }
		| undefined
	>;
</script>

<div
	class={clsx(
		'group flex items-center justify-between gap-3 rounded-md p-2 font-bold',
		inUse || 'opacity-50'
	)}
	style:background-color={category.color}
>
	<Trash2 class="h-4 w-4 opacity-0 duration-100 group-hover:opacity-100" />
	<span class="cursor-default">
		{category.name}
	</span>
	<button
		on:click={() => {
			$categoryStore = category;
			$dialogOpen = true;
		}}
	>
		<Pencil class="h-4 w-4 opacity-0 duration-100 group-hover:opacity-100" />
	</button>
</div>
