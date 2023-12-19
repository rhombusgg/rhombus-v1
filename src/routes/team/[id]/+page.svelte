<script lang="ts">
	export let data;
</script>

<svelte:head>
	<title>Team {data.team?.name}</title>
	<meta name="description" content={`${data.team?.name} public profile`} />
</svelte:head>

<div class="container">
	<div class="mb-4 mt-4 space-y-0.5">
		<h2 class="text-2xl font-bold tracking-tight">Team {data.team?.name}</h2>
		<p class="text-muted-foreground">Public team profile</p>
	</div>
</div>
