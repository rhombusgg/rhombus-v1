<script lang="ts">
	import { flip } from 'svelte/animate';
	import { SOURCES, TRIGGERS, dndzone } from 'svelte-dnd-action';
	import { GripVertical } from 'lucide-svelte';

	interface Column {
		id: number;
		name: string;
		items: Item[];
	}

	interface Item {
		id: number;
		name: string;
	}

	let board = [
		{
			id: 1,
			name: 'web',
			items: [
				{ id: 41, name: 'item41' },
				{ id: 42, name: 'item42' },
				{ id: 43, name: 'item43' },
				{ id: 44, name: 'item44' },
				{ id: 45, name: 'item45' },
				{ id: 46, name: 'item46' },
				{ id: 47, name: 'item47' },
				{ id: 48, name: 'item48' },
				{ id: 49, name: 'item49' },
				{ id: 50, name: 'item49' },
				{ id: 51, name: 'item49' },
				{ id: 52, name: 'item49' },
				{ id: 53, name: 'item49' },
				{ id: 54, name: 'item49' },
				{ id: 55, name: 'item49' },
				{ id: 56, name: 'item49' },
				{ id: 57, name: 'item49' },
				{ id: 58, name: 'item49' },
				{ id: 59, name: 'item49' },
				{ id: 60, name: 'item49' }
			]
		},
		{
			id: 2,
			name: 'pwn',
			items: []
		},
		{
			id: 3,
			name: 'crypto',
			items: []
		},
		{
			id: 4,
			name: 'misc',
			items: []
		},
		{
			id: 5,
			name: 'forensics',
			items: []
		}
	];

	let dragDisabled = true;

	const flipDurationMs = 200;
	function handleDndConsiderColumns(e: CustomEvent<DndEvent<Column>>) {
		board = e.detail.items;
		if (
			e.detail.info.source === SOURCES.KEYBOARD &&
			e.detail.info.trigger === TRIGGERS.DRAG_STOPPED
		) {
			dragDisabled = true;
		}
	}
	function handleDndFinalizeColumns(e: CustomEvent<DndEvent<Column>>) {
		board = e.detail.items;
		if (e.detail.info.source === SOURCES.POINTER) {
			dragDisabled = true;
		}
	}
	function handleDndConsiderCards(columnId: number, e: CustomEvent<DndEvent<Item>>) {
		const colIdx = board.findIndex((c) => c.id === columnId);
		board[colIdx].items = e.detail.items;
		board = [...board];
		if (
			e.detail.info.source === SOURCES.KEYBOARD &&
			e.detail.info.trigger === TRIGGERS.DRAG_STOPPED
		) {
			dragDisabled = true;
		}
	}
	function handleDndFinalizeCards(columnId: number, e: CustomEvent<DndEvent<Item>>) {
		const colIdx = board.findIndex((c) => c.id === columnId);
		board[colIdx].items = e.detail.items;
		board = [...board];
		if (e.detail.info.source === SOURCES.POINTER) {
			dragDisabled = true;
		}
	}
</script>

<div
	class="mt-4 grid grid-flow-col gap-4 overflow-x-scroll px-4"
	use:dndzone={{
		items: board,
		flipDurationMs,
		dragDisabled,
		type: 'columns',
		dropTargetStyle: {}
	}}
	on:consider={handleDndConsiderColumns}
	on:finalize={handleDndFinalizeColumns}
>
	{#each board as column (column.id)}
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
				<div>{column.name}</div>
			</div>
			<div
				class="flex flex-grow flex-col gap-2 p-2"
				use:dndzone={{ items: column.items, flipDurationMs, dragDisabled, dropTargetStyle: {} }}
				on:consider={(e) => handleDndConsiderCards(column.id, e)}
				on:finalize={(e) => handleDndFinalizeCards(column.id, e)}
			>
				{#each column.items as item (item.id)}
					<div
						class="bg-card border-l-4 border-green-500 p-4"
						animate:flip={{ duration: flipDurationMs }}
					>
						<div class="flex justify-between">
							<div class="font-bold">{item.name}</div>
							<div
								tabindex={dragDisabled ? 0 : -1}
								class="h-5 w-5"
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
				{/each}
			</div>
		</div>
	{/each}
</div>
