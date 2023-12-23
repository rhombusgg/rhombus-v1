<script>
	import { page } from '$app/stores';
</script>

{#if $page.status === 404}
	<div class="flex flex-1 items-center justify-center">
		<div class="text-center">
			<h1>User not found</h1>
			<h2>
				Go to <a href="/team" class="font-medium underline underline-offset-4">your team</a>.
			</h2>
		</div>
	</div>
{/if}
