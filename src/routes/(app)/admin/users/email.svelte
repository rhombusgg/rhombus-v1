<script lang="ts">
	export let emails: string[];
</script>

{#each emails as email, i}
	<a href={`mailto:${email}`} class="font-medium underline underline-offset-4">{email}</a
	>{#if i < emails.length - 1}<span>, </span>{/if}
{/each}
