<script lang="ts">
	import { createTable, Render, Subscribe, createRender } from 'svelte-headless-table';
	import { writable } from 'svelte/store';
	import * as Table from '$lib/components/ui/table';
	import TableActions from './table-actions.svelte';

	export let divisions: {
		division: {
			isDeletable: boolean;
			id: string;
			name: string;
			info: string;
			emailRegex: string;
			isDefault: boolean;
			teamCount: number;
		};
	}[];

	const dstore = writable(divisions);
	$: $dstore = divisions;
	const table = createTable(dstore);

	const columns = table.createColumns([
		table.column({
			accessor: 'division',
			id: 'name',
			header: 'Name',
			cell: ({ value }) => value.name
		}),
		table.column({
			accessor: 'division',
			id: 'info',
			header: 'Info',
			cell: ({ value }) => value.info
		}),
		table.column({
			accessor: 'division',
			id: 'regex',
			header: 'Email Domain Regex',
			cell: ({ value }) => value.emailRegex
		}),
		table.column({
			accessor: 'division',
			id: 'teams',
			header: 'Teams',
			cell: ({ value }) => value.teamCount
		}),
		table.column({
			accessor: 'division',
			id: 'actions',
			header: '',
			cell: ({ value }) => createRender(TableActions, value)
		})
	]);

	const { headerRows, pageRows, tableAttrs, tableBodyAttrs } = table.createViewModel(columns);
</script>

<div class="rounded-md border">
	<Table.Root {...$tableAttrs}>
		<Table.Header>
			{#each $headerRows as headerRow}
				<Subscribe rowAttrs={headerRow.attrs()} let:rowAttrs>
					<Table.Row {...rowAttrs}>
						{#each headerRow.cells as cell (cell.id)}
							<Subscribe attrs={cell.attrs()} let:attrs props={cell.props()} let:props>
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
