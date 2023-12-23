<script>
	import Map from './map.svelte';

	export let data;
</script>

<div class="container">
	<div class="mb-4 mt-4 space-y-0.5">
		<h2 class="text-2xl font-bold tracking-tight">
			User {data.display.type === 'discord' ? data.display.username : data.display.email}
		</h2>
		<p class="text-muted-foreground">Public user profile</p>
	</div>
	<div class="mb-4">
		On team <a class="font-medium underline underline-offset-4" href={`/team/${data.team.id}`}
			>{data.team.name}</a
		>
	</div>
	{#if data.admin}
		<div class="mb-4 font-mono text-xl font-medium text-red-500">Admin Only ▼</div>
		<Map ips={data.admin.ips} />
	{/if}
</div>
