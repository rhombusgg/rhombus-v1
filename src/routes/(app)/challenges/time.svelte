<script lang="ts">
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	import { onMount } from 'svelte';

	dayjs.extend(relativeTime);

	export let date: Date;

	$: time = dayjs(date).fromNow();

	onMount(() => {
		const interval = setInterval(() => {
			time = dayjs(date).fromNow();
		}, 1000);

		return () => clearInterval(interval);
	});
</script>

{time}
