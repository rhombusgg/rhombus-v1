<script lang="ts">
	export let email: string;
	export let userId: string;
</script>

<a href={`/user/${userId}`} class="font-medium underline underline-offset-4">
	{email}
</a>
