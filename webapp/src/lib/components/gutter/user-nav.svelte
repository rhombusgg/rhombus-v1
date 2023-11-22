<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Button } from '$lib/components/ui/button';
	import { LogOut, User } from 'lucide-svelte';
	import { signOut } from '$lib/clientAuth';
	import { page } from '$app/stores';
</script>

{#if $page.data.session}
	<DropdownMenu.Root positioning={{ placement: 'bottom-end' }}>
		<DropdownMenu.Trigger asChild let:builder>
			<Button variant="ghost" builders={[builder]} class="relative h-8 w-8 rounded-full">
				<Avatar.Root class="h-8 w-8">
					<Avatar.Image
						src={$page.data.session?.discord?.image}
						alt={`@${$page.data.session?.discord?.globalUsername}`}
					/>
					<Avatar.Fallback>{$page.data.session?.avatarFallback}</Avatar.Fallback>
				</Avatar.Root>
			</Button>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content class="w-56">
			<DropdownMenu.Label class="font-normal">
				<div class="flex flex-col space-y-1">
					<p class="text-sm font-medium leading-none">
						{$page.data.session?.discord?.username}
					</p>
					<p class="text-muted-foreground text-xs leading-none">
						{`@${$page.data.session?.discord?.globalUsername}`}
					</p>
				</div>
			</DropdownMenu.Label>
			<DropdownMenu.Separator />
			<DropdownMenu.Item href="/account"><User class="mr-2 h-4 w-4" /> Account</DropdownMenu.Item>
			<DropdownMenu.Item on:click={() => signOut()}
				><LogOut class="mr-2 h-4 w-4" /> Sign out</DropdownMenu.Item
			>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
{/if}
