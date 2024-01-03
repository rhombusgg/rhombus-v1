<script lang="ts">
	import { buttonVariants } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Form from '$lib/components/ui/form';
	import { formSchema, type FormSchema } from './schema';
	import { goto, invalidate, invalidateAll } from '$app/navigation';
	import type { SuperValidated } from 'sveltekit-superforms';
	import toast from 'svelte-french-toast';
	import { page } from '$app/stores';

	export let open: boolean;
	export let form: SuperValidated<FormSchema>;
	export let existingDivision:
		| {
				id: string;
				name: string;
				info: string;
				emailRegex: string;
				teamCount: number;
		  }
		| undefined;

	// $: edit = $page.url.searchParams.get('division');
	// $: open = !!edit;
</script>

<Dialog.Root bind:open onOpenChange={(isOpen) => isOpen || goto('/admin/divisions')}>
	<Dialog.Trigger class={buttonVariants({ variant: 'outline' })}>New Division</Dialog.Trigger>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>{existingDivision ? 'Edit Division' : 'New Division'}</Dialog.Title>
			<Dialog.Description>
				{#if existingDivision}
					Edit an existing division
				{:else}
					Create a new division to split users into different scoreboards
				{/if}
			</Dialog.Description>
		</Dialog.Header>
		<Form.Root
			method="POST"
			{form}
			schema={formSchema}
			let:config
			options={{
				async onUpdate({ form }) {
					if (form.valid) {
						toast.success(existingDivision ? 'Edited division' : 'Created division');
						open = false;
						await invalidate('divisions');
						await goto('/admin/divisions');
					}
				}
			}}
		>
			{#if existingDivision}
				<input type="hidden" name="existingDivisionId" value={existingDivision.id} />
			{/if}
			<Form.Field {config} name="name">
				<Form.Item>
					<Form.Label>Name</Form.Label>
					<Form.Input />
					<Form.Description>User facing name of the division.</Form.Description>
					<Form.Validation />
				</Form.Item>
			</Form.Field>
			<Form.Field {config} name="info">
				<Form.Item>
					<Form.Label>Short Description</Form.Label>
					<Form.Input />
					<Form.Description>
						User facing description of the division and its requirements.
					</Form.Description>
					<Form.Validation />
				</Form.Item>
			</Form.Field>
			<Form.Field {config} name="regex">
				<Form.Item>
					<Form.Label>Email Regex</Form.Label>
					<Form.Input />
					<Form.Description>
						Only users with emails matching this regex will be able to join this division.
					</Form.Description>
					<Form.Validation />
				</Form.Item>
			</Form.Field>
			<Form.Button>Submit</Form.Button>
		</Form.Root>
	</Dialog.Content>
</Dialog.Root>
