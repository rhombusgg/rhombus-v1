<script lang="ts">
	import { page } from '$app/stores';
	import { goto, invalidateAll } from '$app/navigation';
	import { flip } from 'svelte/animate';
	import { SOURCES, TRIGGERS, dndzone } from 'svelte-dnd-action';
	import { Check, GripVertical, Maximize2, Ticket } from 'lucide-svelte';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import * as Avatar from '$lib/components/ui/avatar';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as HoverCard from '$lib/components/ui/hover-card';
	import Input from '$lib/components/ui/input/input.svelte';
	import { Button } from '$lib/components/ui/form';
	import dayjs from 'dayjs';
	import calendar from 'dayjs/plugin/calendar';
	import { superForm } from 'sveltekit-superforms/client';
	import toast from 'svelte-french-toast';
	import clsx from 'clsx';
	import Editor from './editor.svelte';
	import Time from './time.svelte';
	import UserAvatar from '$lib/components/user-avatar.svelte';

	dayjs.extend(calendar);

	function uncapitalizeString(str: string) {
		return str.charAt(0).toLowerCase() + str.slice(1);
	}

	export let data;

	const ticketForm = superForm(data.ticketForm, {
		async onUpdated() {
			toast.success('Ticket submitted!');
			await goto(`/challenges`);
		}
	});

	const { enhance: flagFormEnhance, errors: flagFormErrors } = superForm(data.flagForm, {
		async onUpdated({ form }) {
			if (form.valid) {
				toast.success('Challenge solved!');
				await goto(`/challenges`);
			}
		}
	});

	const { enhance: writeupFormEnhance, errors: writeupFormErrors } = superForm(data.writeupForm, {
		async onUpdated({ form }) {
			if (form.valid) {
				toast.success('Writeup submitted!');
				await goto(`/challenges`);
			}
		}
	});

	$: userColumns = data.userColumns;
	$: oldUserColumns = data.userColumns;
	$: challenges = data.userColumns.flatMap((column) => column.challenges);

	type Column = (typeof userColumns)[number];
	type Item = Column['challenges'][number];

	let dragDisabled = true;

	const flipDurationMs = 200;
	function handleDndConsiderColumns(e: CustomEvent<DndEvent<Column>>) {
		userColumns = e.detail.items;
		if (
			e.detail.info.source === SOURCES.KEYBOARD &&
			e.detail.info.trigger === TRIGGERS.DRAG_STOPPED
		) {
			dragDisabled = true;
		}
	}

	function handleDndFinalizeColumns(e: CustomEvent<DndEvent<Column>>) {
		userColumns = e.detail.items;

		const swappedItemIndex = userColumns.findIndex((item, i) => item.id !== oldUserColumns[i].id);
		if (swappedItemIndex !== -1) {
			oldUserColumns = [...userColumns];
			const columns = oldUserColumns.map((column) => ({
				id: column.id,
				name: column.name,
				items: column.challenges.map((challenge) => ({ challengeId: challenge.id }))
			}));
			fetch('/challenges/board', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(columns)
			});
		}

		if (e.detail.info.source === SOURCES.POINTER) {
			dragDisabled = true;
		}
	}

	function handleDndConsiderCards(columnId: string, e: CustomEvent<DndEvent<Item>>) {
		const colIdx = userColumns.findIndex((c) => c.id === columnId);
		userColumns[colIdx].challenges = e.detail.items;
		userColumns = [...userColumns];
		if (
			e.detail.info.source === SOURCES.KEYBOARD &&
			e.detail.info.trigger === TRIGGERS.DRAG_STOPPED
		) {
			dragDisabled = true;
		}
	}

	function handleDndFinalizeCards(columnId: string, e: CustomEvent<DndEvent<Item>>) {
		const colIdx = userColumns.findIndex((c) => c.id === columnId);
		userColumns[colIdx].challenges = e.detail.items;
		userColumns = [...userColumns];
		if (e.detail.info.source === SOURCES.POINTER) {
			dragDisabled = true;
		}

		oldUserColumns = [...userColumns];
		const columns = oldUserColumns.map((column) => ({
			id: column.id,
			name: column.name,
			items: column.challenges.map((challenge) => ({ challengeId: challenge.id }))
		}));

		fetch('/challenges/board', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(columns)
		});
	}
</script>

<svelte:head>
	<title>Challenges</title>
	<meta name="description" content="Challenges" />
</svelte:head>

<svelte:window on:focus={() => invalidateAll()} />

