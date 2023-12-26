<script>
	import * as Card from '$lib/components/ui/card';
	import dayjs from 'dayjs';
	import calendar from 'dayjs/plugin/calendar';
	import Map from './map.svelte';

	dayjs.extend(calendar);

	export let data;
</script>

<div class="container">
	<div class="mb-4 mt-4 space-y-0.5">
		<h2 class="text-2xl font-bold tracking-tight">
			User {data.display.type === 'discord' ? data.display.username : data.display.email}
		</h2>
		<p class="text-muted-foreground">
			Public user profile.
			{#if data.session?.team.id === data.team.id}
				On <a class="font-medium underline underline-offset-4" href={`/team`}>your team</a>
			{:else}
				On team <a class="font-medium underline underline-offset-4" href={`/team/${data.team.id}`}
					>{data.team.name}</a
				>
			{/if}
		</p>
	</div>
	<div class="grid h-fit gap-6 md:grid-cols-2 lg:grid-cols-3">
		<Card.Root>
			<Card.Header>
				<Card.Title>Solves</Card.Title>
				<Card.Description>Challenges this user has solved</Card.Description>
			</Card.Header>
			<Card.Content>
				{#each data.solves as solve}
					<div class="flex items-center justify-between">
						<div>
							<a
								class="font-medium underline underline-offset-4"
								href={`/challenges?challenge=${solve.challenge.slug}`}>{solve.challenge.name}</a
							>
							<span class="text-sm text-muted-foreground"> / {solve.challenge.points} points</span>
						</div>
						<div class="text-sm text-muted-foreground">
							{dayjs(solve.time).calendar(dayjs())}
						</div>
					</div>
				{/each}
			</Card.Content>
		</Card.Root>
	</div>

	{#if data.admin}
		<div class="mt-4 font-mono text-xl font-medium text-red-500">Admin Only ▼</div>
		<Map ips={data.admin.ips} />
	{/if}
</div>
