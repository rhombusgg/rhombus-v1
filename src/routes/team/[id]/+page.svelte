<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Avatar from '$lib/components/ui/avatar';
	import dayjs from 'dayjs';
	import calendar from 'dayjs/plugin/calendar';
	import Solve from '../solve.svelte';

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
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-4">
							<Avatar.Root class="h-10 w-10 border-4">
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
										<a
											href={`https://discord.com/users/${user.discord.id}`}
											target="_blank"
											class="underline underline-offset-4">@{user.discord.globalUsername}</a
										>
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
