<script lang="ts">
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { Button } from '$lib/components/ui/button';
	import { MoreHorizontal, Pencil, ShieldAlert, Trash2, Waypoints } from 'lucide-svelte';
	import DropdownMenuSeparator from '$lib/components/ui/dropdown-menu/dropdown-menu-separator.svelte';
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
		<DropdownMenu.Item><Waypoints class="mr-2 h-4 w-4" /> View IPs</DropdownMenu.Item>
		<DropdownMenuSeparator />
		<DropdownMenu.Item href={`challenges/challenge/${id}`}
			><ShieldAlert class="mr-2 h-4 w-4" /> Make Admin</DropdownMenu.Item
		>
		<DropdownMenu.Item><Trash2 class="mr-2 h-4 w-4" /> Delete</DropdownMenu.Item>
	</DropdownMenu.Content>
</DropdownMenu.Root>
