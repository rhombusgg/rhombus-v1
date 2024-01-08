<script lang="ts">
	import { Separator } from '$lib/components/ui/separator';
	import Table from './table.svelte';

	export let data;

	$: challenges = data.challenges.map((challenge) => ({
		challenge: {
			...challenge,
			isDeletable: data.challenges.length > 1
		}
	}));
</script>

<svelte:head>
	<title>Admin - Challenges</title>
	<meta name="description" content="Manage the CTF challenges" />
</svelte:head>

<div class="flex flex-col gap-4">
	<div>
		<h3 class="text-lg font-medium">Challenges</h3>
		<p class="text-sm text-muted-foreground">Manage the CTF challenges</p>
	</div>
	<Separator />

	<div class="flex flex-col gap-4">
		<a href="challenges/editor">New challenge</a>
	</div>
	<p>Flag Format</p>
	<p>Round robin health checks</p>

	<Table {challenges} />
</div>
