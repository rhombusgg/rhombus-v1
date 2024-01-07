<script lang="ts">
	import { page } from '$app/stores';
	import { signInDiscordUrl } from '$lib/clientAuth';
	import { buttonVariants } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import clsx from 'clsx';
	import { Check, Loader2, Send } from 'lucide-svelte';
	import { DiscordLogo } from 'radix-icons-svelte';
	import * as Form from '$lib/components/ui/form';
	import { newEmailSchema } from './schema.js';
	import toast from 'svelte-french-toast';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';

	export let data;

	$: error = $page.url.searchParams.get('error');
	$: {
		if (error) {
			toast.error(error);
			if (browser) goto('/account');
		}
	}
</script>

<svelte:head>
	<title>Account</title>
	<meta name="description" content="Manage your individual account settings." />
</svelte:head>

{#if $page.data.session}
	<div class="container">
		<div class="mb-4 mt-4 space-y-0.5">
			<h2 class="text-2xl font-bold tracking-tight">Account</h2>
			<p class="text-muted-foreground">Manage your individual account settings.</p>
		</div>
		<div class="grid h-fit gap-6 md:grid-cols-2 lg:grid-cols-3">
			<Card.Root>
				<Card.Header>
					<Card.Title>Discord Integration</Card.Title>
					<Card.Description
						>Link your Discord account to get rich feature integrations</Card.Description
					>
				</Card.Header>
				<Card.Content>
					<div class="ml-[18px] mt-1 border-l pl-8">
						<h3 class="flex items-center text-xl font-semibold tracking-tight">
							<div
								class={clsx(
									'absolute ml-[-50px] inline-flex h-9 w-9 items-center justify-center rounded-full border-4',
									$page.data.session.discord ? 'bg-green-500' : 'bg-border'
								)}
							>
								{#if $page.data.session.discord}
									<Check class="h-4 w-4" />
								{:else}
									<DiscordLogo class="h-4 w-4" />
								{/if}
							</div>
							Link Discord
						</h3>
						<p class="mt-2">
							Challenge authors are on the Discord and verifying your Discord account allows for
							better one-on-one communication with issues.
						</p>
						{#if !$page.data.session.discord}
							<a class={clsx(buttonVariants(), 'mt-2')} href={signInDiscordUrl}>Link Discord</a>
						{/if}

						<h3 class="mt-8 flex items-center text-xl font-semibold tracking-tight">
							<div
								class={clsx(
									'absolute ml-[-50px] inline-flex h-9 w-9 items-center justify-center rounded-full border-4',
									data.inGuild ? 'bg-green-500' : 'bg-border'
								)}
							>
								{#if data.inGuild}
									<Check class="h-4 w-4" />
								{:else}
									<DiscordLogo class="h-4 w-4" />
								{/if}
							</div>
							Join Server
						</h3>
						<p class="mt-2">
							Join the official Discord server to get important announcements and chat with other
							competitors.
						</p>
						{#if !data.inGuild}
							<a class={clsx(buttonVariants(), 'mt-2')} href={'https://discord.com'}>Join Server</a>
						{/if}
					</div>
				</Card.Content>
			</Card.Root>
			<Card.Root class="flex flex-col">
				<Card.Header>
					<Card.Title>Emails</Card.Title>
					<Card.Description
						>Manage connected emails to qualify for certain divisions</Card.Description
					>
				</Card.Header>
				<Card.Content class="flex flex-1 flex-col justify-between">
					<div>
						{#each $page.data.session.emails as email, i}
							<div class={clsx('p-2', i % 2 == 0 && 'bg-accent')}>
								{email}
							</div>
						{/each}
					</div>
					<Form.Root
						method="POST"
						action="?/addEmail"
						form={data.newEmailForm}
						options={{
							onUpdate({ form }) {
								if (form.message) {
									toast.error(form.message);
								}
								if (form.valid) {
									toast.success('Sent verification email!');
								}
							}
						}}
						schema={newEmailSchema}
						let:config
						let:submitting
					>
						<Form.Field {config} name="email">
							<Form.Item>
								<Form.Label>Verify a new email to connect it to this account</Form.Label>
								<Form.Validation />
								<div class="flex gap-2">
									<Form.Input placeholder="email to verify..." autocomplete="off" />
									<Form.Button>
										{#if submitting}
											<Loader2 class="animate-spin" />
										{:else}
											<Send />
										{/if}
									</Form.Button>
								</div>
							</Form.Item>
						</Form.Field>
					</Form.Root>
					<!-- <form use:enhance method="POST" action="?/addEmail" class="flex">
						<Input
							name="email"
							type="email"
							placeholder="email to verify..."
							required
							autocomplete="email"
						/>
						<Button class="ml-2" type="submit">
							<Send />
						</Button>
					</form> -->
				</Card.Content>
			</Card.Root>
			<!-- <Card.Root>
				<Card.Header>
					<Card.Title>Support Tickets</Card.Title>
					<Card.Description>Review submitted support tickets</Card.Description>
				</Card.Header>
				<Card.Content>A</Card.Content>
			</Card.Root> -->
			<!-- <Card.Root>
				<Card.Header>
					<Card.Title>API Tokens</Card.Title>
					<Card.Description>Manage API tokens for the provided REST API</Card.Description>
				</Card.Header>
				<Card.Content>A</Card.Content>
			</Card.Root> -->
		</div>
	</div>
{/if}
