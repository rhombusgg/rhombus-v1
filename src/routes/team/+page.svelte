<script lang="ts">
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';
	import * as Card from '$lib/components/ui/card';
	import * as Form from '$lib/components/ui/form';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { ClipboardCopy, Crown, Info, LogOut, RefreshCcw } from 'lucide-svelte';
	import toast from 'svelte-french-toast';
	import { teamNameFormSchema } from './schema';
	import clsx from 'clsx';
	import Checkbox from '$lib/components/ui/checkbox/checkbox.svelte';
	import Solve from './solve.svelte';
	import UserAvatar from '$lib/components/user-avatar.svelte';

	export let data;

	function isEligable(
		eligability: {
			eligable: boolean;
			userId: string;
		}[]
	) {
		return eligability.every((e) => e.eligable);
	}

	$: isOwner = data.team.ownerId === data.session?.id;
</script>

<svelte:head>
	<title>Team {data.team.name}</title>
	<meta name="description" content="Manage your team." />
</svelte:head>

{#if $page.data.session}
	<div class="container">
		<div class="mb-4 mt-4 space-y-0.5">
			<h2 class="text-2xl font-bold tracking-tight">Team {data.team.name}</h2>
			<p class="text-muted-foreground">
				View your <a href={`/team/${data.team.id}`} class="font-medium underline underline-offset-4"
					>public team profile</a
				>
			</p>
		</div>
		<div class="grid h-fit gap-6 lg:grid-cols-2">
			<Card.Root>
				<Card.Header>
					<Card.Title>Members</Card.Title>
					<Card.Description>Players on your team</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="flex flex-col gap-6">
						<div>
							<h4 class="text-sm font-medium">Invite Link</h4>
							<p class="mb-2 text-sm text-muted-foreground">
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
								<UserAvatar {...user}>
									{#if user.id === data.team.ownerId}
										<Tooltip.Root>
											<Tooltip.Trigger><Crown /></Tooltip.Trigger>
											<Tooltip.Content>
												<p>Team Captain</p>
											</Tooltip.Content>
										</Tooltip.Root>
									{/if}
								</UserAvatar>
								{#if isOwner !== (user.id === data.session?.id)}
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
											{#if isOwner}
												<p>Remove from team</p>
											{:else}
												<p>Leave team</p>
											{/if}
										</Tooltip.Content>
									</Tooltip.Root>
								{/if}
							</div>
						{/each}
					</div>
				</Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Header>
					<Card.Title>Solves</Card.Title>
					<Card.Description>Challenges your team has solved</Card.Description>
				</Card.Header>
				<Card.Content>
					{#each data.solves as solve}
						<!-- svelte hack to declare a let binding -->
						{#each [data.team.users.find((user) => user.id === solve.userId)] as user}
							{#if user}
								<Solve {solve} {user} />
							{/if}
						{/each}
					{/each}
				</Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Header>
					<Card.Title>Divisions</Card.Title>
					<Card.Description>Join your team to eligable divisions</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="flex flex-col gap-2">
						<div class="flex items-center justify-between">
							<div class="text-muted-foreground">Division Name</div>
							<div class="text-muted-foreground">Joined</div>
						</div>
						{#each data.divisions as division}
							<div
								class={clsx(
									'flex items-center justify-between',
									isEligable(division.eligable) || 'text-muted-foreground'
								)}
							>
								<div class="flex items-center">
									{division.name}
									<Tooltip.Root>
										<Tooltip.Trigger>
											<Info class="ml-2 h-4 w-4" />
										</Tooltip.Trigger>
										<Tooltip.Content>
											<p>{division.info}</p>
										</Tooltip.Content>
									</Tooltip.Root>
								</div>
								<div class="flex items-center">
									{#if !isEligable(division.eligable)}
										<Tooltip.Root>
											<Tooltip.Trigger>
												<Info class="mr-2 h-4 w-4" />
											</Tooltip.Trigger>
											<Tooltip.Content>
												<p>
													Users are ineligable: {#each division.eligable
														.filter((e) => !e.eligable)
														.map( (e) => data.team.users.find((user) => user.id === e.userId) ) as user, i}
														<a
															href={`/user/${user?.id}`}
															class="font-medium underline underline-offset-4"
															>{user?.discord?.username || user?.email}</a
														>{#if i < division.eligable.filter((e) => !e.eligable).length - 1}<span
																>,
															</span>
														{/if}
													{/each}
												</p>
											</Tooltip.Content>
										</Tooltip.Root>
									{/if}
									<form
										use:enhance
										method="POST"
										action="?/toggleDivision"
										class="flex items-center"
									>
										<Checkbox
											disabled={!isOwner || !isEligable(division.eligable)}
											checked={division.isInDivision}
											type="submit"
											name="isInDivision"
										/>
										<input type="hidden" name="divisionId" value={division.id} />
									</form>
								</div>
							</div>
						{/each}
					</div>
				</Card.Content>
			</Card.Root>
			<!-- {#if isOwner}
				<Card.Root>
					<Card.Header>
						<Card.Title>Webhook</Card.Title>
						<Card.Description>Manage webhooks for your team</Card.Description>
					</Card.Header>
					<Card.Content>A</Card.Content>
				</Card.Root>
			{/if} -->
			{#if isOwner}
				<Card.Root>
					<Card.Header>
						<Card.Title>Team Captain Settings</Card.Title>
						<Card.Description
							>Manage team settings only available to you as a Team Captain</Card.Description
						>
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
										<Form.Input placeholder="new team name..." autocomplete="off" />
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
