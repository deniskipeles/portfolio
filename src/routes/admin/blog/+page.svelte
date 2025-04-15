<script lang="ts">
    import type { PageData, ActionData } from './$types';
    import { enhance } from '$app/forms';
    import { Trash2, Edit, PlusCircle, CheckCircle, XCircle } from 'lucide-svelte';
    import { invalidateAll } from '$app/navigation';

    export let data: PageData;
    export let form: ActionData; // For delete action feedback

     $: posts = data.posts || [];

    function confirmDelete(postTitle: string): boolean {
        return confirm(`Are you sure you want to delete the blog post "${postTitle}"?`);
    }

    // Show feedback messages (using simple alert for now)
    $: if (form?.deleteSuccess) {
        alert(form.message);
        form = undefined;
    } else if (form?.deleteError) {
         alert(`Error: ${form.deleteError}`);
         form = undefined;
    }

</script>

<svelte:head>
    <title>Admin - Blog Posts</title>
</svelte:head>

<div class="flex justify-between items-center mb-6">
    <h1 class="text-2xl font-semibold">Manage Blog Posts</h1>
    <a href="/admin/blog/new" class="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors">
        <PlusCircle class="w-4 h-4 mr-2" />
        New Post
    </a>
</div>

<div class="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-x-auto">
    <table class="w-full table-auto">
        <thead class="bg-gray-50 dark:bg-gray-700">
            <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Title</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Slug</th>
                 <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Published Date</th>
                 <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Published</th>
                 <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            {#each posts as post (post.id)}
                <tr class="hover:bg-gray-50 dark:hover:bg-gray-750">
                    <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{post.title}</td>
                    <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{post.slug}</td>
                     <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {post.publishedDate ? new Date(post.publishedDate).toLocaleDateString() : '-'}
                     </td>
                     <td class="px-4 py-3 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-400">
                       {#if post.isPublished}
                           <CheckCircle class="w-5 h-5 text-green-500 inline-block" title="Published"/>
                       {:else}
                           <XCircle class="w-5 h-5 text-red-500 inline-block" title="Draft"/>
                       {/if}
                     </td>
                    <td class="px-4 py-3 whitespace-nowrap text-center text-sm font-medium space-x-2">
                        <a href="/admin/blog/{post.id}/edit" class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200" title="Edit">
                            <Edit class="w-4 h-4 inline-block"/>
                        </a>
                        <!-- Delete Form -->
                        <form
                            method="POST"
                            action="?/deleteBlogPost"
                            use:enhance={({ formElement }) => {
                                if (!confirmDelete(post.title)) return { cancel: true };

                                return async ({ result, update }) => {
                                    await update({ reset: false }); // Update `form` prop
                                    if (result.type === 'success' || result.type === 'redirect') {
                                        invalidateAll(); // Force reload data on this page
                                    }
                                };
                            }}
                            class="inline-block"
                        >
                            <input type="hidden" name="id" value={post.id} />
                            <button type="submit" class="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200" title="Delete">
                                <Trash2 class="w-4 h-4 inline-block"/>
                            </button>
                        </form>
                    </td>
                </tr>
            {:else}
                <tr>
                     <td colspan="5" class="text-center py-6 text-gray-500 dark:text-gray-400">No blog posts found.</td>
                </tr>
            {/each}
        </tbody>
    </table>
    <!-- Add Pagination controls here later -->
</div>