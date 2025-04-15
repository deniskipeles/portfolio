<script lang="ts">
    // --- Imports and Type Definitions ---
    import type { ActionData } from './$types'; // Placeholder, adjust based on actual route
    import { enhance } from '$app/forms';
    import { Loader2, Save } from 'lucide-svelte'; // Ensure lucide-svelte is installed

    // Define expected input structure (adjust fields as needed)
    export interface BlogPostFormData {
        id?: string;
        title?: string;
        slug?: string;
        excerpt?: string;
        content?: string; // Use textarea for now, replace with Rich Text Editor later
        coverImage?: string; // This will be the file name if exists
        publishedDate?: string; // Format YYYY-MM-DD for input type="date"
        tags?: string; // Comma-separated
        isPublished?: boolean;
        // For display/handling existing images
        currentCoverUrl?: string | null;
    }

    // Define expected action result structure
    type FormActionResult = {
        data?: BlogPostFormData; // Data to repopulate form on error
        error?: string;
        fieldErrors?: Record<string, string>;
        message?: string;
        success?: boolean;
    } | undefined;

    // --- Props ---
    export let post: Partial<BlogPostFormData> | null = null; // Existing post for editing
    export let actionResult: FormActionResult; // Data from server action

    // --- Form State ---
    // Initialize state from actionResult (if validation failed) or the loaded post
    let title = actionResult?.data?.title ?? post?.title ?? '';
    let slug = actionResult?.data?.slug ?? post?.slug ?? '';
    let excerpt = actionResult?.data?.excerpt ?? post?.excerpt ?? '';
    let content = actionResult?.data?.content ?? post?.content ?? '';
    let publishedDate = actionResult?.data?.publishedDate ?? (post?.publishedDate ? post.publishedDate.split('T')[0] : ''); // Format for date input
    let tags = actionResult?.data?.tags ?? post?.tags ?? '';
    let isPublished = actionResult?.data?.isPublished ?? post?.isPublished ?? true; // Default to published

    // Handle existing cover image display
    let currentCoverUrl = actionResult?.data?.currentCoverUrl ?? post?.currentCoverUrl ?? null;
    let coverImageFile: FileList | null = null; // For new uploads

    let isSubmitting = false;

    // --- Reactive Updates ---
    // If actionResult changes (e.g., validation error), update local state
    $: if (actionResult?.data) {
        title = actionResult.data.title ?? title;
        slug = actionResult.data.slug ?? slug;
        excerpt = actionResult.data.excerpt ?? excerpt;
        content = actionResult.data.content ?? content;
        publishedDate = actionResult.data.publishedDate ?? publishedDate;
        tags = actionResult.data.tags ?? tags;
        isPublished = actionResult.data.isPublished ?? isPublished;
        currentCoverUrl = actionResult.data.currentCoverUrl ?? currentCoverUrl;
    }

</script>

