<script>
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import SiteHeader from '$lib/components/gutter/site-header.svelte';
	import SiteFooter from '$lib/components/gutter/site-footer.svelte';
</script>

<ModeWatcher />

<div class="relative flex min-h-screen flex-col" id="page">
	<SiteHeader />
	<div class="flex-1">
		<slot />
	</div>
	<SiteFooter />
</div>
