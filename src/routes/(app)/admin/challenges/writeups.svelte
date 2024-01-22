<script lang="ts">
	export let writeupCount: number;
	export let id: string;
</script>

<a href={`challenges/writeups/${id}`} class="font-medium underline underline-offset-4">
	{writeupCount}
</a>
