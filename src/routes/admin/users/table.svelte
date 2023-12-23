<script lang="ts">
	import { createTable, Render, Subscribe, createRender } from 'svelte-headless-table';
	import { readable } from 'svelte/store';
	import { addPagination, addSortBy, addTableFilter } from 'svelte-headless-table/plugins';
	import * as Table from '$lib/components/ui/table';
	import TableActions from './table-actions.svelte';
	import { Button } from '$lib/components/ui/button';
	import { ArrowUpDown } from 'lucide-svelte';
	import { Input } from '$lib/components/ui/input';
	import DiscordAvatar from './discord-avatar.svelte';
	import Email from './email.svelte';
	import Team from './team.svelte';

	export let users: {
		id: string;
		isAdmin: boolean;
		email: { email: string; userId: string };
		team: { name: string; id: string };
		teamId: string;
		discord:
			| {
					username: string;
					globalUsername: string;
					image: string;
					userId: string;
			  }
			| undefined;
		ips: string[];
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
			accessor: 'discord',
			header: 'Discord',
			cell: ({ value }) => (value ? createRender(DiscordAvatar, value) : 'None')
		}),
		table.column({
			accessor: 'email',
			header: 'Email',
			cell: ({ value }) => createRender(Email, value)
		}),
		table.column({
			accessor: 'team',
			header: 'Team',
			cell: ({ value }) => createRender(Team, value)
		}),
		table.column({
			accessor: 'ips',
			header: 'IPs',
			cell: ({ value: ips }) =>
				ips.filter((ip, index) => index <= 1).join(', ') + (ips.length > 2 ? ', ...' : '')
		}),
		table.column({
			accessor: 'isAdmin',
			header: 'Admin',
			cell: ({ value: isAdmin }) => (isAdmin ? 'Yes' : 'No')
		}),
		table.column({
			accessor: ({ id }) => id,
			header: '',
			cell: ({ value: id }) => createRender(TableActions, { id }),
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
										{#if ['isAdmin'].includes(cell.id)}
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
