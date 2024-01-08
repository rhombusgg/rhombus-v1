<script lang="ts">
	import { addPagination, addSortBy, addTableFilter } from 'svelte-headless-table/plugins';
	import { createTable, Render, Subscribe, createRender } from 'svelte-headless-table';
	import { readable } from 'svelte/store';
	import * as Table from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { ArrowUpDown } from 'lucide-svelte';
	import TableActions from './table-actions.svelte';
	import Email from './email.svelte';
	import Team from './team.svelte';
	import UserAvatar from '$lib/components/user-avatar.svelte';

	export let users: {
		user: {
			id: string;
			isAdmin: boolean;
			emails: string[];
			team: { name: string; id: string };
			discord:
				| {
						id: string;
						username: string;
						globalUsername: string;
						image: string;
				  }
				| undefined;
			ips: string[];
		};
	}[];

	const table = createTable(readable(users), {
		page: addPagination(),
		sort: addSortBy(),
		filter: addTableFilter({
			fn: ({ filterValue, value }) => value.toLowerCase().includes(filterValue.toLowerCase())
		})
	});

	const columns = table.createColumns([
		table.column({
			accessor: 'user',
			id: 'discord',
			header: 'Discord',
			cell: ({ value }) =>
				value.discord
					? createRender(UserAvatar, {
							discord: value.discord,
							id: value.id
						})
					: 'None'
		}),
		table.column({
			accessor: 'user',
			id: 'emails',
			header: 'Emails',
			cell: ({ value }) => createRender(Email, { emails: value.emails }),
			plugins: {
				filter: {
					getFilterValue(value) {
						return value.emails.join(' ');
					}
				}
			}
		}),
		table.column({
			accessor: 'user',
			id: 'team',
			header: 'Team',
			cell: ({ value }) => createRender(Team, value.team),
			plugins: {
				sort: {
					compareFn(left, right) {
						return left.name < right.name ? -1 : left.name > right.name ? 1 : 0;
					}
				}
			}
		}),
		table.column({
			accessor: 'user',
			id: 'ips',
			header: 'IPs',
			cell: ({ value }) =>
				value.ips.filter((_, index) => index <= 1).join(', ') +
				(value.ips.length > 2 ? ', ...' : '')
		}),
		table.column({
			accessor: 'user',
			id: 'isAdmin',
			header: 'Admin',
			cell: ({ value }) => (value.isAdmin ? 'Yes' : 'No'),
			plugins: {
				sort: {
					compareFn(left) {
						return left ? 1 : -1;
					}
				}
			}
		}),
		table.column({
			id: 'actions',
			accessor: 'user',
			header: '',
			cell: ({ value }) => createRender(TableActions, { user: value }),
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
										{#if ['team', 'isAdmin'].includes(cell.id)}
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
