<script lang="ts">
	import { page } from '$app/stores';
	import { Separator } from '$lib/components/ui/separator';
	import Table from './table.svelte';
	import Edit from './edit.svelte';

	export let data;

	$: divs = data.divisions.map((division) => ({
		division: {
			...division,
			isDeletable: data.divisions.length > 1
		}
	}));

	$: edit = $page.url.searchParams.get('division');
	$: existingDivision = data.divisions.find((d) => d.id === edit);
</script>

<svelte:head>
	<title>Admin - Divisions</title>
	<meta name="description" content="Manage divisions to split users into different scoreboards" />
</svelte:head>

<div class="flex flex-col gap-4">
	<div>
		<h3 class="text-lg font-medium">Divisions</h3>
		<p class="text-sm text-muted-foreground">
			Manage divisions to split users into different scoreboards
		</p>
	</div>
	<Separator />

	<Table divisions={divs} />
	<Edit open={!!edit} form={data.form} {existingDivision} />
</div>
