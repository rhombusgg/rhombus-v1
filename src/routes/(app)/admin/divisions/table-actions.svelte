<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Pencil, Sparkle, Sparkles, Trash2 } from 'lucide-svelte';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { goto, invalidate } from '$app/navigation';
	import toast from 'svelte-french-toast';

	export let id: string;
	export let isDefault: boolean;
	export let isDeletable: boolean;
</script>

<div class="flex items-center">
	{#if isDefault}
		<Tooltip.Root>
			<Tooltip.Trigger>
				<div class="inline-flex h-8 w-8 items-center justify-center p-0">
					<Sparkles class="h-4 w-4" />
				</div>
			</Tooltip.Trigger>
			<Tooltip.Content>
				<p>Default division for new users</p>
			</Tooltip.Content>
		</Tooltip.Root>
	{:else}
		<Tooltip.Root>
			<Tooltip.Trigger>
				<Button
					variant="ghost"
					class="h-8 w-8 p-0"
					on:click={async () => {
						await fetch('/admin/divisions/api/setDefault', {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json'
							},
							body: JSON.stringify({
								divisionId: id
							})
						});
						await invalidate('divisions');
						toast.success('Set default division');
					}}
				>
					<Sparkle class="h-4 w-4" />
				</Button>
			</Tooltip.Trigger>
			<Tooltip.Content>
				<p>Set as default</p>
			</Tooltip.Content>
		</Tooltip.Root>
	{/if}
	<Tooltip.Root>
		<Tooltip.Trigger>
			<Button variant="ghost" class="h-8 w-8 p-0" on:click={() => goto(`?division=${id}`)}>
				<Pencil class="h-4 w-4" />
			</Button>
		</Tooltip.Trigger>
		<Tooltip.Content>
			<p>Edit</p>
		</Tooltip.Content>
	</Tooltip.Root>
	{#if isDeletable}
		<Tooltip.Root>
			<Tooltip.Trigger asChild let:builder>
				<Button
					variant="ghost"
					builders={[builder]}
					class="h-8 w-8 p-0"
					on:click={async () => {
						await fetch('/admin/divisions/api/delete', {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json'
							},
							body: JSON.stringify({
								divisionId: id
							})
						});
						await invalidate('divisions');
						toast.success('Deleted division');
					}}
				>
					<Trash2 class="h-4 w-4" />
				</Button>
			</Tooltip.Trigger>
			<Tooltip.Content>
				<p>Delete</p>
			</Tooltip.Content>
		</Tooltip.Root>
	{/if}
</div>
