<script lang="ts">
	export let name: string;
	export let slug: string;
</script>

<a href={`/challenges?challenge=${slug}`} class="font-medium underline underline-offset-4">
	{name}
</a>
