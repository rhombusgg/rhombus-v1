<script lang="ts">
	import { PlusCircled } from 'radix-icons-svelte';
	import { writable, type Writable } from 'svelte/store';
	import { Separator } from '$lib/components/ui/separator';
	import { Button } from '$lib/components/ui/button';
	import Table from './table.svelte';
	import Category from './category.svelte';
	import CategoryDialog from './categoryDialog.svelte';

	export let data;

	$: challenges = data.challenges.map((challenge) => ({
		challenge: {
			...challenge,
			isDeletable: data.challenges.length > 1
		}
	}));

	$: inUseCategories = data.challenges
		.map((challenge) => challenge.category)
		.filter((category, index, self) => self.indexOf(category) === index);

	let dialogOpen = writable(false);
	let categoryStore: Writable<
		| {
				id: string;
				name: string;
				color: string;
		  }
		| undefined
	> = writable(undefined);
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

	<div>
		<Button href="challenges/editor"
			><PlusCircled class="mr-2 h-4 w-4" />Create new challenge</Button
		>
	</div>

	<div class="flex gap-2">
		{#each data.categories as category}
			<Category
				{category}
				inUse={inUseCategories.map((c) => c.id).includes(category.id)}
				{dialogOpen}
				{categoryStore}
			/>
		{/each}
		<Button
			on:click={() => {
				$categoryStore = undefined;
				$dialogOpen = true;
			}}><PlusCircled class="mr-2 h-4 w-4" />Create new category</Button
		>
	</div>

	<Table {challenges} {dialogOpen} {categoryStore} />
	<CategoryDialog categoryForm={data.categoryForm} {dialogOpen} category={categoryStore} />
</div>
