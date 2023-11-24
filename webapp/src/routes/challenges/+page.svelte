<script lang="ts">
	import { flip } from 'svelte/animate';
	import { SOURCES, TRIGGERS, dndzone } from 'svelte-dnd-action';
	import { GripVertical, Maximize2, Ticket } from 'lucide-svelte';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import * as Avatar from '$lib/components/ui/avatar';
	import * as Dialog from '$lib/components/ui/dialog';
	import { page } from '$app/stores';
	import { goto, invalidateAll } from '$app/navigation';
	import Input from '$lib/components/ui/input/input.svelte';
	import Editor from './editor.svelte';
	import { Button } from '$lib/components/ui/form';
	import { enhance } from '$app/forms';

	export let data;

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

<svelte:document on:focus={() => invalidateAll()} />

{#each challenges as challenge}
	<Dialog.Root
		open={$page.url.searchParams.get('challenge') === challenge.humanId}
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
			<form>
				<Input placeholder="flag..." />
			</form>
		</Dialog.Content>
	</Dialog.Root>
	<Dialog.Root
		open={$page.url.searchParams.get('ticket') === challenge.humanId}
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
			<form use:enhance method="POST" action="?/ticket" on:submit={() => goto('/challenges')}>
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
				class="flex justify-between rounded-md bg-green-500 p-4 font-bold"
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
						class="bg-card border-l-4 border-green-500 p-4"
						animate:flip={{ duration: flipDurationMs }}
					>
						<div class="mb-2 flex justify-between">
							<div class="font-bold">
								<span class="text-green-500">{challenge.category} / </span>
								<span>{challenge.difficulty} / </span>
								<span>{challenge.name}</span>
							</div>
							<div class="flex items-center gap-4">
								<Tooltip.Root>
									<Tooltip.Trigger>
										<div class="h-3 w-3 rounded-full bg-green-500" />
									</Tooltip.Trigger>
									<Tooltip.Content>
										<p>Last checked 1s ago and is <span class="text-green-500">up</span></p>
									</Tooltip.Content>
								</Tooltip.Root>
								<a href={`?ticket=${challenge.humanId}`}>
									<Ticket class="-rotate-45" />
								</a>
								<Avatar.Root class="h-8 w-8 border-4">
									<Avatar.Image
										src={challenge.author.discord?.image}
										alt={`@${challenge.author.discord?.globalUsername}`}
									/>
									<Avatar.Fallback
										>{challenge.author.discord?.globalUsername
											.substring(0, 2)
											.toUpperCase()}</Avatar.Fallback
									>
								</Avatar.Root>
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
									<GripVertical />
								</div>
							</div>
						</div>
						<div class="relative">
							{challenge.description}

							<a href={`?challenge=${challenge.humanId}`} class="absolute bottom-0 right-0 h-6 w-6">
								<Maximize2 />
							</a>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/each}
</div>
