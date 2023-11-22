<script lang="ts">
	import { signInDiscord } from '$lib/clientAuth';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { DiscordLogo } from 'radix-icons-svelte';
	import * as Form from '$lib/components/ui/form';
	import { formSchema } from './schema';
	import { Check, Loader2 } from 'lucide-svelte';

	export let form;
	export let data;
</script>

<div class="flex flex-grow flex-col items-center justify-center gap-y-6">
	<div class="flex max-w-md flex-col gap-y-2 text-center">
		<h1 class="text-2xl font-semibold tracking-tight">Sign In</h1>
		<p class="text-muted-foreground text-sm">
			Authenticate below to create or join a team. Sign in with Discord to get rich feature
			integrations.
		</p>
	</div>
	<Dialog.Root open={form?.form.valid}>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Email Sent!</Dialog.Title>
				<Dialog.Description>
					Check your email for a magic link to sign in with. When you get it, you can close this
					tab.
				</Dialog.Description>
			</Dialog.Header>
		</Dialog.Content>
	</Dialog.Root>
	<div class="grid gap-4 sm:w-96">
		<Button variant="outline" type="button" on:click={() => void signInDiscord()}
			><DiscordLogo class="mr-2 h-4 w-4" /> Discord</Button
		>
		<div class="relative">
			<div class="absolute inset-0 flex items-center">
				<span class="w-full border-t" />
			</div>
			<div class="relative flex justify-center text-xs uppercase">
				<span class="bg-background text-muted-foreground px-2"> Or continue with Email </span>
			</div>
		</div>
		<Form.Root
			method="POST"
			form={data.form}
			schema={formSchema}
			let:config
			let:submitting
			let:posted
			class="grid gap-2"
		>
			<Form.Field {config} name="email">
				<Form.Item>
					<Form.Validation />
					<Form.Input placeholder="name@example.com" />
				</Form.Item>
			</Form.Field>
			<Form.Button
				>Sign in with Email {#if submitting}
					<Loader2 class="ml-2 h-4 w-4 animate-spin" />
				{:else if posted}
					<Check class="ml-2 h-4 w-4" />
				{/if}</Form.Button
			>
		</Form.Root>
	</div>
	<p class="text-muted-foreground px-8 text-center text-sm">
		By continuing, you agree to our{' '}
		<a href="/terms" target="_blank" class="font-medium underline underline-offset-4">Terms</a>.
	</p>
</div>
