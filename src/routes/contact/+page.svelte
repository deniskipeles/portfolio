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

<h1 class="text-3xl font-bold mb-6">Contact Me</h1>

<div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md max-w-xl mx-auto">
    {#if form?.success}
        <div class="mb-4 p-3 bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 text-green-800 dark:text-green-200 rounded">
            {form.message}
        </div>
    {/if}

    {#if form?.error && !form?.success}
         <div class="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 rounded">
            {form.error}
         </div>
    {/if}

    <form method="POST" use:enhance>
        <div class="mb-4">
            <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name <span class="text-red-500">*</span></label>
            <input type="text" id="name" name="name" bind:value={name} required class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white">
        </div>

        <div class="mb-4">
            <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email <span class="text-red-500">*</span></label>
            <input type="email" id="email" name="email" bind:value={email} required class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white">
        </div>

         <div class="mb-4">
            <label for="subject" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
            <input type="text" id="subject" name="subject" bind:value={subject} class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white">
        </div>

        <div class="mb-6">
            <label for="message" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message <span class="text-red-500">*</span></label>
            <textarea id="message" name="message" rows="5" bind:value={message} required class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"></textarea>
        </div>

        <div>
            <button type="submit" class="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800">
                Send Message
            </button>
        </div>
    </form>
</div>