{#each challenges as challenge}
	<Dialog.Root
		open={$page.url.searchParams.get('challenge') === challenge.slug}
		onOpenChange={() => {
			$page.url.searchParams.delete('challenge');
			goto($page.url);
		}}
	>
		<Dialog.Content>
			<div class="mr-4 flex justify-between font-bold">
				<div>
					<span class="text-green-500">{challenge.category} / </span>
					<span>{challenge.difficulty} / </span>
					<span>{challenge.name}</span>
				</div>
				<div>
					{challenge.globalSolveCount} solve{challenge.globalSolveCount !== 1 ? 's' : ''} / {challenge.points}
					pts
				</div>
			</div>
			<div>
				{challenge.description}
			</div>
			{#if !challenge.solve}
				<form use:flagFormEnhance method="POST" action="?/flag">
					<input type="hidden" name="challengeId" value={challenge.id} />
					<div class="flex">
						<Input
							placeholder="flag..."
							name="flag"
							class={clsx($flagFormErrors.flag && 'border-red-500')}
							autocomplete="off"
						/>
						<Button class="ml-2">Submit</Button>
					</div>
					{#if $flagFormErrors.flag}
						<div class="text-red-500">
							{$flagFormErrors.flag}
						</div>
					{/if}
				</form>
			{:else}
				<form use:writeupFormEnhance method="POST" action="?/writeup">
					<input type="hidden" name="challengeId" value={challenge.id} />
					<div class="flex">
						<Input
							placeholder="writeup link..."
							name="link"
							class={clsx($writeupFormErrors.link && 'border-red-500')}
							autocomplete="off"
						/>
						<Button class="ml-2">Submit</Button>
					</div>
					{#if $writeupFormErrors.link}
						<div class="text-red-500">
							{$writeupFormErrors.link}
						</div>
					{/if}
				</form>
				{#if challenge.userWriteupLinks.length > 0}
					<div>
						<div class="text-lg">Submitted Writeups</div>
						{#each challenge.userWriteupLinks as writeupLink}
							<div>
								<a
									href={writeupLink}
									target="_blank"
									class="font-medium underline underline-offset-4"
								>
									{writeupLink}
								</a>
							</div>
						{/each}
					</div>
				{/if}
			{/if}
		</Dialog.Content>
	</Dialog.Root>
	<Dialog.Root
		open={$page.url.searchParams.get('ticket') === challenge.slug}
		closeOnEscape={false}
		onOpenChange={() => {
			$page.url.searchParams.delete('ticket');
			goto($page.url);
		}}
	>
		<Dialog.Content class="max-w-fit">
			<div class="mr-4 flex justify-between font-bold">
				<div>
					<span class="text-green-500">{challenge.category} / </span>
					<span>{challenge.difficulty} / </span>
					<span>{challenge.name}</span>
				</div>
				<div>
					{challenge.globalSolveCount} solve{challenge.globalSolveCount !== 1 ? 's' : ''} / {challenge.points}
					pts
				</div>
			</div>
			<div>
				{challenge.description}
			</div>
			<form use:ticketForm.enhance method="POST" action="?/ticket">
				<Editor content={challenge.issueTemplate} />
				<input type="hidden" name="challengeId" value={challenge.id} />
				<Button>Submit</Button>
			</form>
		</Dialog.Content>
	</Dialog.Root>
{/each}

<div
	class="mt-4 flex w-full flex-col gap-4 overflow-x-auto px-4 lg:flex-row"
	use:dndzone={{
		items: userColumns,
		flipDurationMs,
		dragDisabled,
		type: 'columns',
		dropTargetStyle: {}
	}}
	on:consider={handleDndConsiderColumns}
	on:finalize={handleDndFinalizeColumns}
>
	{#each userColumns as column (column.id)}
		<div
			class="flex w-full flex-col rounded-md lg:w-[700px] lg:min-w-[700px]"
			animate:flip={{ duration: flipDurationMs }}
		>
			<div
				class="flex justify-between rounded-md bg-blue-500 p-4 font-bold"
				tabindex={dragDisabled ? 0 : -1}
				role="button"
				aria-label="drag-handle"
				style={dragDisabled ? 'cursor: grab' : 'cursor: grabbing'}
				on:mousedown|preventDefault={() => {
					dragDisabled = false;
				}}
				on:touchstart|preventDefault={() => {
					dragDisabled = false;
				}}
				on:keydown={(e) => {
					if ((e.key === 'Enter' || e.key === ' ') && dragDisabled) dragDisabled = false;
				}}
			>
				<div>{column.name}</div>
			</div>
			<div
				class="flex flex-grow flex-col gap-2 p-2"
				use:dndzone={{
					items: column.challenges,
					flipDurationMs,
					dragDisabled,
					dropTargetStyle: {}
				}}
				on:consider={(e) => handleDndConsiderCards(column.id, e)}
				on:finalize={(e) => handleDndFinalizeCards(column.id, e)}
			>
				{#each column.challenges as challenge (challenge.id)}
					<div
						class="border-l-4 border-blue-500 bg-card p-4"
						animate:flip={{ duration: flipDurationMs }}
					>
						<div class="mb-2 flex justify-between">
							<div class="flex items-center gap-4">
								<div class="font-bold">
									<span class="text-blue-500">{challenge.category} / </span>
									<span>{challenge.difficulty} / </span>
									<span>{challenge.name}</span>
								</div>
								{#if challenge.solve}
									<div class="flex items-center justify-center">
										<Check class="pointer-events-none absolute z-10 h-5 w-5 " />
										<HoverCard.Root>
											<HoverCard.Trigger>
												<Avatar.Root class="h-8 w-8 cursor-pointer border-4 bg-green-500">
													{#if challenge.solve.user.discord}
														<Avatar.Image
															class="opacity-30"
															src={challenge.solve.user.discord.image}
															alt={`@${challenge.solve.user.discord.globalUsername}`}
														/>
													{/if}
													<Avatar.Fallback>{challenge.solve.user.avatarFallback}</Avatar.Fallback>
												</Avatar.Root>
											</HoverCard.Trigger>
											<HoverCard.Content class="w-fit">
												<UserAvatar class="text-left" {...challenge.solve.user} />
												<div class="mt-1 text-sm text-muted-foreground">
													solved {uncapitalizeString(dayjs(challenge.solve.time).calendar(dayjs()))}
												</div>
											</HoverCard.Content>
										</HoverCard.Root>
									</div>
								{/if}
							</div>
							<div class="flex items-center gap-4">
								<div class="font-bold">
									{challenge.globalSolveCount} solve{challenge.globalSolveCount !== 1 ? 's' : ''} / {challenge.points}
									pts
								</div>
								{#if challenge.health}
									<Tooltip.Root>
										<Tooltip.Trigger class="flex h-6 w-6 items-center justify-center">
											<div
												class={clsx(
													'h-3 w-3 rounded-full',
													challenge.health.healthy ? 'bg-green-500' : 'bg-red-500'
												)}
											/>
										</Tooltip.Trigger>
										<Tooltip.Content>
											<p>
												{#if challenge.health.healthy}
													Last checked <Time date={challenge.health.lastChecked} /> and is
													<span class="text-green-500">up</span>
												{:else}
													Last checked <Time date={challenge.health.lastChecked} /> and is
													<span class="text-red-500">down</span>
												{/if}
											</p>
										</Tooltip.Content>
									</Tooltip.Root>
								{/if}
								<a href={`?ticket=${challenge.slug}`}>
									<Tooltip.Root>
										<Tooltip.Trigger class="flex items-center">
											<Ticket class="-rotate-45" />
										</Tooltip.Trigger>
										<Tooltip.Content>
											<p>Create Support Ticket</p>
										</Tooltip.Content>
									</Tooltip.Root>
								</a>
								<HoverCard.Root>
									<HoverCard.Trigger>
										<Avatar.Root class="h-8 w-8 border-4">
											<Avatar.Image
												src={challenge.authorDiscord.image}
												alt={`@${challenge.authorDiscord.username}`}
											/>
											<Avatar.Fallback
												>{challenge.authorDiscord.username
													.substring(0, 2)
													.toUpperCase()}</Avatar.Fallback
											>
										</Avatar.Root>
									</HoverCard.Trigger>
									<HoverCard.Content class="w-fit">
										<UserAvatar class="text-left" discord={challenge.authorDiscord} />
										<div class="mt-1 text-sm text-muted-foreground">challenge author</div>
									</HoverCard.Content>
								</HoverCard.Root>
								<div
									tabindex={dragDisabled ? 0 : -1}
									role="button"
									aria-label="drag-handle"
									style={dragDisabled ? 'cursor: grab' : 'cursor: grabbing'}
									on:mousedown|preventDefault={() => {
										dragDisabled = false;
									}}
									on:touchstart|preventDefault={() => {
										dragDisabled = false;
									}}
									on:keydown={(e) => {
										if ((e.key === 'Enter' || e.key === ' ') && dragDisabled) dragDisabled = false;
									}}
								>
									<Tooltip.Root>
										<Tooltip.Trigger class="flex items-center">
											<GripVertical />
										</Tooltip.Trigger>
										<Tooltip.Content>
											<p>Drag</p>
										</Tooltip.Content>
									</Tooltip.Root>
								</div>
							</div>
						</div>
						<div class="relative">
							{challenge.description}

							<a href={`?challenge=${challenge.slug}`} class="absolute bottom-0 right-0 h-6 w-6">
								<Tooltip.Root>
									<Tooltip.Trigger class="flex items-center">
										<Maximize2 />
									</Tooltip.Trigger>
									<Tooltip.Content>
										<p>Focus</p>
									</Tooltip.Content>
								</Tooltip.Root>
							</a>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/each}
</div>
