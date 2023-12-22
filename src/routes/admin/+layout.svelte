<script lang="ts">
	import SidebarNav from './sidebar-nav.svelte';

	const sidebarNavItems = [
		{
			title: 'General',
			href: '/admin'
		},
		{
			title: 'Discord',
			href: '/admin/discord'
		},
		{
			title: 'Challenges',
			href: '/admin/challenges'
		},
		{
			title: 'Users',
			href: '/admin/users'
		}
	];
</script>

<div class="container">
	<div class="mb-4 mt-4 space-y-0.5">
		<h2 class="text-2xl font-bold tracking-tight">Admin Dashboard</h2>
		<p class="text-muted-foreground">Manage the CTF</p>
	</div>
	<div class="flex flex-col gap-y-8 lg:flex-row lg:space-x-12">
		<aside class="flex flex-col lg:w-1/5">
			<SidebarNav items={sidebarNavItems} />
		</aside>
		<div class="flex-1 lg:max-w-5xl">
			<slot />
		</div>
	</div>
</div>
