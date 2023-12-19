<script lang="ts">
	import { page } from '$app/stores';
	import Logo from '$lib/components/icons/logo.svelte';
	import { cn } from '$lib/utils';
</script>

<div class="mr-4 hidden md:flex">
	<a href="/" class="mr-6 flex items-center space-x-2">
		<Logo class="h-8 w-8" />
		<span class="hidden text-[15px] font-bold sm:inline-block lg:text-base">Rhombus</span>
	</a>
	<nav class="flex items-center space-x-6 text-sm font-medium">
		<a
			href="/scoreboard"
			class={cn(
				'transition-colors hover:text-foreground/80',
				$page.url.pathname === '/scoreboard' ? 'text-foreground' : 'text-foreground/60'
			)}
		>
			Scoreboard
		</a>
		{#if $page.data.session}
			<a
				href="/challenges"
				class={cn(
					'transition-colors hover:text-foreground/80',
					$page.url.pathname === '/challenges' ? 'text-foreground' : 'text-foreground/60'
				)}
			>
				Challenges
			</a>
			<a
				href="/team"
				class={cn(
					'transition-colors hover:text-foreground/80',
					$page.url.pathname === '/team' ? 'text-foreground' : 'text-foreground/60'
				)}
			>
				Team
			</a>
			<a
				href="/account"
				class={cn(
					'transition-colors hover:text-foreground/80',
					$page.url.pathname === '/account' ? 'text-foreground' : 'text-foreground/60'
				)}
			>
				Account
			</a>
			{#if $page.data.session.isAdmin}
				<a
					href="/admin"
					class={cn(
						'transition-colors hover:text-foreground/80',
						$page.url.pathname === '/admin' ? 'text-foreground' : 'text-foreground/60'
					)}
				>
					Admin
				</a>
			{/if}
		{:else}
			<a
				href="/signin"
				class={cn(
					'transition-colors hover:text-foreground/80',
					$page.url.pathname === '/signin' ? 'text-foreground' : 'text-foreground/60'
				)}
			>
				Sign In
			</a>
		{/if}
	</nav>
</div>
