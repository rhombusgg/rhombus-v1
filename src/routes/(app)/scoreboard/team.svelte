<script lang="ts">
	export let id: string;
	export let name: string;
</script>

<a href={`/team/${id}`} class="font-medium underline underline-offset-4">
	{name}
</a>
