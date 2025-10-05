<script lang="ts">
    import type { ActionData } from './$types';
    import { enhance } from '$app/forms'; // For progressive enhancement

    export let form: ActionData; // Holds data returned from the server action (success/error/field values)

    // Reactive variables to clear form on success
    let name = form?.name ?? '';
    let email = form?.email ?? '';
    let subject = form?.subject ?? '';
    let message = form?.message ?? '';

    $: if (form?.success) {
        name = '';
        email = '';
        subject = '';
        message = '';
        // Optionally reset the form object itself after a short delay
        // setTimeout(() => { form = undefined; }, 3000);
    }

    export let data
</script>

<svelte:head>
    <title>Contact Me - {data.siteSettings?.siteTitle || 'Portfolio'}</title> <!-- Assuming siteSettings is loaded from layout -->
    <meta name="description" content="Get in touch with me." />
</svelte:head>

<h1 class="text-3xl font-bold mb-6 text-accent">Contact Me</h1>

<div class="bg-secondary p-6 rounded-lg shadow-md max-w-xl mx-auto text-text">
	{#if form?.success}
		<div
			class="mb-4 p-3 bg-green-500/20 border border-green-500/50 text-green-700 dark:text-green-300 rounded"
		>
			{form.message}
		</div>
	{/if}

	{#if form?.error && !form?.success}
		<div
			class="mb-4 p-3 bg-red-500/20 border border-red-500/50 text-red-700 dark:text-red-300 rounded"
		>
			{form.error}
		</div>
	{/if}

	<form method="POST" use:enhance>
		<div class="mb-4">
			<label for="name" class="block text-sm font-medium text-text mb-1"
				>Name <span class="text-red-500">*</span></label
			>
			<input
				type="text"
				id="name"
				name="name"
				bind:value={name}
				required
				class="w-full px-3 py-2 border border-primary rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent bg-primary"
			/>
		</div>

		<div class="mb-4">
			<label for="email" class="block text-sm font-medium text-text mb-1"
				>Email <span class="text-red-500">*</span></label
			>
			<input
				type="email"
				id="email"
				name="email"
				bind:value={email}
				required
				class="w-full px-3 py-2 border border-primary rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent bg-primary"
			/>
		</div>

		<div class="mb-4">
			<label for="subject" class="block text-sm font-medium text-text mb-1">Subject</label>
			<input
				type="text"
				id="subject"
				name="subject"
				bind:value={subject}
				class="w-full px-3 py-2 border border-primary rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent bg-primary"
			/>
		</div>

		<div class="mb-6">
			<label for="message" class="block text-sm font-medium text-text mb-1"
				>Message <span class="text-red-500">*</span></label
			>
			<textarea
				id="message"
				name="message"
				rows="5"
				bind:value={message}
				required
				class="w-full px-3 py-2 border border-primary rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent bg-primary"
			></textarea>
		</div>

		<div>
			<button
				type="submit"
				class="w-full px-4 py-2 bg-accent hover:bg-accent/90 text-white font-medium rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent dark:focus:ring-offset-gray-800"
			>
				Send Message
			</button>
		</div>
	</form>
</div>