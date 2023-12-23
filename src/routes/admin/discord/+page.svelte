<script lang="ts">
	import { invalidate } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import { RefreshCcw } from 'lucide-svelte';
	import toast from 'svelte-french-toast';
	import Selector from './selector.svelte';

	export let data;
</script>

<svelte:head>
	<title>Admin - Discord Integration</title>
	<meta name="description" content="Configure the integrated discord bot" />
</svelte:head>

<div class="flex flex-col gap-4">
	<div class="flex justify-between">
		<div>
			<h3 class="text-lg font-medium">Discord Integration</h3>
			<p class="text-sm text-muted-foreground">Configure the integrated discord bot</p>
		</div>
		<div>
			<Button
				on:click={async () => {
					await invalidate('app:admin:discord');
					toast.success('Refreshed discord bot');
				}}><RefreshCcw /></Button
			>
		</div>
	</div>
	<Separator />
	<div class="flex flex-col gap-4">
		<div class="flex flex-col gap-2">
			<h4 class="text-sm font-semibold">Guild</h4>
			<p class="text-sm text-muted-foreground">
				Select the guild (server) you want to configure the bot for
			</p>
			<Selector
				options={data.guilds}
				value={data.botSettings?.guildId}
				ui={{
					prompt: 'Select a guild...',
					placeholder: 'Search guilds...',
					none: 'No guilds found.'
				}}
			/>
		</div>
		<div class="flex flex-col gap-2">
			<h4 class="text-sm font-semibold">Support Channel</h4>
			<p class="text-sm text-muted-foreground">Select the text support channel</p>
			<div class="flex gap-2">
				<Selector
					options={data.textChannels}
					value={data.botSettings?.supportChannelId}
					ui={{
						prompt: 'Select a channel ...',
						placeholder: 'Search channels...',
						none: 'No channels found.'
					}}
					onChange={async (channel) => {
						await fetch('/admin/discord?/supportChannel', {
							method: 'POST',
							headers: {
								'Content-Type': 'application/x-www-form-urlencoded'
							},
							body: new URLSearchParams({
								channelId: `${channel.value}`
							})
						});
						await invalidate('app:admin:discord');
					}}
				/>
				<Button
					on:click={async () => {
						if (!data.botSettings?.supportChannelId) {
							toast.error('Select a support channel first');
							return;
						}
						await fetch('/admin/discord?/sendPanel', {
							method: 'POST',
							headers: {
								'Content-Type': 'application/x-www-form-urlencoded'
							}
						});
						await invalidate('app:admin:discord');
						toast.success('Sent support panel');
					}}>Send Panel</Button
				>
			</div>
		</div>
		<div class="flex flex-col gap-2">
			<h4 class="text-sm font-semibold">Verified Role</h4>
			<p class="text-sm text-muted-foreground">Select the role to assign linked users to</p>
			<Selector
				options={data.roles}
				value={data.botSettings?.verifiedRoleId}
				ui={{
					prompt: 'Select a role ...',
					placeholder: 'Search roles...',
					none: 'No roles found.'
				}}
				onChange={async (role) => {
					await fetch('/admin/discord?/verifiedRoleId', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/x-www-form-urlencoded'
						},
						body: new URLSearchParams({
							verifiedRoleId: `${role.value}`
						})
					});
					await invalidate('app:admin:discord');
				}}
			/>
		</div>
	</div>
</div>
