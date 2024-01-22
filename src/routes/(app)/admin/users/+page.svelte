<script lang="ts">
	import { Separator } from '$lib/components/ui/separator';
	import Table from './table.svelte';

	export let data;
</script>

<svelte:head>
	<title>Admin - Users</title>
	<meta name="description" content="Inspect signed up users" />
</svelte:head>

<div class="flex flex-col gap-4">
	<div>
		<h3 class="text-lg font-medium">Users</h3>
		<p class="text-sm text-muted-foreground">Inspect signed up users</p>
	</div>
	<Separator />

	<Table users={data.users} />
</div>
