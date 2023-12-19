<script lang="ts">
	import { Separator } from '$lib/components/ui/separator';
</script>

<svelte:head>
	<title>Admin - General</title>
	<meta name="description" content="Manage the CTF." />
</svelte:head>

<div class="flex flex-col gap-4">
	<div>
		<h3 class="text-lg font-medium">General Settings</h3>
		<p class="text-sm text-muted-foreground">Manage the CTF.</p>
	</div>
	<Separator />
	<div class="flex flex-col gap-4">
		<div class="flex flex-col gap-2">Export to CTFTime</div>
	</div>
</div>
