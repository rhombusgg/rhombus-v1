<script lang="ts">
	import { Check, ChevronsUpDown } from 'lucide-svelte';
	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	import { tick } from 'svelte';
	import { PlusCircled } from 'radix-icons-svelte';
	import { Input } from '$lib/components/ui/input';

	export let options: { label: string; value: string }[] = [];
	type Option = (typeof options)[0];
	export let initial: string | undefined;
	let value = initial;
	export let ui: {
		prompt: string;
		placeholder: string;
		create: string;
		none: string;
		dialog: { title: string; description: string };
	} = {
		prompt: 'Select an option...',
		placeholder: 'Search options...',
		none: 'No options found.',
		create: 'Create new',
		dialog: {
			title: 'Create new option',
			description: 'Add a new option'
		}
	};
	export let onChange: ((option: Option) => void) | ((option: Option) => Promise<void>) = () => {};

	if (initial) onChange({ label: initial, value: initial });

	let showCreateDialog = false;
	let open = false;
	let newOption = '';
	$: selectedValue = options.find((f) => f.value === value)?.label ?? ui.prompt;

	function closeAndFocusTrigger(triggerId: string, option: Option) {
		open = false;
		tick().then(async () => {
			document.getElementById(triggerId)?.focus();
			await onChange(option);
		});
	}
</script>

<Dialog.Root bind:open={showCreateDialog}>
	<Popover.Root bind:open let:ids>
		<Popover.Trigger asChild let:builder>
			<Button
				builders={[builder]}
				variant="outline"
				role="combobox"
				aria-expanded={open}
				class="w-[300px] justify-between"
			>
				{selectedValue}
				<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
			</Button>
		</Popover.Trigger>
		<Popover.Content class="w-[300px] p-0">
			<Command.Root
				filter={(value, search) => {
					newOption = search;
					const option = options.find((f) => f.value === value);
					if (!search || !value || !option) return 1;
					return option.label.toLowerCase().includes(search) ? 1 : 0;
				}}
			>
				<Command.Input placeholder={ui.placeholder} />
				<Command.Empty>{ui.none}</Command.Empty>
				<Command.Group>
					{#each options as option}
						<Command.Item
							value={option.value}
							onSelect={(currentValue) => {
								value = currentValue;
								closeAndFocusTrigger(ids.trigger, option);
							}}
						>
							<Check class={cn('mr-2 h-4 w-4', value !== option.value && 'text-transparent')} />
							{option.label}
						</Command.Item>
					{/each}
				</Command.Group>
				<Command.Separator />
				<Command.Group>
					<Command.Item
						onSelect={() => {
							open = false;
							showCreateDialog = true;
						}}
					>
						<PlusCircled class="mr-2 h-4 w-4" />
						{ui.create}
					</Command.Item>
				</Command.Group>
			</Command.Root>
		</Popover.Content>
	</Popover.Root>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>{ui.dialog.title}</Dialog.Title>
			<Dialog.Description>{ui.dialog.description}</Dialog.Description>
		</Dialog.Header>
		<form
			class="flex gap-2"
			method="dialog"
			on:submit={async () => {
				const option = { label: newOption, value: newOption };
				options.push(option);
				value = newOption;
				showCreateDialog = false;
				await onChange(option);
			}}
		>
			<Input bind:value={newOption} autocomplete="off" />
			<Button>Create</Button>
		</form>
	</Dialog.Content>
</Dialog.Root>
