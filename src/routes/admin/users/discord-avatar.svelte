<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar';

	export let username: string;
	export let globalUsername: string;
	export let image: string;
	export let userId: string;
</script>

<a href={`/user/${userId}`} class="flex items-center gap-4">
	<Avatar.Root class="h-10 w-10 border-4">
		<Avatar.Image src={image} alt={`@${globalUsername}`} />
		<Avatar.Fallback>{username.substring(0, 2).toUpperCase()}</Avatar.Fallback>
	</Avatar.Root>
	<div>
		<p class="font-medium underline underline-offset-4">
			{username}
		</p>
		<p class="text-sm text-muted-foreground">
			@{globalUsername}
		</p>
	</div>
</a>
