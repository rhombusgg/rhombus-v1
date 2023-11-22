<script lang="ts">
	import { page } from '$app/stores';
	import * as Card from '$lib/components/ui/card';
	import * as Avatar from '$lib/components/ui/avatar';
	export let data;
</script>

{#if $page.data.session}
	<div class="container">
		<div class="mb-4 mt-4 space-y-0.5">
			<h2 class="text-2xl font-bold tracking-tight">Team {data.team.name}</h2>
			<p class="text-muted-foreground">
				View your <a href="/" class="font-medium underline underline-offset-4"
					>public team profile</a
				>
			</p>
		</div>
		<div class="grid h-fit gap-6 md:grid-cols-2 lg:grid-cols-3">
			<Card.Root>
				<Card.Header>
					<Card.Title>Members</Card.Title>
					<Card.Description>Your team members</Card.Description>
				</Card.Header>
				<Card.Content>
					{#each data.team.users as user}
						<div>
							{#if user.discord}
								<Avatar.Root class="h-8 w-8">
									<Avatar.Image src={user.discord.image} alt={`@${user.discord.globalUsername}`} />
									<Avatar.Fallback>{user.discord.globalUsername}</Avatar.Fallback>
								</Avatar.Root>
							{:else}
								<Avatar.Root class="h-8 w-8">
									<Avatar.Fallback>{user.email}</Avatar.Fallback>
								</Avatar.Root>
							{/if}
						</div>
					{/each}
				</Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Header>
					<Card.Title>Solves</Card.Title>
					<Card.Description>Challenges your team has solved</Card.Description>
				</Card.Header>
				<Card.Content>A</Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Header>
					<Card.Title>Standing</Card.Title>
					<Card.Description>Current standing in each division</Card.Description>
				</Card.Header>
				<Card.Content>A</Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Header>
					<Card.Title>Webhook</Card.Title>
					<Card.Description>Manage webhooks for your team</Card.Description>
				</Card.Header>
				<Card.Content>A</Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Header>
					<Card.Title>Settings</Card.Title>
					<Card.Description>Manage team settings</Card.Description>
				</Card.Header>
				<Card.Content>A</Card.Content>
			</Card.Root>
		</div>
	</div>
{/if}
