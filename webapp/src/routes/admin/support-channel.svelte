<script lang="ts">
	import { Check, ChevronsUpDown } from 'lucide-svelte';
	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	import { tick } from 'svelte';

	export let channels: { label: string; value: string }[] = [];
	export let channelId: string | undefined = undefined;

	const makeValue = (channel: (typeof channels)[0] | undefined) =>
		channel && `${channel.label}-${channel.value}`;

	let open = false;
	$: value = makeValue(channels.find((f) => f.value === channelId));
	$: selectedValue = channels.find((f) => makeValue(f) === value)?.label ?? 'Select a channel...';

	function closeAndFocusTrigger(triggerId: string, channel: (typeof channels)[0]) {
		open = false;
		tick().then(() => {
			document.getElementById(triggerId)?.focus();
			fetch('/admin?/supportChannel', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: new URLSearchParams({
					channelId: `${channel.value}`
				})
			});
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
		<Command.Root>
			<Command.Input placeholder="Search channels..." />
			<Command.Empty>No channels found.</Command.Empty>
			<Command.Group>
				{#each channels as channel}
					<Command.Item
						value={makeValue(channel)}
						onSelect={(currentValue) => {
							value = currentValue;
							closeAndFocusTrigger(ids.trigger, channel);
						}}
					>
						<Check class={cn('mr-2 h-4 w-4', value !== channel.value && 'text-transparent')} />
						{channel.label}
					</Command.Item>
				{/each}
			</Command.Group>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
