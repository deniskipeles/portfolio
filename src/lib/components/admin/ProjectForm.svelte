<script lang="ts">
    import type { Project } from '$lib/pocketbase'; // Import your Project type
    import { enhance } from '$app/forms';
    import { Loader2, Save } from 'lucide-svelte'; // Loading spinner

    // Define expected input/output for the form action data
    type FormActionResult = {
        data?: Partial<Project> & { currentCoverUrl?: string, currentGalleryUrls?: string[] };
        error?: string;
        fieldErrors?: Record<string, string>; // Field-specific errors
        message?: string;
        success?: boolean;
    } | undefined;

    export let project: Partial<Project> | null = null; // Pass existing project for editing, null for new
    export let actionResult: FormActionResult; // Data from server action (errors, success message)

     // Form state - initialize from `project` or action result's `data` if exists (on error)
    let title = actionResult?.data?.title ?? project?.title ?? '';
    let slug = actionResult?.data?.slug ?? project?.slug ?? '';
    let excerpt = actionResult?.data?.excerpt ?? project?.excerpt ?? '';
    let description = actionResult?.data?.description ?? project?.description ?? '';
    let technologies = actionResult?.data?.technologies ?? project?.technologies ?? '';
    let projectUrl = actionResult?.data?.projectUrl ?? project?.projectUrl ?? '';
    let repoUrl = actionResult?.data?.repoUrl ?? project?.repoUrl ?? '';
    let order = actionResult?.data?.order ?? project?.order ?? null;
    let featured = actionResult?.data?.featured ?? project?.featured ?? false;

    // Store current image URLs passed from server to display previews
    let currentCoverUrl = actionResult?.data?.currentCoverUrl ?? null;
    let currentGalleryUrls = actionResult?.data?.currentGalleryUrls ?? [];

     let coverImageFile: FileList | null = null;
     let galleryFiles: FileList | null = null;

    let isSubmitting = false;

    // Reactive updates if actionResult changes (e.g., validation error)
    $: if (actionResult?.data) {
        title = actionResult.data.title ?? title;
        slug = actionResult.data.slug ?? slug;
        // ... update other fields similarly ...
        currentCoverUrl = actionResult.data.currentCoverUrl ?? currentCoverUrl;
        currentGalleryUrls = actionResult.data.currentGalleryUrls ?? currentGalleryUrls;
    }

</script>

