<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar';

	export let id: string;
	export let userId: string;
	export let username: string;
	export let globalUsername: string;
	export let image: string;
</script>

<div class="flex items-center gap-4">
	<Avatar.Root class="h-10 w-10 border-4">
		<Avatar.Image src={image} alt={`@${globalUsername}`} />
		<Avatar.Fallback>{username.substring(0, 2).toUpperCase()}</Avatar.Fallback>
	</Avatar.Root>
	<div>
		<a href={`/user/${userId}`} class="font-medium underline underline-offset-4">
			{username}
		</a>
		<p class="text-sm font-medium text-muted-foreground">
			<a
				href={`https://discord.com/users/${id}`}
				target="_blank"
				class="underline underline-offset-4">@{globalUsername}</a
			>
		</p>
	</div>
</div>
