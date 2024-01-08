<script lang="ts">
	import Separator from '$lib/components/ui/separator/separator.svelte';
	import Table from './table.svelte';

	export let data;

	$: writeups = data.challenge.writeups.map((writeup) => ({
		writeup
	}));
</script>

<svelte:head>
	<title>Admin - {data.challenge.name} Writeups</title>
	<meta name="description" content="Manage the CTF challenges" />
</svelte:head>

<div class="flex flex-col gap-4">
	<div>
		<h3 class="text-lg font-medium">{data.challenge.name} Writeups</h3>
		<p class="text-sm text-muted-foreground">
			View user submitted {data.challenge.name} writeups.
			<a
				class="font-medium underline underline-offset-4"
				href={`/challenges?challenge=${data.challenge.slug}`}>Focus the challenge</a
			>
		</p>
	</div>
	<Separator />
	<div class="flex flex-col gap-2">
		<Table {writeups} />
	</div>
</div>
