<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Avatar from '$lib/components/ui/avatar';
	import dayjs from 'dayjs';
	import calendar from 'dayjs/plugin/calendar';

	dayjs.extend(calendar);

	export let data;
</script>

<svelte:head>
	<title>Team {data.team.name}</title>
	<meta name="description" content={`${data.team.name} public profile`} />
</svelte:head>

<div class="container">
	<div class="mb-4 mt-4 space-y-0.5">
		<h2 class="text-2xl font-bold tracking-tight">Team {data.team.name}</h2>
		<p class="text-muted-foreground">
			Public team profile{#if data.team.id === data.session?.team.id}. This is <a
					class="font-medium underline underline-offset-4"
					href="/team">your team</a
				>{/if}
		</p>
	</div>
	<div class="grid h-fit gap-6 lg:grid-cols-2">
		<Card.Root>
			<Card.Header>
				<Card.Title>Members</Card.Title>
				<Card.Description>Players on the team</Card.Description>
			</Card.Header>
			<Card.Content>
				{#each data.users as user}
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-4">
							<Avatar.Root class="h-8 w-8">
								{#if user.discord}
									<Avatar.Image src={user.discord.image} alt={`@${user.discord.globalUsername}`} />
								{/if}
								<Avatar.Fallback>{user.avatarFallback}</Avatar.Fallback>
							</Avatar.Root>
							<div>
								<a class="font-medium underline underline-offset-4" href={`/user/${user.id}`}>
									{#if user.discord}
										{user.discord.username}
									{:else}
										{user.email}
									{/if}
								</a>
								<p class="text-sm text-muted-foreground">
									{#if user.discord}
										@{user.discord.globalUsername}
									{:else}
										{user.email}
									{/if}
									{#if user.id === data.session?.id}
										(You)
									{/if}
								</p>
							</div>
						</div>
					</div>
				{/each}
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Header>
				<Card.Title>Solves</Card.Title>
				<Card.Description>Challenges the team has solved</Card.Description>
			</Card.Header>
			<Card.Content>
				{#each data.solves as solve}
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
								<a class="font-medium underline underline-offset-4" href={`/user/${solve.user.id}`}>
									{#if solve.user.discord}
										{solve.user.discord.username}
									{:else}
										{solve.user.email}
									{/if}
								</a>
								<p class="text-sm text-muted-foreground">
									{#if solve.user.discord}
										@{solve.user.discord.globalUsername}
									{:else}
										{solve.user.email}
									{/if}
									{#if solve.user.id === data.session?.id}
										(You)
									{/if}
								</p>
							</div>
							<Avatar.Root class="h-8 w-8">
								{#if solve.user.discord}
									<Avatar.Image
										src={solve.user.discord.image}
										alt={`@${solve.user.discord.globalUsername}`}
									/>
								{/if}
								<Avatar.Fallback>{solve.user.avatarFallback}</Avatar.Fallback>
							</Avatar.Root>
						</div>
					</div>
				{/each}
			</Card.Content>
		</Card.Root>
	</div>
</div>
