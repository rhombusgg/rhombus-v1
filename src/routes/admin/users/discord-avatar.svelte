<script lang="ts">
	import * as Avatar from '$lib/components/ui/avatar';

	export let username: string;
	export let globalUsername: string;
	export let image: string;
</script>

<div class="flex items-center gap-4">
	<Avatar.Root class="h-8 w-8">
		<Avatar.Image src={image} alt={`@${globalUsername}`} />
		<Avatar.Fallback>{username.substring(0, 2).toUpperCase()}</Avatar.Fallback>
	</Avatar.Root>
	<div>
		<p>
			{username}
		</p>
		<p class="text-sm text-muted-foreground">
			@{globalUsername}
		</p>
	</div>
</div>
