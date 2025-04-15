<script lang="ts">
    import type { PageData, ActionData } from './$types';
    import { enhance } from '$app/forms';
    import { Trash2, Edit, PlusCircle } from 'lucide-svelte';
    import { invalidateAll } from '$app/navigation'; // To refresh data after delete

    export let data: PageData;
    export let form: ActionData; // For delete action feedback

     $: projects = data.projects || [];

    function confirmDelete(projectName: string): boolean {
        return confirm(`Are you sure you want to delete the project "${projectName}"?`);
    }

    // Show feedback messages
    $: if (form?.message) {
        alert(form.message); // Simple feedback, replace with toast component
        form = undefined; // Clear message
         // Consider invalidateAll() here if you don't use progressive enhancement feedback properly
    } else if (form?.error) {
         alert(`Error: ${form.error}`);
         form = undefined;
    }

</script>

<svelte:head>
    <title>Admin - Projects</title>
</svelte:head>

<div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-semibold">Manage Projects</h1>
    <a href="/admin/projects/new" class="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors">
        <PlusCircle class="w-4 h-4 mr-2" />
        New Project
    </a>
</div>

<div class="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
    <table class="w-full table-auto">
        <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Image</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Slug</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created</th>
                <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            {#each projects as project (project.id)}
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td class="px-4 py-3 whitespace-nowrap">
                        {#if project.coverImageUrl}
                            <img src={project.coverImageUrl} alt="Thumb" class="w-16 h-12 object-cover rounded"/>
                        {:else}
                             <div class="w-16 h-12 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center text-xs text-gray-400">No image</div>
                        {/if}
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{project.title}</td>
                    <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{project.slug}</td>
                    <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(project.created).toLocaleDateString()}
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap text-center text-sm font-medium space-x-2">
                        <a href="/admin/projects/{project.id}/edit" class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200" title="Edit">
                            <Edit class="w-4 h-4 inline-block"/>
                        </a>
                        <!-- Delete Form -->
                        <form
                            method="POST"
                            action="?/deleteProject"
                            use:enhance={() => {
                                if (!confirmDelete(project.title)) return { cancel: true }; // Client-side confirm

                                // Optimistic UI or just refresh after action
                                return async ({ update }) => {
                                    await update({ reset: false }); // Update `form` prop, don't reset form fields
                                    invalidateAll(); // Force reload data on this page
                                };
                            }}
                            class="inline-block"
                        >
                            <input type="hidden" name="id" value={project.id} />
                            <button type="submit" class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200" title="Delete">
                                <Trash2 class="w-4 h-4 inline-block"/>
                            </button>
                        </form>
                    </td>
                </tr>
            {:else}
                <tr>
                     <td colspan="5" class="text-center py-6 text-gray-500 dark:text-gray-400">No projects found.</td>
                </tr>
            {/each}
        </tbody>
    </table>
    <!-- Add Pagination controls here later -->
</div>