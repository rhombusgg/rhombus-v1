<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import { MoreHorizontal, Pencil, Trash2 } from 'lucide-svelte';
	export let id: string;
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger asChild let:builder>
		<Button variant="ghost" builders={[builder]} size="icon" class="relative h-8 w-8 p-0">
			<span class="sr-only">Open menu</span>
			<MoreHorizontal class="h-4 w-4" />
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content>
		<DropdownMenu.Item href={`challenges/challenge/${id}`}
			><Pencil class="mr-2 h-4 w-4" /> Edit</DropdownMenu.Item
		>
		<DropdownMenu.Item><Trash2 class="mr-2 h-4 w-4" /> Delete</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
