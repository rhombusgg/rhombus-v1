<script lang="ts">
	import { Check, ChevronsUpDown } from 'lucide-svelte';
	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';
	import { Button } from '$lib/components/ui/button';
	import { cn } from '$lib/utils';
	import { tick } from 'svelte';

	export let roles: { label: string; value: string }[] = [];
	export let roleId: string | undefined = undefined;

	const makeValue = (channel: (typeof roles)[0] | undefined) =>
		channel && `${channel.label}-${channel.value}`;

	let open = false;
	$: value = makeValue(roles.find((f) => f.value === roleId));
	$: selectedValue = roles.find((f) => makeValue(f) === value)?.label ?? 'Select a role...';

	function closeAndFocusTrigger(triggerId: string, role: (typeof roles)[0]) {
		open = false;
		tick().then(() => {
			document.getElementById(triggerId)?.focus();
			fetch('/admin?/verifiedRoleId', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				},
				body: new URLSearchParams({
					verifiedRoleId: `${role.value}`
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
			<Command.Input placeholder="Search roles..." />
			<Command.Empty>No roles found.</Command.Empty>
			<Command.Group>
				{#each roles as role}
					<Command.Item
						value={makeValue(role)}
						onSelect={(currentValue) => {
							value = currentValue;
							closeAndFocusTrigger(ids.trigger, role);
						}}
					>
						<Check class={cn('mr-2 h-4 w-4', value !== role.value && 'text-transparent')} />
						{role.label}
					</Command.Item>
				{/each}
			</Command.Group>
		</Command.Root>
	</Popover.Content>
</Popover.Root>
