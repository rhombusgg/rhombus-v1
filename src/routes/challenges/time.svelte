<script lang="ts">
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	import { onMount } from 'svelte';

	dayjs.extend(relativeTime);

	export let date: Date;

	$: time = dayjs(date).fromNow();
	$: d = new Date().getTime() - date.getTime();

	onMount(() => {
		const interval = setInterval(() => {
			time = dayjs(date).fromNow();
			d = new Date().getTime() - date.getTime();
		}, 1000);

		return () => clearInterval(interval);
	});
</script>

{time}
