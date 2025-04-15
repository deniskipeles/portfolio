<script lang="ts">
    import type { ActionData } from './$types';
    import { enhance } from '$app/forms';

    export let form: ActionData;

    // Use form?.data?.email to repopulate email on error
    let email = form?.data?.email ?? '';
    let password = '';
    let loading = false;

</script>

<svelte:head>
    <title>Admin Login</title>
</svelte:head>

<div class="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
    <div class="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
        <h1 class="text-2xl font-bold text-center text-gray-900 dark:text-white">Admin Login</h1>

        {#if form?.error}
            <div class="p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 rounded text-sm">
                {form.error}
            </div>
        {/if}

        <form
            method="POST"
            action="?/login"
            use:enhance={() => {
                loading = true;
                return async ({ update }) => {
                    await update(); // Wait for server response to update `form`
                    loading = false;
                    password = ''; // Clear password field after attempt
                };
            }}
            class="space-y-4"
         >
            <div>
                <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    bind:value={email}
                    required
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                />
            </div>
            <div>
                <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    bind:value={password}
                    required
                    class="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                 />
            </div>
            <div>
                <button
                    type="submit"
                    disabled={loading}
                    class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 dark:focus:ring-offset-gray-800"
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </div>
        </form>
    </div>
</div>