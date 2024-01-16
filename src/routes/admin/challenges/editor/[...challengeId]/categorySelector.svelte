<script lang="ts">
	import { Check, ChevronsUpDown } from 'lucide-svelte';
	import { tick } from 'svelte';
	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	import type { Writable } from 'svelte/store';

	type Category = {
		id: string;
		name: string;
		color: string;
	};

	export let categories: Category[];
	export let category: Writable<Category | undefined>;

	export let initial: Category | undefined;

	let value: string = initial?.id ?? '';
	$: selected = categories.find((c) => c.id === value) ?? {
		name: 'category...',
		color: undefined,
		id: undefined
	};
	$: $category = selected.id ? selected : undefined;

	let categorySelectorOpen = false;

	function closeAndFocusTrigger(triggerId: string) {
		categorySelectorOpen = false;
		tick().then(() => {
			document.getElementById(triggerId)?.focus();
		});
	}
</script>

<Popover.Root bind:open={categorySelectorOpen} let:ids>
	<Popover.Trigger asChild let:builder>
		<Button
			builders={[builder]}
			variant="outline"
			role="combobox"
			aria-expanded={categorySelectorOpen}
			class="w-[300px] justify-between"
		>
			<div class="flex items-center">
				<div
					class="mr-2 h-4 w-4 rounded-full"
					style:background-color={selected.color || '#94a3b8'}
				/>
				{selected.name}
			</div>
			<ChevronsUpDown class="h-4 w-4 shrink-0 opacity-50" />
		</Button>
	</Popover.Trigger>
	<Popover.Content class="w-[300px] p-0">
		<Command.Root
			loop
			filter={(value, search) => {
				const category = categories.find((c) => c.id === value);
				return category?.name.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
			}}
		>
			<Command.Input placeholder="Search categories..." />
			<Command.Empty>No category found.</Command.Empty>
			<Command.Group>
				{#each categories as category}
					<Command.Item
						value={category.id}
						onSelect={(currentValue) => {
							value = currentValue;
							closeAndFocusTrigger(ids.trigger);
						}}
						class="flex justify-between"
					>
						<div class="flex items-center">
							<div class="mr-2 h-4 w-4 rounded-full" style:background-color={category.color} />
							{category.name}
						</div>
						<Check class={cn('h-4 w-4', value !== category.id && 'text-transparent')} />
					</Command.Item>
				{/each}
			</Command.Group>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
