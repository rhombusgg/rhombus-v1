<script lang="ts">
	import CommandMenu from './command-menu.svelte';
	import MainNav from './main-nav.svelte';
	import ModeToggle from './mode-toggle.svelte';
	import UserNav from './user-nav.svelte';
</script>

<header
	class="supports-[backdrop-filter]:bg-background/60 bg-background/95 sticky top-0 z-50 w-full border-b shadow-sm backdrop-blur"
>
	<div class="container flex h-14 items-center">
		<MainNav />
		<!-- <MobileNav /> -->
		<div class="flex flex-1 items-center justify-between space-x-2 sm:space-x-4 md:justify-end">
			<div class="w-full flex-1 md:w-auto md:flex-none">
				<CommandMenu />
			</div>
			<nav class="flex items-center space-x-2 sm:space-x-4">
				<ModeToggle />
				<UserNav />
			</nav>
		</div>
	</div>
</header>
