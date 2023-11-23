<script lang="ts">
	import { flip } from 'svelte/animate';
	import { SOURCES, TRIGGERS, dndzone } from 'svelte-dnd-action';
	import { GripVertical, Maximize, Maximize2, Ticket } from 'lucide-svelte';
	import * as Tooltip from '$lib/components/ui/tooltip';
	import * as Avatar from '$lib/components/ui/avatar';
	import * as Dialog from '$lib/components/ui/dialog';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import Input from '$lib/components/ui/input/input.svelte';

	export let data;

	let challenges = data.challenges
		.map((challenge) => challenge.category)
		.filter((v, i, a) => a.indexOf(v) === i)
		.map((category) => ({
			id: category,
			challenges: data.challenges.filter((challenge) => challenge.category === category)
		}));
	type C = (typeof challenges)[number];
	type I = C['challenges'][number];

	let dragDisabled = true;

	const flipDurationMs = 200;
	function handleDndConsiderColumns(e: CustomEvent<DndEvent<C>>) {
		challenges = e.detail.items;
		if (
			e.detail.info.source === SOURCES.KEYBOARD &&
			e.detail.info.trigger === TRIGGERS.DRAG_STOPPED
		) {
			dragDisabled = true;
		}
	}
	function handleDndFinalizeColumns(e: CustomEvent<DndEvent<C>>) {
		challenges = e.detail.items;
		if (e.detail.info.source === SOURCES.POINTER) {
			dragDisabled = true;
		}
	}
	function handleDndConsiderCards(columnId: string, e: CustomEvent<DndEvent<I>>) {
		const colIdx = challenges.findIndex((c) => c.id === columnId);
		challenges[colIdx].challenges = e.detail.items;
		challenges = [...challenges];
		if (
			e.detail.info.source === SOURCES.KEYBOARD &&
			e.detail.info.trigger === TRIGGERS.DRAG_STOPPED
		) {
			dragDisabled = true;
		}
	}
	function handleDndFinalizeCards(columnId: string, e: CustomEvent<DndEvent<I>>) {
		const colIdx = challenges.findIndex((c) => c.id === columnId);
		challenges[colIdx].challenges = e.detail.items;
		challenges = [...challenges];
		if (e.detail.info.source === SOURCES.POINTER) {
			dragDisabled = true;
		}
	}
</script>

{#each data.challenges as challenge}
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
{/each}

<div
	class="mt-4 grid grid-flow-col gap-4 overflow-x-scroll px-4"
	use:dndzone={{
		items: challenges,
		flipDurationMs,
		dragDisabled,
		type: 'columns',
		dropTargetStyle: {}
	}}
	on:consider={handleDndConsiderColumns}
	on:finalize={handleDndFinalizeColumns}
>
	{#each challenges as category (category.id)}
		<div class="flex w-[500px] flex-col rounded-md" animate:flip={{ duration: flipDurationMs }}>
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
				<div>{category.id}</div>
			</div>
			<div
				class="flex flex-grow flex-col gap-2 p-2"
				use:dndzone={{
					items: category.challenges,
					flipDurationMs,
					dragDisabled,
					dropTargetStyle: {}
				}}
				on:consider={(e) => handleDndConsiderCards(category.id, e)}
				on:finalize={(e) => handleDndFinalizeCards(category.id, e)}
			>
				{#each category.challenges as challenge (challenge.id)}
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
								<Ticket class="-rotate-45" />
								<Avatar.Root class="h-8 w-8 border-4">
									<Avatar.Image
										src={challenge.author.image}
										alt={`@${challenge.author.globalUsername}`}
									/>
									<Avatar.Fallback
										>{challenge.author.globalUsername
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
