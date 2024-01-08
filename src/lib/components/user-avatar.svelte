<script lang="ts">
	import { page } from '$app/stores';
	import * as Avatar from '$lib/components/ui/avatar';
	import { avatarFallback as generateAvatarFallback } from '$lib/utils';
	import clsx from 'clsx';

	export let avatarFallback: string | undefined = undefined;
	export let id: string | undefined = undefined;
	export let discord: {
		id: string;
		globalUsername: string;
		username: string;
		image: string;
	} | null = null;
	export let email: string | undefined = undefined;
	export let direction: 'left' | 'right' = 'left';

	let className: string | null | undefined = undefined;
	export { className as class };
</script>

<div
	class={clsx(
		'flex items-center gap-4',
		direction === 'right' && 'flex-row-reverse text-right',
		className
	)}
>
	<a href={id && `/user/${id}`}>
		<Avatar.Root class="h-10 w-10 border-4">
			{#if discord}
				<Avatar.Image src={discord.image} alt={`@${discord.globalUsername}`} />
			{/if}
			{#if avatarFallback}
				<Avatar.Fallback>{avatarFallback}</Avatar.Fallback>
			{:else}
				<Avatar.Fallback
					>{generateAvatarFallback({ discord, emails: email ? [{ email }] : [] })}</Avatar.Fallback
				>
			{/if}
		</Avatar.Root>
	</a>
	<div>
		<a class={clsx(id && 'font-medium underline underline-offset-4')} href={id && `/user/${id}`}>
			{#if discord}
				{discord.username}
			{:else}
				{email}
			{/if}
		</a>
		<p class="text-sm text-muted-foreground">
			{#if discord}
				<a
					href={`https://discord.com/users/${discord.id}`}
					target="_blank"
					class="underline underline-offset-4">@{discord.globalUsername}</a
				>
			{:else}
				<a href={`mailto:${email}`} class="underline underline-offset-4">{email}</a>
			{/if}
			{#if id && id === $page.data.session?.id}
				(You)
			{/if}
		</p>
	</div>
	<slot />
</div>
