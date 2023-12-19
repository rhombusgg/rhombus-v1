<script lang="ts">
	import { Separator } from '$lib/components/ui/separator';
	import Description from './description.svelte';
	import Healthcheck from './healthcheck.svelte';
	import Name from './name.svelte';
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
		<div>
			<h4 class="heading">Name</h4>
			<p class="subheading">The name of the challenge</p>
			<Name />
		</div>
		<div>
			<h4 class="heading">Description</h4>
			<p class="subheading">
				Markdown text description and instructions. Should include connection url
			</p>
			<Description />
		</div>
		<div>
			<h4 class="heading">Files</h4>
			<p class="subheading">Relavent or required files</p>
		</div>
		<div>
			<h4 class="heading">Health Check</h4>
			<p class="subheading">Write a simple healthcheck</p>
			<Healthcheck />
		</div>
		<div>
			<h4 class="heading">Difficulty</h4>
			<p class="subheading">How hard you expect the challenge to be</p>
		</div>
		<div>
			<h4 class="heading">Points</h4>
			<p class="subheading">The number of points the challenge is worth</p>
		</div>
		<div>
			<h4 class="heading">Category</h4>
			<p class="subheading">The category of the challenge</p>
		</div>
		<div>
			<h4 class="heading">Flag</h4>
			<p class="subheading">The flag for the challenge</p>
		</div>
	</div>
</div>

<style>
	.heading {
		@apply text-sm font-semibold;
	}

	.subheading {
		@apply text-sm text-muted-foreground;
	}
</style>