{#if actionResult?.success}
    <div class="mb-4 p-3 bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700 text-green-800 dark:text-green-200 rounded">
        {actionResult.message}
    </div>
{/if}
{#if actionResult?.error && !actionResult.success}
     <div class="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 rounded">
         Error: {actionResult.error}
     </div>
{/if}

<!-- Note: We need enctype="multipart/form-data" for file uploads -->
<form
    method="POST"
    enctype="multipart/form-data"
    action="?/save"
    use:enhance={() => {
        isSubmitting = true;
        return async ({ result, update }) => {
            // result contains the ActionData returned by the server
            // update() will update the `actionResult` prop
            await update({ reset: false }); // Don't reset form fields automatically
            isSubmitting = false;

             // Optional: Clear file inputs after successful upload if needed
             // if (result.type === 'success' && result.status === 200) {
             //    coverImageFile = null;
             //    galleryFiles = null;
             //    // You might need to manually query and reset the input elements' value
             // }
        };
    }}
    class="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
>
    {#if project?.id}
        <input type="hidden" name="id" value={project.id} />
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
        <input type="text" id="slug" name="slug" bind:value={slug} required pattern="^[a-z0-9]+(?:-[a-z0-9]+)*$" title="Use lowercase letters, numbers, and hyphens (e.g., my-cool-project)" class="mt-1 block w-full input-style" />
        <p class="text-xs text-gray-500 mt-1">URL-friendly identifier (e.g., my-cool-project).</p>
         {#if actionResult?.fieldErrors?.slug}<p class="text-xs text-red-500 mt-1">{actionResult.fieldErrors.slug}</p>{/if}
    </div>

    <!-- Excerpt -->
    <div>
         <label for="excerpt" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Excerpt</label>
         <textarea id="excerpt" name="excerpt" bind:value={excerpt} rows="3" class="mt-1 block w-full input-style"></textarea>
    </div>

     <!-- Description (Consider a Markdown Editor component here later) -->
     <div>
         <label for="description" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
         <textarea id="description" name="description" bind:value={description} rows="8" class="mt-1 block w-full input-style"></textarea>
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
         <input type="file" id="coverImage" name="coverImage" accept="image/*" bind:files={coverImageFile} class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900 dark:file:text-indigo-300 dark:hover:file:bg-indigo-800" />
          {#if actionResult?.fieldErrors?.coverImage}<p class="text-xs text-red-500 mt-1">{actionResult.fieldErrors.coverImage}</p>{/if}
    </div>

    <!-- Gallery Images -->
     <div>
         <label for="gallery" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Gallery Images</label>
          {#if currentGalleryUrls.length > 0}
             <div class="mt-2 mb-2 flex flex-wrap gap-2">
                 {#each currentGalleryUrls as url, index (url)}
                    <div class="relative">
                        <img src={url} alt="Gallery Image {index+1}" class="h-20 w-auto rounded" />
                        <!-- Add checkboxes to remove individual gallery images if needed -->
                    </div>
                 {/each}
                 <label class="w-full inline-flex items-center text-xs mt-1">
                    <input type="checkbox" name="removeExistingGallery" value="true" class="mr-1" /> Remove ALL existing gallery images (uploading new ones replaces them)
                 </label>
             </div>
          {/if}
         <input type="file" id="gallery" name="gallery" accept="image/*,video/*" multiple bind:files={galleryFiles} class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900 dark:file:text-indigo-300 dark:hover:file:bg-indigo-800" />
          {#if actionResult?.fieldErrors?.gallery}<p class="text-xs text-red-500 mt-1">{actionResult.fieldErrors.gallery}</p>{/if}
    </div>

     <!-- Technologies (Comma-separated) -->
    <div>
         <label for="technologies" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Technologies</label>
         <input type="text" id="technologies" name="technologies" bind:value={technologies} placeholder="e.g., SvelteKit, Tailwind, PocketBase" class="mt-1 block w-full input-style" />
        <p class="text-xs text-gray-500 mt-1">Comma-separated list.</p>
    </div>

     <!-- URLs -->
     <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div>
             <label for="projectUrl" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Project URL</label>
             <input type="url" id="projectUrl" name="projectUrl" bind:value={projectUrl} placeholder="https://..." class="mt-1 block w-full input-style" />
         </div>
         <div>
             <label for="repoUrl" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Repository URL</label>
             <input type="url" id="repoUrl" name="repoUrl" bind:value={repoUrl} placeholder="https://github.com/..." class="mt-1 block w-full input-style" />
         </div>
     </div>

     <!-- Order & Featured -->
     <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
         <div>
              <label for="order" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Custom Order</label>
              <input type="number" id="order" name="order" bind:value={order} class="mt-1 block w-full input-style [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
              <p class="text-xs text-gray-500 mt-1">Optional number for manual sorting (lower numbers first).</p>
         </div>
         <div class="pt-6">
            <label class="flex items-center">
                 <input type="checkbox" id="featured" name="featured" bind:checked={featured} class="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-indigo-600 dark:ring-offset-gray-800" />
                 <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">Featured Project?</span>
             </label>
         </div>
     </div>

    <!-- Submit Button -->
    <div class="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
         <a href="/admin/projects" class="px-4 py-2 mr-3 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
             Cancel
         </a>
        <button
            type="submit"
            disabled={isSubmitting}
            class="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
        >
             {#if isSubmitting} <Loader2 class="w-4 h-4 mr-2 animate-spin" /> {:else} <Save class="w-4 h-4 mr-2" /> {/if}
             {isSubmitting ? 'Saving...' : (project?.id ? 'Update Project' : 'Create Project')}
        </button>
    </div>
</form>

<!-- <style>
    .input-style {
        @apply px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white;
    }
</style> -->
<style>
    /* Base input styles */
    .input-style {
      /* px-3 py-2 */
      padding-left: 0.75rem;
      padding-right: 0.75rem;
      padding-top: 0.5rem;
      padding-bottom: 0.5rem;
      
      /* border border-gray-300 */
      border: 1px solid #d1d5db;
      
      /* rounded-md */
      border-radius: 0.375rem;
      
      /* shadow-sm */
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      
      background-color: white;
      color: #111827;
      transition: all 0.15s ease;
    }
  
    /* Focus states */
    .input-style:focus {
      /* focus:outline-none */
      outline: 2px solid transparent;
      outline-offset: 2px;
      
      /* focus:ring-indigo-500 */
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.5);
      
      /* focus:border-indigo-500 */
      border-color: #6366f1;
    }
  
    /* Dark mode styles */
    .dark .input-style {
      /* dark:border-gray-600 */
      border-color: #4b5563;
      
      /* dark:bg-gray-700 */
      background-color: #374151;
      
      /* dark:text-white */
      color: #ffffff;
    }
  </style>