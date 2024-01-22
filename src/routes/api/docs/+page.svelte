<script lang="ts">
	import { onMount } from 'svelte';
	import SwaggerUI from 'swagger-ui';
	import 'swagger-ui/dist/swagger-ui.css';

	export let data;

	onMount(() => {
		document.documentElement.classList.remove('dark');
		document.documentElement.style.colorScheme = '';

		SwaggerUI({
			spec: data.spec,
			dom_id: '#swagger-ui-container'
		});
	});
</script>

<svelte:head>
	<title>Rhombus API Documentation</title>
</svelte:head>

<div id="swagger-ui-container" />
