<script lang="ts">
	import { Check, ChevronsUpDown } from 'lucide-svelte';
	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	import { tick } from 'svelte';

	export let options: { label: string; value: string }[] = [];
	type Option = (typeof options)[0];
	export let value: string | null | undefined = undefined;
	export let ui: { prompt: string; placeholder: string; none: string } = {
		prompt: 'Select an option...',
		placeholder: 'Search options...',
		none: 'No options found.'
	};
	export let onChange: ((option: Option) => void) | ((option: Option) => Promise<void>) = () => {};

	let open = false;
	$: selectedValue = options.find((f) => f.value === value)?.label ?? ui.prompt;

	function closeAndFocusTrigger(triggerId: string, option: Option) {
		open = false;
		tick().then(async () => {
			document.getElementById(triggerId)?.focus();
			await onChange(option);
		});
	}
</script>

<Popover.Root bind:open let:ids>
	<Popover.Trigger asChild let:builder>
		<Button
			builders={[builder]}
			variant="outline"
			role="combobox"
			aria-expanded={open}
			class="w-[200px] justify-between"
		>
			{selectedValue}
			<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
		</Button>
	</Popover.Trigger>
	<Popover.Content class="w-[200px] p-0">
		<Command.Root
			filter={(value, search) => {
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
		</Command.Root>
	</Popover.Content>
</Popover.Root>
