<script lang="ts">
	export let email: string;
</script>

<a href={`mailto:${email}`} class="font-medium underline underline-offset-4">
	{email}
</a>
