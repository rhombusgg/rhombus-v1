<script lang="ts">
	import { Separator } from '$lib/components/ui/separator';
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
		<a href="challenges/challenge">New challenge</a>
	</div>
</div>
