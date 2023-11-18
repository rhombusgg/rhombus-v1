<script lang="ts">
	import { Laptop, Moon, Sun } from 'radix-icons-svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resetMode, setMode } from 'mode-watcher';
	import { Button } from '$lib/components/ui/button';
	import * as Command from '$lib/components/ui/command';
	import Logo from '$lib/components/icons/logo.svelte';
	import { LineChart, LogIn, LogOut, Swords, User, UserPlus, Users } from 'lucide-svelte';

	let open = false;

	onMount(() => {
		function handleKeydown(e: KeyboardEvent) {
			if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				open = true;
			}
		}
		document.addEventListener('keydown', handleKeydown);

		return () => {
			document.removeEventListener('keydown', handleKeydown);
		};
	});

	function runCommand(cmd: () => void) {
		open = false;
		cmd();
	}
</script>

<Button
	variant="outline"
	class="text-muted-foreground relative w-full justify-between bg-transparent text-sm md:w-40 lg:w-64"
	on:click={() => (open = true)}
	{...$$restProps}
>
	<span class="hidden lg:inline-flex">Command palette... </span>
	<span class="inline-flex lg:hidden">Command...</span>
	<kbd
		class="bg-muted pointer-events-none hidden h-5 select-none items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex"
	>
		<span class="text-xs">⌘</span>K
	</kbd>
</Button>
<Command.Dialog bind:open>
	<Command.Input placeholder="Type a command or search" />
	<Command.List>
		<Command.Empty>No results found.</Command.Empty>
		<Command.Group heading="Pages">
			<Command.Item value="challenges" onSelect={() => runCommand(() => goto('/challenges'))}>
				<Swords class="mr-2 h-4 w-4" />
				Challenges
			</Command.Item>
			<Command.Item value="team" onSelect={() => runCommand(() => goto('/team'))}>
				<Users class="mr-2 h-4 w-4" />
				Team
			</Command.Item>
			<Command.Item value="scoreboard" onSelect={() => runCommand(() => goto('/scoreboard'))}>
				<LineChart class="mr-2 h-4 w-4" />
				Scoreboard
			</Command.Item>
			<Command.Item value="home" onSelect={() => runCommand(() => goto('/'))}>
				<Logo class="mr-2 h-4 w-4" />
				Home
			</Command.Item>
			<Command.Item value="account" onSelect={() => runCommand(() => goto('/account'))}>
				<User class="mr-2 h-4 w-4" />
				Account
			</Command.Item>
			<Command.Item value="signin" onSelect={() => runCommand(() => goto('/signin'))}>
				<LogIn class="mr-2 h-4 w-4" />
				Sign in
			</Command.Item>
		</Command.Group>
		<Command.Separator />
		<Command.Group heading="Theme">
			<Command.Item value="light" onSelect={() => runCommand(() => setMode('light'))}>
				<Sun class="mr-2 h-4 w-4" />
				Light
			</Command.Item>
			<Command.Item value="dark" onSelect={() => runCommand(() => setMode('dark'))}>
				<Moon class="mr-2 h-4 w-4" />
				Dark
			</Command.Item>
			<Command.Item value="system" onSelect={() => runCommand(() => resetMode())}>
				<Laptop class="mr-2 h-4 w-4" />
				System
			</Command.Item>
		</Command.Group>
		<Command.Group heading="Account">
			<Command.Item value="logout" onSelect={() => runCommand(() => console.log('logout'))}>
				<LogOut class="mr-2 h-4 w-4" />
				Log Out
			</Command.Item>
		</Command.Group>
		<Command.Group heading="Team">
			<Command.Item value="invite" onSelect={() => runCommand(() => console.log('invite'))}>
				<UserPlus class="mr-2 h-4 w-4" />
				Invite
			</Command.Item>
		</Command.Group>
	</Command.List>
</Command.Dialog>
