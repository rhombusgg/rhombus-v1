<script lang="ts">
	import dayjs from 'dayjs';
	import calendar from 'dayjs/plugin/calendar';
	import UserAvatar from '$lib/components/user-avatar.svelte';

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
	<UserAvatar {...user} direction="right" />
</div>
