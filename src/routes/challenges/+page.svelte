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
			} else if (form.errors.flag) {
				// toast.error(form.errors.flag.join(' '));
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

<svelte:document on:focus={() => invalidateAll()} />

{#each challenges as challenge}
	<Dialog.Root
		open={$page.url.searchParams.get('challenge') === challenge.slug}
		onOpenChange={() => {
			$page.url.searchParams.delete('challenge');
			goto($page.url);
		}}
	>
		<Dialog.Content>
			<div class="font-bold">
				<span class="text-green-500">{challenge.category} / </span>
				<span>{challenge.difficulty} / </span>
				<span>{challenge.name}</span>
			</div>
			<div>
				{challenge.description}
			</div>
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
			<div class="font-bold">
				<span class="text-green-500">{challenge.category} / </span>
				<span>{challenge.difficulty} / </span>
				<span>{challenge.name}</span>
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
			class="flex w-full flex-col rounded-md lg:w-[500px] lg:min-w-[500px]"
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
												<div class="flex items-center gap-4 text-left">
													<Avatar.Root class="h-10 w-10 border-4">
														{#if challenge.solve.user.discord}
															<Avatar.Image
																src={challenge.solve.user.discord.image}
																alt={`@${challenge.solve.user.discord.globalUsername}`}
															/>
														{/if}
														<Avatar.Fallback>{challenge.solve.user.avatarFallback}</Avatar.Fallback>
													</Avatar.Root>
													<div>
														<a
															class="font-medium underline underline-offset-4"
															href={`/user/${challenge.solve.user.id}`}
														>
															{#if challenge.solve.user.discord}
																{challenge.solve.user.discord.username}
															{:else}
																{challenge.solve.user.email}
															{/if}
														</a>
														<p class="text-sm text-muted-foreground">
															{#if challenge.solve.user.discord}
																@{challenge.solve.user.discord.globalUsername}
															{:else}
																{challenge.solve.user.email}
															{/if}
															{#if challenge.solve.user.id === data.session?.id}
																(You)
															{/if}
														</p>
													</div>
												</div>
												<div class="mt-1 text-sm text-muted-foreground">
													solved {uncapitalizeString(dayjs(challenge.solve.time).calendar(dayjs()))}
												</div>
											</HoverCard.Content>
										</HoverCard.Root>
									</div>
								{/if}
							</div>
							<div class="flex items-center gap-4">
								<Tooltip.Root>
									<Tooltip.Trigger class="flex h-6 w-6 items-center justify-center">
										<div class="h-3 w-3 rounded-full bg-green-500" />
									</Tooltip.Trigger>
									<Tooltip.Content>
										<p>Last checked 1s ago and is <span class="text-green-500">up</span></p>
									</Tooltip.Content>
								</Tooltip.Root>
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
												src={challenge.author.image}
												alt={`@${challenge.author.username}`}
											/>
											<Avatar.Fallback
												>{challenge.author.username.substring(0, 2).toUpperCase()}</Avatar.Fallback
											>
										</Avatar.Root>
									</HoverCard.Trigger>
									<HoverCard.Content class="w-fit">
										<div class="flex items-center gap-4 text-left">
											<Avatar.Root class="h-10 w-10 border-4">
												<Avatar.Image
													src={challenge.author.image}
													alt={`@${challenge.author.username}`}
												/>
												<Avatar.Fallback
													>{challenge.author.username
														.substring(0, 2)
														.toUpperCase()}</Avatar.Fallback
												>
											</Avatar.Root>
											<div>
												<p>
													{challenge.author.username}
												</p>
												<p class="text-sm text-muted-foreground">
													@{challenge.author.globalUsername}
												</p>
											</div>
										</div>
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
