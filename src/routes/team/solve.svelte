<script lang="ts">
	import { page } from '$app/stores';
	import dayjs from 'dayjs';
	import calendar from 'dayjs/plugin/calendar';
	import * as Avatar from '$lib/components/ui/avatar';

	dayjs.extend(calendar);

	export let user: {
		discord: {
			id: string;
			username: string;
			globalUsername: string;
			image: string;
		} | null;
		email: string | undefined;
		avatarFallback: string;
		id: string;
	};

	export let solve: {
		time: Date;
		challenge: {
			slug: string;
			name: string;
			points: number;
		};
	};
</script>

<div class="flex items-center justify-between">
	<div>
		<a
			class="font-medium underline underline-offset-4"
			href={`/challenges?challenge=${solve.challenge.slug}`}>{solve.challenge.name}</a
		>
		<span class="text-sm text-muted-foreground">
			/ {solve.challenge.points} points / {dayjs(solve.time).calendar(dayjs())}</span
		>
	</div>
	<div class="flex items-center gap-4">
		<div class="text-right">
			<a class="font-medium underline underline-offset-4" href={`/user/${user.id}`}>
				{#if user.discord}
					{user.discord.username}
				{:else}
					{user.email}
				{/if}
			</a>
			<p class="text-sm text-muted-foreground">
				{#if user.discord}
					<a
						href={`https://discord.com/users/${user.discord.id}`}
						target="_blank"
						class="underline underline-offset-4">@{user.discord.globalUsername}</a
					>
				{:else}
					{user.email}
				{/if}
				{#if user.id === $page.data.session?.id}
					(You)
				{/if}
			</p>
		</div>
		<Avatar.Root class="h-10 w-10 border-4">
			{#if user.discord}
				<Avatar.Image src={user.discord.image} alt={`@${user.discord.globalUsername}`} />
			{/if}
			<Avatar.Fallback>{user.avatarFallback}</Avatar.Fallback>
		</Avatar.Root>
	</div>
</div>
