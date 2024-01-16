<script lang="ts">
	import { createTable, Render, Subscribe, createRender } from 'svelte-headless-table';
	import { writable, type Writable } from 'svelte/store';
	import { addPagination, addSortBy, addTableFilter } from 'svelte-headless-table/plugins';
	import * as Table from '$lib/components/ui/table';
	import TableActions from './table-actions.svelte';
	import { Button } from '$lib/components/ui/button';
	import { ArrowUpDown } from 'lucide-svelte';
	import { Input } from '$lib/components/ui/input';
	import Name from './name.svelte';
	import Writeups from './writeups.svelte';
	import Category from './category.svelte';

	export let challenges: {
		challenge: {
			id: string;
			name: string;
			slug: string;
			description: string;
			category: {
				id: string;
				name: string;
				color: string;
			};
			difficulty: string;
			flag: string;
			ticketTemplate: string;
			points: number;
			isDynamicScoring: boolean;
			authorId: string;
			writeupCount: number;
			solveCount: number;
		};
	}[];

	export let dialogOpen: Writable<boolean>;
	export let categoryStore: Writable<
		| {
				id: string;
				name: string;
				color: string;
		  }
		| undefined
	>;

	const dstore = writable(challenges);
	$: $dstore = challenges;
	const table = createTable(dstore, {
		page: addPagination(),
		sort: addSortBy(),
		filter: addTableFilter({
			fn: ({ filterValue, value }) => value.toLowerCase().includes(filterValue.toLowerCase())
		})
	});

	const columns = table.createColumns([
		table.column({
			id: 'name',
			accessor: 'challenge',
			header: 'Name',
			cell: ({ value }) => createRender(Name, { name: value.name, slug: value.slug }),
			plugins: {
				sort: {
					getSortValue(value) {
						return value.name;
					}
				}
			}
		}),
		table.column({
			id: 'description',
			accessor: 'challenge',
			header: 'Description',
			cell: ({ value }) =>
				value.description.length > 50 ? value.description.slice(0, 50) + '...' : value.description
		}),
		table.column({
			id: 'category',
			accessor: 'challenge',
			header: 'Category',
			cell: ({ value }) =>
				createRender(Category, { category: value.category, dialogOpen, categoryStore }),
			plugins: {
				sort: {
					getSortValue(value) {
						return value.category.name;
					}
				}
			}
		}),
		table.column({
			id: 'difficulty',
			accessor: 'challenge',
			header: 'Difficulty',
			cell: ({ value }) => value.difficulty,
			plugins: {
				sort: {
					getSortValue(value) {
						return value.difficulty;
					}
				}
			}
		}),
		table.column({
			id: 'solves',
			accessor: 'challenge',
			header: 'Solves',
			cell: ({ value }) => value.solveCount,
			plugins: {
				sort: {
					getSortValue(value) {
						return value.solveCount;
					}
				}
			}
		}),
		table.column({
			id: 'points',
			accessor: 'challenge',
			header: 'Points',
			cell: ({ value }) =>
				value.isDynamicScoring ? `${value.points} (dynamic)` : `${value.points}`,
			plugins: {
				sort: {
					getSortValue(value) {
						return value.points;
					}
				}
			}
		}),
		table.column({
			id: 'writeups',
			accessor: 'challenge',
			header: 'Writeups',
			cell: ({ value }) => createRender(Writeups, value),
			plugins: {
				sort: {
					getSortValue(value) {
						return value.writeupCount;
					}
				}
			}
		}),
		table.column({
			id: 'actions',
			accessor: 'challenge',
			header: '',
			cell: ({ value }) => createRender(TableActions, value),
			plugins: {
				sort: {
					disable: true
				},
				filter: {
					exclude: true
				}
			}
		})
	]);

	const { headerRows, pageRows, tableAttrs, tableBodyAttrs, pluginStates } =
		table.createViewModel(columns);

	const { hasNextPage, hasPreviousPage, pageIndex } = pluginStates.page;
	const { filterValue } = pluginStates.filter;
</script>

<div>
	<div class="flex items-center py-4">
		<Input class="max-w-sm" placeholder="Filter..." type="text" bind:value={$filterValue} />
	</div>
	<div class="rounded-md border">
		<Table.Root {...$tableAttrs}>
			<Table.Header>
				{#each $headerRows as headerRow}
					<Subscribe rowAttrs={headerRow.attrs()}>
						<Table.Row>
							{#each headerRow.cells as cell (cell.id)}
								<Subscribe attrs={cell.attrs()} let:attrs props={cell.props()} let:props>
									<Table.Head {...attrs}>
										{#if ['name', 'category', 'difficulty', 'solves', 'points', 'writeups'].includes(cell.id)}
											<Button variant="ghost" on:click={props.sort.toggle}>
												<Render of={cell.render()} />
												<ArrowUpDown class={'ml-2 h-4 w-4'} />
											</Button>
										{:else}
											<Render of={cell.render()} />
										{/if}
									</Table.Head>
								</Subscribe>
							{/each}
						</Table.Row>
					</Subscribe>
				{/each}
			</Table.Header>
			<Table.Body {...$tableBodyAttrs}>
				{#each $pageRows as row (row.id)}
					<Subscribe rowAttrs={row.attrs()} let:rowAttrs>
						<Table.Row {...rowAttrs}>
							{#each row.cells as cell (cell.id)}
								<Subscribe attrs={cell.attrs()} let:attrs>
									<Table.Cell {...attrs}>
										<Render of={cell.render()} />
									</Table.Cell>
								</Subscribe>
							{/each}
						</Table.Row>
					</Subscribe>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
	<div class="flex items-center justify-end space-x-2 py-4">
		<Button
			variant="outline"
			size="sm"
			on:click={() => ($pageIndex = $pageIndex - 1)}
			disabled={!$hasPreviousPage}>Previous</Button
		>
		<Button
			variant="outline"
			size="sm"
			disabled={!$hasNextPage}
			on:click={() => ($pageIndex = $pageIndex + 1)}>Next</Button
		>
	</div>
</div>
