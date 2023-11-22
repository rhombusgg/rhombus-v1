<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Avatar from '$lib/components/ui/avatar';
	import * as Form from '$lib/components/ui/form';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { ClipboardCopy, Crown, LogOut, RefreshCcw } from 'lucide-svelte';
	import { page } from '$app/stores';
	import { writable } from 'svelte/store';
	import { enhance } from '$app/forms';
	import { teamNameFormSchema } from './schema.js';
	import toast from 'svelte-french-toast';
	import { Input } from '$lib/components/ui/input';
	import Button from '$lib/components/ui/button/button.svelte';
	export let data;

	const isOwner = writable();
	$: isOwner.set(data.team.ownerId === data.session?.id);
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
					<div class="flex flex-col gap-6">
						<div>
							<h4 class="text-sm font-medium">Invite Link</h4>
							<p class="text-muted-foreground mb-2 text-sm">
								Send this invite link to your team members
							</p>
							<div class="flex">
								<Input value={data.team.inviteLink} readonly />
								<Tooltip.Root>
									<Tooltip.Trigger asChild let:builder>
										<Button
											class="ml-2"
											builders={[builder]}
											on:click={() => {
												navigator.clipboard.writeText(data.team.inviteLink);
												toast.success('Copied invite link to clipboard');
											}}
										>
											<ClipboardCopy />
										</Button>
									</Tooltip.Trigger>
									<Tooltip.Content>
										<p>Copy invite link to clipboard</p>
									</Tooltip.Content>
								</Tooltip.Root>
								{#if data.session?.isTeamOwner}
									<Tooltip.Root>
										<Tooltip.Trigger asChild let:builder>
											<form
												use:enhance
												method="POST"
												action="?/refreshInviteLink"
												class="flex flex-col items-center"
											>
												<Button class="ml-2" builders={[builder]} type="submit">
													<RefreshCcw />
												</Button>
											</form>
										</Tooltip.Trigger>
										<Tooltip.Content>
											<p>Roll invite link</p>
										</Tooltip.Content>
									</Tooltip.Root>
								{/if}
							</div>
						</div>
						{#each data.team.users as user}
							<div class="flex items-center justify-between">
								<div class="flex items-center gap-4">
									<Avatar.Root class="h-8 w-8">
										{#if user.discord}
											<Avatar.Image
												src={user.discord.image}
												alt={`@${user.discord.globalUsername}`}
											/>
										{/if}
										<Avatar.Fallback>{user.avatarFallback}</Avatar.Fallback>
									</Avatar.Root>
									<div>
										<p>
											{#if user.discord}
												{user.discord.username}
											{:else}
												{user.email}
											{/if}
										</p>
										<p class="text-muted-foreground text-sm">
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
									{#if user.id === data.team.ownerId}
										<Tooltip.Root>
											<Tooltip.Trigger><Crown /></Tooltip.Trigger>
											<Tooltip.Content>
												<p>Team Captain</p>
											</Tooltip.Content>
										</Tooltip.Root>
									{/if}
								</div>
								{#if $isOwner !== (user.id === data.session?.id)}
									<Tooltip.Root>
										<Tooltip.Trigger>
											<form
												use:enhance
												method="POST"
												action="?/kick"
												class="flex flex-col items-center"
											>
												<button type="submit">
													<LogOut class="text-destructive" />
												</button>
												<input type="hidden" name="userId" value={user.id} />
											</form>
										</Tooltip.Trigger>
										<Tooltip.Content>
											{#if $isOwner}
												<p>Remove from team</p>
											{:else}
												<p>Leave team</p>
											{/if}
										</Tooltip.Content>
									</Tooltip.Root>
								{/if}
							</div>
						{/each}
					</div></Card.Content
				>
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
			{#if $isOwner}
				<Card.Root>
					<Card.Header>
						<Card.Title>Webhook</Card.Title>
						<Card.Description>Manage webhooks for your team</Card.Description>
					</Card.Header>
					<Card.Content>A</Card.Content>
				</Card.Root>
			{/if}
			{#if $isOwner}
				<Card.Root>
					<Card.Header>
						<Card.Title>Settings</Card.Title>
						<Card.Description>Manage team settings</Card.Description>
					</Card.Header>
					<Card.Content>
						<Form.Root
							method="POST"
							action="?/teamName"
							form={data.teamNameForm}
							options={{
								onUpdate({ form }) {
									if (form.message) {
										toast.error(form.message);
									}
								}
							}}
							schema={teamNameFormSchema}
							let:config
						>
							<Form.Field {config} name="name">
								<Form.Item>
									<Form.Label>Team Name</Form.Label>
									<Form.Validation />
									<div class="flex gap-2">
										<Form.Input placeholder={data.team.name} autocomplete="off" />
										<Form.Button>Change Name</Form.Button>
									</div>
								</Form.Item>
							</Form.Field>
						</Form.Root>
					</Card.Content>
				</Card.Root>
			{/if}
		</div>
	</div>
{/if}
