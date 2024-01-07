<script>
	import * as Card from '$lib/components/ui/card';
	import dayjs from 'dayjs';
	import calendar from 'dayjs/plugin/calendar';
	import Map from './map.svelte';

	dayjs.extend(calendar);

	export let data;

	$: name = data.display.type === 'discord' ? data.display.username : data.display.email;
</script>

<svelte:head>
	<title>User {name}</title>
	<meta name="description" content={`${name} public user profile`} />
</svelte:head>

<div class="container">
	<div class="mb-4 mt-4 space-y-0.5">
		<h2 class="text-2xl font-bold tracking-tight">
			User {name}
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
		<div class="mt-4 flex flex-col gap-4">
			<div class="font-mono text-xl font-medium text-red-500">Admin Only ▼</div>
			<div class="grid h-fit gap-6 md:grid-cols-2 lg:grid-cols-3">
				<Card.Root>
					<Card.Header>
						<Card.Title>Emails</Card.Title>
						<Card.Description>Emails this user has verified</Card.Description>
					</Card.Header>
					<Card.Content>
						{#each data.admin.emails as email}
							<div>
								<a class="font-medium underline underline-offset-4" href={`mailto:${email}`}
									>{email}</a
								>
							</div>
						{/each}
					</Card.Content>
				</Card.Root>
			</div>
			<Map ips={data.admin.ips} />
		</div>
	{/if}
</div>
