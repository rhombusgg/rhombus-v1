<script lang="ts">
	import { Input } from '$lib/components/ui/input';
	import { Separator } from '$lib/components/ui/separator';
	import Selector from './selector.svelte';
	import Healthcheck from './healthcheck.svelte';
	import Name from './name.svelte';
	import Points from './points.svelte';
	import MarkdownEditor from './markdown-editor.svelte';
	import { Button } from '$lib/components/ui/button';
	import { superForm } from 'sveltekit-superforms/client';
	import { goto } from '$app/navigation';
	import toast from 'svelte-french-toast';

	export let data;
	const { form, enhance, errors } = superForm(data.challengeForm, {
		async onUpdated({ form }) {
			if (form.valid) {
				toast.success('Created challenge');
				await goto(`/admin/challenges`);
			}
		}
	});

	$: categoryOptions = data.categories.map((category) => ({ label: category, value: category }));
	$: difficultyOptions = data.difficulties.map((difficulty) => ({
		label: difficulty,
		value: difficulty
	}));

	let category: string | undefined = undefined;
	let difficulty: string | undefined = undefined;
</script>

<svelte:head>
	<title>Admin - New Challenge</title>
	<meta name="description" content="Manage the CTF challenges" />
</svelte:head>

<div class="flex flex-col gap-4">
	<div>
		<h3 class="text-lg font-medium">New Challenge</h3>
		<p class="text-sm text-muted-foreground">Create a new challenge</p>
	</div>
	<Separator />
	<form class="flex flex-col gap-4" method="POST" action="?/createChallenge" use:enhance>
		<div class="setting">
			<div>
				<h4 class="heading">Name</h4>
				<p class="subheading">The name of the challenge</p>
			</div>
			<Name />
			{#if $errors.name}
				<span class="invalid">{$errors.name}</span>
			{/if}
			{#if $errors.slug}
				<span class="invalid">{$errors.slug}</span>
			{/if}
		</div>
		<div class="setting">
			<div>
				<h4 class="heading">Description</h4>
				<p class="subheading">
					Markdown text description and instructions. Should include connection url and details if
					it exists
				</p>
			</div>
			<MarkdownEditor name="description" />
			{#if $errors.description}
				<span class="invalid">{$errors.description}</span>
			{/if}
		</div>
		<div class="setting">
			<div>
				<h4 class="heading">Files</h4>
				<p class="subheading">Relavent or required files</p>
			</div>
		</div>
		<div class="setting">
			<div>
				<h4 class="heading">Health Check</h4>
				<p class="subheading">Write a simple healthcheck in Typescript</p>
			</div>
			<Healthcheck />
			{#if $errors.healthcheck}
				<span class="invalid">{$errors.healthcheck}</span>
			{/if}
		</div>
		<div class="setting">
			<div>
				<h4 class="heading">Issue Template</h4>
				<p class="subheading">
					A markdown template for players to fill out when they submit an issue
				</p>
			</div>
			<MarkdownEditor
				name="issueTemplate"
				content={`# Describe the issue with the challenge\n\n`}
			/>
			{#if $errors.issueTemplate}
				<span class="invalid">{$errors.issueTemplate}</span>
			{/if}
		</div>
		<div class="setting">
			<div>
				<h4 class="heading">Difficulty Level</h4>
				<p class="subheading">How hard you expect the challenge to be</p>
			</div>
			<Selector
				options={difficultyOptions}
				ui={{
					prompt: 'Select a difficulty level ...',
					placeholder: 'Search difficulty levels...',
					none: 'No difficulty levels found.',
					create: 'Create new difficulty level',
					dialog: {
						title: 'Create New Difficulty Level',
						description: 'Add a new category for this challenge.'
					}
				}}
				onChange={(c) => {
					difficulty = c.value;
				}}
			/>
			{#if difficulty}
				<input type="hidden" name="difficulty" value={difficulty} />
			{/if}
			{#if $errors.difficulty}
				<span class="invalid">{$errors.difficulty}</span>
			{/if}
		</div>
		<div class="setting">
			<div>
				<h4 class="heading">Points</h4>
				<p class="subheading">The number of points the challenge is worth</p>
			</div>
			<Points />
			{#if $errors.points}
				<span class="invalid">{$errors.points}</span>
			{/if}
		</div>
		<div class="setting">
			<div>
				<h4 class="heading">Category</h4>
				<p class="subheading">The category of the challenge</p>
			</div>
			<Selector
				options={categoryOptions}
				ui={{
					prompt: 'Select a category ...',
					placeholder: 'Search categories...',
					none: 'No categories found.',
					create: 'Create new category',
					dialog: {
						title: 'Create New Category',
						description: 'Add a new category for this challenge.'
					}
				}}
				onChange={(c) => {
					category = c.value;
				}}
			/>
			{#if category}
				<input type="hidden" name="category" value={category} />
			{/if}
			{#if $errors.category}
				<span class="invalid">{$errors.category}</span>
			{/if}
		</div>
		<div class="setting">
			<div>
				<h4 class="heading">Flag</h4>
				<p class="subheading">The flag for the challenge</p>
			</div>
			<Input type="text" name="flag" autocomplete="off" />
			{#if $errors.flag}
				<span class="invalid">{$errors.flag}</span>
			{/if}
		</div>
		<Button type="submit">Create Challenge</Button>
	</form>
</div>

<style>
	.heading {
		@apply text-sm font-semibold;
	}

	.subheading {
		@apply text-sm text-muted-foreground;
	}

	.setting {
		@apply flex flex-col gap-2;
	}

	.invalid {
		@apply text-red-500;
	}
</style>
