<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Button } from '$lib/components/ui/button';
	import { LogOut, User, Users } from 'lucide-svelte';
	import { signOut } from '$lib/auth/auth';
	import { page } from '$app/stores';
	import clsx from 'clsx';
</script>

{#if $page.data.session}
	<DropdownMenu.Root positioning={{ placement: 'bottom-end' }}>
		<DropdownMenu.Trigger asChild let:builder>
			<Button variant="ghost" builders={[builder]} class="relative h-8 w-8 rounded-full">
				<Avatar.Root class="h-8 w-8">
					<Avatar.Image
						src={$page.data.session.discord?.image}
						alt={`@${$page.data.session.discord?.globalUsername}`}
					/>
					<Avatar.Fallback>{$page.data.session.avatarFallback}</Avatar.Fallback>
				</Avatar.Root>
			</Button>
		</DropdownMenu.Trigger>
		<DropdownMenu.Content class="w-56">
			<DropdownMenu.Label class="font-normal">
				<div class="flex flex-col space-y-1">
					{#if $page.data.session.discord}
						<p class="text-sm font-medium leading-none">
							{$page.data.session.discord.username}
						</p>
						<p class="text-xs leading-none text-muted-foreground">
							{`@${$page.data.session.discord.globalUsername}`}
						</p>
						{#each $page.data.session.emails as email}
							<p class="text-xs leading-none text-muted-foreground">
								{email}
							</p>
						{/each}
					{:else}
						{#each $page.data.session.emails as email, i}
							<p
								class={clsx(
									i == 0
										? 'text-sm font-medium leading-none'
										: 'text-xs leading-none text-muted-foreground'
								)}
							>
								{email}
							</p>
						{/each}
					{/if}
				</div>
			</DropdownMenu.Label>
			<DropdownMenu.Separator />
			<DropdownMenu.Item href="/account"><User class="mr-2 h-4 w-4" /> Account</DropdownMenu.Item>
			<DropdownMenu.Item href="/team"><Users class="mr-2 h-4 w-4" /> Team</DropdownMenu.Item>
			<DropdownMenu.Item on:click={() => signOut()}
				><LogOut class="mr-2 h-4 w-4" /> Sign out</DropdownMenu.Item
			>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
{/if}
