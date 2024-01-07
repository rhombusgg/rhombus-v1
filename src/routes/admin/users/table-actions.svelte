<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import { MoreHorizontal, ShieldAlert, Trash2, User, Users } from 'lucide-svelte';
	import DropdownMenuItem from '$lib/components/ui/dropdown-menu/dropdown-menu-item.svelte';
	import { DiscordLogo } from 'radix-icons-svelte';

	export let user: {
		id: string;
		isAdmin: boolean;
		emails: string[];
		team: {
			name: string;
			id: string;
		};
		discord:
			| {
					id: string;
					username: string;
					globalUsername: string;
					image: string;
			  }
			| undefined;
		ips: string[];
	};
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger asChild let:builder>
		<Button variant="ghost" builders={[builder]} size="icon" class="relative h-8 w-8 p-0">
			<span class="sr-only">Open menu</span>
			<MoreHorizontal class="h-4 w-4" />
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenuItem href={`/user/${user.id}`}
			><User class="mr-2 h-4 w-4" />Go to User profile</DropdownMenuItem
		>
		<DropdownMenuItem href={`/team/${user.team.id}`}
			><Users class="mr-2 h-4 w-4" />Go to Team profile</DropdownMenuItem
		>
		{#if user.discord}
			<DropdownMenuItem href={`https://discord.com/users/${user.discord.id}`}
				><DiscordLogo class="mr-2 h-4 w-4" />Message User</DropdownMenuItem
			>
		{/if}
		<DropdownMenu.Separator />
		<DropdownMenu.Item><ShieldAlert class="mr-2 h-4 w-4" /> Make Admin</DropdownMenu.Item>
		<DropdownMenu.Item><Trash2 class="mr-2 h-4 w-4" /> Delete</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
