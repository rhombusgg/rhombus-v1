<script lang="ts">
	export let name: string;
	export let id: string;
</script>

<a href={`/team/${id}`} class="font-medium underline underline-offset-4">
	{name}
</a>
