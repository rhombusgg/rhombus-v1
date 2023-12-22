<script lang="ts">
	import Logo from '$lib/components/icons/logo.svelte';
</script>

<footer class="py-6 md:px-8 md:py-0">
	<div class="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
		<div class="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
			<Logo class="hidden h-6 w-6 md:inline-block" />
			<p class="text-center text-sm leading-loose text-muted-foreground md:text-left">
				The source code is available on{' '}
				<a
					href="https://github.com/rhombusgg/rhombus"
					target="_blank"
					class="font-medium underline underline-offset-4">GitHub</a
				>.
			</p>
		</div>
	</div>
</footer>
