<script lang="ts">
	import { tick } from 'svelte';
	import { Check, ChevronsUpDown } from 'lucide-svelte';
	import type { SuperValidated } from 'sveltekit-superforms';
	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { cn } from '$lib/utils';
	import type { CategoryFormSchema } from './+page.server';
	import { superForm } from 'sveltekit-superforms/client';
	import clsx from 'clsx';
	import toast from 'svelte-french-toast';
	import type { Writable } from 'svelte/store';

	export let category: Writable<
		| {
				id: string;
				name: string;
				color: string;
		  }
		| undefined
	>;

	const colors = [
		{
			label: 'Red',
			value: '#ef4444'
		},
		{
			label: 'Orange',
			value: '#f97316'
		},
		{
			label: 'Yellow',
			value: '#eab308'
		},
		{
			label: 'Lime',
			value: '#84cc16'
		},
		{
			label: 'Green',
			value: '#22c55e'
		},
		{
			label: 'Teal',
			value: '#14b8a6'
		},
		{
			label: 'Cyan',
			value: '#06b6d4'
		},
		{
			label: 'Blue',
			value: '#3b82f6'
		},
		{
			label: 'Indigo',
			value: '#6366f1'
		},
		{
			label: 'Purple',
			value: '#a855f7'
		},
		{
			label: 'Pink',
			value: '#ec4899'
		}
	];

	export let categoryForm: SuperValidated<CategoryFormSchema>;
	const { form, enhance, errors, constraints, reset } = superForm(categoryForm, {
		onUpdate({ form }) {
			if (form.message) {
				toast.error(form.message);
			}
			if (form.valid) {
				toast.success('Updated category!');
				$dialogOpen = false;
			}
		}
	});

	export let dialogOpen: Writable<boolean>;
	let colorSelectorOpen = false;
	$: value = $category?.color;

	$: selected = colors.find((f) => f.value === value) ?? {
		label: 'color...',
		value: undefined
	};

	function closeAndFocusTrigger(triggerId: string) {
		colorSelectorOpen = false;
		tick().then(() => {
			document.getElementById(triggerId)?.focus();
		});
	}

	dialogOpen.subscribe((isOpen) => {
		if (isOpen) {
			reset({ data: $category });
			value = $category?.color;
		}
	});
</script>

<Dialog.Root bind:open={$dialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>{$category ? 'Edit' : 'Create'} Category</Dialog.Title>
		</Dialog.Header>
		<form use:enhance method="POST" action="?/category" class="flex gap-2">
			<Input
				autocomplete="off"
				placeholder="category name..."
				name="name"
				aria-invalid={$errors.name ? 'true' : undefined}
				{...$constraints.name}
				bind:value={$form.name}
				class={clsx($errors.name && 'border-red-500')}
			/>

			<Popover.Root bind:open={colorSelectorOpen} let:ids>
				<Popover.Trigger asChild let:builder>
					<Button
						builders={[builder]}
						variant="outline"
						role="combobox"
						aria-expanded={colorSelectorOpen}
						class={clsx('w-[300px] justify-between', $errors.color && 'border-red-500')}
					>
						<div class="flex items-center">
							<div
								class="mr-2 h-4 w-4 rounded-full"
								style:background-color={selected.value || '#94a3b8'}
							/>
							{selected.label}
						</div>
						<ChevronsUpDown class="h-4 w-4 shrink-0 opacity-50" />
					</Button>
				</Popover.Trigger>
				<Popover.Content class="w-[200px] p-0">
					<Command.Root
						loop
						filter={(value, search) => {
							const color = colors.find((f) => f.value === value);
							return color?.label.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
						}}
					>
						<Command.Input placeholder="Search colors..." />
						<Command.Empty>No color found.</Command.Empty>
						<Command.Group>
							{#each colors as color}
								<Command.Item
									value={color.value}
									onSelect={(currentValue) => {
										value = currentValue;
										closeAndFocusTrigger(ids.trigger);
									}}
									class="flex justify-between"
								>
									<div class="flex items-center">
										<div class="mr-2 h-4 w-4 rounded-full" style:background-color={color.value} />
										{color.label}
									</div>
									<Check class={cn('h-4 w-4', value !== color.value && 'text-transparent')} />
								</Command.Item>
							{/each}
						</Command.Group>
					</Command.Root>
				</Popover.Content>
			</Popover.Root>
			<input type="hidden" name="color" value={selected.value} />
			{#if $category}
				<input type="hidden" name="existingId" value={$category.id} />
			{/if}
			<Button type="submit">{$category ? 'Edit' : 'Create'}</Button>
		</form>
	</Dialog.Content>
</Dialog.Root>
