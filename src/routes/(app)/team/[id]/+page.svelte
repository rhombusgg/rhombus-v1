<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import dayjs from 'dayjs';
	import calendar from 'dayjs/plugin/calendar';
	import Solve from '../solve.svelte';
	import UserAvatar from '$lib/components/user-avatar.svelte';

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
			<Card.Content class="flex flex-col gap-6">
				{#each data.users as user}
					<UserAvatar {...user} />
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
					{#each [data.users.find((user) => user.id === solve.userId)] as user}
						{#if user}
							<Solve {solve} {user} />
						{/if}
					{/each}
				{/each}
			</Card.Content>
		</Card.Root>
	</div>
</div>