<!-- Feedback Messages -->
{#if actionResult?.success}
    <div class="mb-4 p-3 bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 text-green-800 dark:text-green-200 rounded">
        {actionResult.message || 'Blog post saved successfully!'}
    </div>
{/if}
{#if actionResult?.error && !actionResult.success}
     <div class="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 rounded">
         Error: {actionResult.error}
         {#if actionResult.fieldErrors}
             <ul class="list-disc list-inside mt-1 text-sm">
                 {#each Object.entries(actionResult.fieldErrors) as [field, error]}
                     <li><strong>{field}:</strong> {error}</li>
                 {/each}
             </ul>
         {/if}
     </div>
{/if}


<!-- Form -->
<form
    method="POST"
    enctype="multipart/form-data"
    action="?/save"
    use:enhance={() => {
        isSubmitting = true;
        return async ({ result, update }) => {
            await update({ reset: false }); // Update actionResult prop
            isSubmitting = false;
            // Optional: Clear file input on success
            // if (result.type === 'success') { coverImageFile = null; /* Reset input value */ }
        };
    }}
    class="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
>
    {#if post?.id}
        <input type="hidden" name="id" value={post.id} />
    {/if}

    <!-- Title -->
    <div>
        <label for="title" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Title <span class="text-red-500">*</span></label>
        <input type="text" id="title" name="title" bind:value={title} required class="mt-1 block w-full input-style" />
         {#if actionResult?.fieldErrors?.title}<p class="text-xs text-red-500 mt-1">{actionResult.fieldErrors.title}</p>{/if}
    </div>

    <!-- Slug -->
     <div>
        <label for="slug" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Slug <span class="text-red-500">*</span></label>
        <input type="text" id="slug" name="slug" bind:value={slug} required pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$" title="Use lowercase letters, numbers, and hyphens" class="mt-1 block w-full input-style" />
         {#if actionResult?.fieldErrors?.slug}<p class="text-xs text-red-500 mt-1">{actionResult.fieldErrors.slug}</p>{/if}
    </div>

    <!-- Published Date -->
    <div>
         <label for="publishedDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Published Date <span class="text-red-500">*</span></label>
         <input type="date" id="publishedDate" name="publishedDate" bind:value={publishedDate} required class="mt-1 block w-full input-style" />
         {#if actionResult?.fieldErrors?.publishedDate}<p class="text-xs text-red-500 mt-1">{actionResult.fieldErrors.publishedDate}</p>{/if}
     </div>

    <!-- Excerpt -->
    <div>
         <label for="excerpt" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Excerpt</label>
         <textarea id="excerpt" name="excerpt" bind:value={excerpt} rows="3" class="mt-1 block w-full input-style"></textarea>
    </div>

    <!-- Content (Replace with Rich Text Editor later) -->
     <div>
         <label for="content" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Content <span class="text-red-500">*</span></label>
         <textarea id="content" name="content" bind:value={content} rows="10" required class="mt-1 block w-full input-style"></textarea>
         {#if actionResult?.fieldErrors?.content}<p class="text-xs text-red-500 mt-1">{actionResult.fieldErrors.content}</p>{/if}
     </div>

    <!-- Cover Image -->
    <div>
        <label for="coverImage" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Cover Image</label>
        {#if currentCoverUrl}
            <div class="mt-2 mb-2">
                <img src={currentCoverUrl} alt="Current Cover" class="h-24 w-auto rounded" />
                <label class="inline-flex items-center text-xs mt-1">
                   <input type="checkbox" name="removeCoverImage" value="true" class="mr-1" /> Remove current image
                </label>
            </div>
        {/if}
        <input type="file" id="coverImage" name="coverImage" accept="image/*" bind:files={coverImageFile} class="mt-1 block w-full file-input-style" />
         {#if actionResult?.fieldErrors?.coverImage}<p class="text-xs text-red-500 mt-1">{actionResult.fieldErrors.coverImage}</p>{/if}
    </div>

    <!-- Tags -->
     <div>
         <label for="tags" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Tags</label>
         <input type="text" id="tags" name="tags" bind:value={tags} placeholder="e.g., sveltekit, pocketbase, tutorial" class="mt-1 block w-full input-style" />
        <p class="text-xs text-gray-500 mt-1">Comma-separated list.</p>
     </div>

    <!-- Published Status -->
     <div class="pt-2">
        <label class="flex items-center">
             <input type="checkbox" id="isPublished" name="isPublished" bind:checked={isPublished} class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-indigo-600 dark:ring-offset-gray-800" />
             <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Published?</span>
         </label>
     </div>


    <!-- Submit Button -->
    <div class="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
         <a href="/admin/blog" class="px-4 py-2 mr-3 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
             Cancel
         </a>
        <button
            type="submit"
            disabled={isSubmitting}
            class="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
        >
             {#if isSubmitting} <Loader2 class="w-4 h-4 mr-2 animate-spin" /> {:else} <Save class="w-4 h-4 mr-2" /> {/if}
             {isSubmitting ? 'Saving...' : (post?.id ? 'Update Post' : 'Create Post')}
        </button>
    </div>
</form>

<!-- <style>
    .input-style {
        @apply px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white;
    }
    .file-input-style {
         @apply text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900 dark:file:text-indigo-300 dark:hover:file:bg-indigo-800;
    }
</style> -->
<style>
    /* Regular input styles */
    .input-style {
      padding: 0.5rem 0.75rem; /* px-3 py-2 */
      border: 1px solid #d1d5db; /* border border-gray-300 */
      border-radius: 0.375rem; /* rounded-md */
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* shadow-sm */
      background-color: white;
      color: #111827;
      outline: 2px solid transparent;
      outline-offset: 2px;
      transition: all 0.15s ease;
    }
  
    /* Input focus states */
    .input-style:focus {
      outline: none; /* focus:outline-none */
      border-color: #6366f1; /* focus:border-indigo-500 */
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.5); /* focus:ring-indigo-500 */
    }
  
    /* Dark mode styles */
    .dark .input-style {
      border-color: #4b5563; /* dark:border-gray-600 */
      background-color: #374151; /* dark:bg-gray-700 */
      color: white; /* dark:text-white */
    }
  
    /* File input base styles */
    .file-input-style {
      font-size: 0.875rem; /* text-sm */
      line-height: 1.25rem;
      color: #6b7280; /* text-gray-500 */
    }
  
    /* File input button styles */
    .file-input-style::file-selector-button {
      margin-right: 1rem; /* file:mr-4 */
      padding: 0.5rem 1rem; /* file:py-2 file:px-4 */
      border-radius: 9999px; /* file:rounded-full */
      border: 0; /* file:border-0 */
      font-size: 0.875rem; /* file:text-sm */
      font-weight: 600; /* file:font-semibold */
      background-color: #eef2ff; /* file:bg-indigo-50 */
      color: #4338ca; /* file:text-indigo-700 */
      cursor: pointer;
      transition: background-color 0.2s ease;
    }
  
    /* File input button hover */
    .file-input-style:hover::file-selector-button {
      background-color: #e0e7ff; /* hover:file:bg-indigo-100 */
    }
  
    /* Dark mode file input */
    .dark .file-input-style {
      color: #9ca3af;
    }
  
    .dark .file-input-style::file-selector-button {
      background-color: #312e81; /* dark:file:bg-indigo-900 */
      color: #a5b4fc; /* dark:file:text-indigo-300 */
    }
  
    .dark .file-input-style:hover::file-selector-button {
      background-color: #3730a3; /* dark:hover:file:bg-indigo-800 */
    }
  </style>