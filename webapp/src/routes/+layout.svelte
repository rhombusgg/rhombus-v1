<script>
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from 'svelte-french-toast';
	import SiteHeader from '$lib/components/gutter/site-header.svelte';
	import SiteFooter from '$lib/components/gutter/site-footer.svelte';
</script>

<ModeWatcher />

<Toaster position="bottom-right" />

<div class="relative flex min-h-screen flex-col" id="page">
	<SiteHeader />
	<div class="flex flex-1">
		<slot />
	</div>
	<SiteFooter />
</div>
