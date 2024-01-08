<script lang="ts">
	import { addPagination, addTableFilter } from 'svelte-headless-table/plugins';
	import { createTable, Render, Subscribe, createRender } from 'svelte-headless-table';
	import { readable } from 'svelte/store';
	import * as Table from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import UserAvatar from '$lib/components/user-avatar.svelte';
	import Team from '../../../users/team.svelte';
	import Link from './link.svelte';
	import { avatarFallback } from '$lib/utils';

	export let writeups: {
		writeup: {
			user: {
				discord: {
					id: string;
					username: string;
					globalUsername: string;
					image: string;
				} | null;
				id: string;
				emails: {
					email: string;
				}[];
				team: {
					id: string;
					name: string;
				} | null;
			};
			link: string;
		};
	}[];

	const table = createTable(readable(writeups), {
		page: addPagination(),
		filter: addTableFilter({
			fn: ({ filterValue, value }) => value.toLowerCase().includes(filterValue.toLowerCase())
		})
	});

	const columns = table.createColumns([
		table.column({
			accessor: 'writeup',
			id: 'user',
			header: 'User',
			cell: ({ value }) =>
				createRender(UserAvatar, {
					discord: value.user.discord,
					id: value.user.id,
					email: value.user.emails[0].email,
					avatarFallback: avatarFallback(value.user)
				})
		}),
		table.column({
			accessor: 'writeup',
			id: 'team',
			header: 'Team',
			cell: ({ value }) => createRender(Team, value.user.team!)
		}),
		table.column({
			accessor: 'writeup',
			id: 'link',
			header: 'Link',
			cell: ({ value }) => createRender(Link, value)
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
								<Subscribe attrs={cell.attrs()} let:attrs props={cell.props()}>
									<Table.Head {...attrs}>
										<Render of={cell.render()} />
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
