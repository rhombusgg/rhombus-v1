<script>
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import SiteHeader from './site-header.svelte';
	import SiteFooter from './site-footer.svelte';
</script>

<ModeWatcher />

<div class="relative flex min-h-screen flex-col" id="page">
	<SiteHeader />
	<div class="flex-1">
		<slot />
	</div>
	<SiteFooter />
</div>
