<script lang="ts">
    import type { PageData, ActionData } from './$types';
    import { enhance } from '$app/forms';
    import { Loader2, Save } from 'lucide-svelte';

    export let data: PageData; // Loaded settings
    export let form: ActionData; // Action result on error/success

    // Initialize form state from action result or loaded data
    $: settingsData = form?.data ?? data.settings;

    let siteTitle = settingsData?.siteTitle ?? '';
    let tagline = settingsData?.tagline ?? '';
    let aboutMe = settingsData?.aboutMe ?? ''; // Use textarea, replace with RTE later
    let contactEmail = settingsData?.contactEmail ?? '';
    // Social links - use individual fields for simpler form handling
    let social_github = settingsData?.socialLinks?.github ?? settingsData?.social_github ?? '';
    let social_linkedin = settingsData?.socialLinks?.linkedin ?? settingsData?.social_linkedin ?? '';
    let social_artstation = settingsData?.socialLinks?.artstation ?? settingsData?.social_artstation ?? ''; // Add others

    let currentProfilePictureUrl = settingsData?.currentProfilePictureUrl ?? null;
    let currentResumeUrl = settingsData?.currentResumeUrl ?? null;

    let profilePictureFile: FileList | null = null;
    let resumeFile: FileList | null = null;

    let isSubmitting = false;

     // Update state if form action returns data (e.g., validation error)
     $: if (form?.data) {
         siteTitle = form.data.siteTitle ?? siteTitle;
         tagline = form.data.tagline ?? tagline;
         aboutMe = form.data.aboutMe ?? aboutMe;
         contactEmail = form.data.contactEmail ?? contactEmail;
         social_github = form.data.social_github ?? social_github;
         social_linkedin = form.data.social_linkedin ?? social_linkedin;
         social_artstation = form.data.social_artstation ?? social_artstation;
         currentProfilePictureUrl = form.data.currentProfilePictureUrl ?? currentProfilePictureUrl;
         currentResumeUrl = form.data.currentResumeUrl ?? currentResumeUrl;
     }

    // Show success message (if not using redirect)
    // $: if (form?.success) { alert('Settings saved!'); form = undefined; }

</script>

<svelte:head>
    <title>Admin - Site Settings</title>
</svelte:head>

<h1 class="text-2xl font-semibold mb-6">Site Settings</h1>

{#if !data.settings?.id && !form?.error}
    <div class="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200 rounded">
        Warning: Site settings record not found. Please create the initial record via the PocketBase Admin UI first. This form will likely fail until the record exists.
    </div>
{/if}

<!-- Feedback Messages -->
 {#if form?.error && !form?.success}
     <div class="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 rounded">
         Error: {form.error}
         {#if form.fieldErrors}
             <ul class="list-disc list-inside mt-1 text-sm">
                 {#each Object.entries(form.fieldErrors) as [field, error]}
                     <li><strong>{field}:</strong> {error}</li>
                 {/each}
             </ul>
         {/if}
     </div>
{/if}

<!-- Settings Form -->
 <form
    method="POST"
    enctype="multipart/form-data"
    action="?/save"
    use:enhance={() => {
        isSubmitting = true;
        return async ({ result, update }) => {
            // Since we redirect on success, update is mainly for error state
            await update({ reset: false });
            isSubmitting = false;
             // Optional: Clear file inputs on success if *not* redirecting
             // if (result.type === 'success') { profilePictureFile = null; resumeFile = null; /* Reset input value */ }
        };
    }}
    class="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
>
    <!-- Include hidden ID if loaded -->
    {#if data.settings?.id}
         <input type="hidden" name="id" value={data.settings.id} />
    {/if}

    <!-- Site Title -->
    <div>
        <label for="siteTitle" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Site Title <span class="text-red-500">*</span></label>
        <input type="text" id="siteTitle" name="siteTitle" bind:value={siteTitle} required class="mt-1 block w-full input-style" />
        {#if form?.fieldErrors?.siteTitle}<p class="text-xs text-red-500 mt-1">{form.fieldErrors.siteTitle}</p>{/if}
    </div>

    <!-- Tagline -->
    <div>
        <label for="tagline" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Tagline</label>
        <input type="text" id="tagline" name="tagline" bind:value={tagline} class="mt-1 block w-full input-style" />
    </div>

    <!-- About Me -->
     <div>
         <label for="aboutMe" class="block text-sm font-medium text-gray-700 dark:text-gray-300">About Me</label>
         <textarea id="aboutMe" name="aboutMe" bind:value={aboutMe} rows="8" class="mt-1 block w-full input-style"></textarea>
         <!-- Add Rich Text Editor here later -->
     </div>

    <!-- Contact Email -->
     <div>
        <label for="contactEmail" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact Email <span class="text-red-500">*</span></label>
        <input type="email" id="contactEmail" name="contactEmail" bind:value={contactEmail} required class="mt-1 block w-full input-style" />
         {#if form?.fieldErrors?.contactEmail}<p class="text-xs text-red-500 mt-1">{form.fieldErrors.contactEmail}</p>{/if}
     </div>

    <!-- Profile Picture -->
    <div>
         <label for="profilePicture" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Profile Picture</label>
         {#if currentProfilePictureUrl}
             <div class="mt-2 mb-2">
                <img src={currentProfilePictureUrl} alt="Current Profile Pic" class="h-20 w-20 rounded-full object-cover" />
                <label class="inline-flex items-center text-xs mt-1">
                   <input type="checkbox" name="removeProfilePicture" value="true" class="mr-1" /> Remove current image
                </label>
             </div>
         {/if}
         <input type="file" id="profilePicture" name="profilePicture" accept="image/*" bind:files={profilePictureFile} class="mt-1 block w-full file-input-style" />
         {#if form?.fieldErrors?.profilePicture}<p class="text-xs text-red-500 mt-1">{form.fieldErrors.profilePicture}</p>{/if}
     </div>

    <!-- Resume -->
    <div>
         <label for="resume" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Resume (PDF)</label>
         {#if currentResumeUrl}
             <div class="mt-2 mb-2">
                 <a href={currentResumeUrl} target="_blank" rel="noopener noreferrer" class="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">View Current Resume</a>
                 <label class="inline-flex items-center text-xs ml-4">
                    <input type="checkbox" name="removeResume" value="true" class="mr-1" /> Remove current resume
                 </label>
             </div>
         {/if}
         <input type="file" id="resume" name="resume" accept=".pdf,application/pdf" bind:files={resumeFile} class="mt-1 block w-full file-input-style" />
          {#if form?.fieldErrors?.resume}<p class="text-xs text-red-500 mt-1">{form.fieldErrors.resume}</p>{/if}
     </div>

    <!-- Social Links -->
    <fieldset class="border-t border-gray-200 dark:border-gray-700 pt-4">
         <legend class="text-base font-medium text-gray-900 dark:text-white">Social Links</legend>
         <div class="mt-4 space-y-4">
             <div>
                 <label for="social_github" class="block text-sm font-medium text-gray-700 dark:text-gray-300">GitHub URL</label>
                 <input type="url" id="social_github" name="social_github" bind:value={social_github} placeholder="https://github.com/..." class="mt-1 block w-full input-style" />
             </div>
              <div>
                 <label for="social_linkedin" class="block text-sm font-medium text-gray-700 dark:text-gray-300">LinkedIn URL</label>
                 <input type="url" id="social_linkedin" name="social_linkedin" bind:value={social_linkedin} placeholder="https://linkedin.com/in/..." class="mt-1 block w-full input-style" />
             </div>
             <div>
                 <label for="social_artstation" class="block text-sm font-medium text-gray-700 dark:text-gray-300">ArtStation URL</label>
                 <input type="url" id="social_artstation" name="social_artstation" bind:value={social_artstation} placeholder="https://artstation.com/..." class="mt-1 block w-full input-style" />
             </div>
              <!-- Add more social fields as needed -->
         </div>
    </fieldset>

    <!-- Submit Button -->
    <div class="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
            type="submit"
            disabled={isSubmitting || !data.settings?.id}
            class="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
        >
             {#if isSubmitting} <Loader2 class="w-4 h-4 mr-2 animate-spin" /> {:else} <Save class="w-4 h-4 mr-2" /> {/if}
             {isSubmitting ? 'Saving...' : 'Save Settings'}
        </button>
    </div>
</form>

<!-- <style>
    .input-style { @apply px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white; }
    .file-input-style { @apply text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900 dark:file:text-indigo-300 dark:hover:file:bg-indigo-800; }
</style> -->
<style>
    .input-style {
        padding-left: 0.75rem;
        padding-right: 0.75rem;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
        border: 1px solid rgb(209 213 219);
        border-radius: 0.375rem;
        box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
        outline: 2px solid transparent;
        outline-offset: 2px;
    }
    .input-style:focus {
        outline-color: #6366f1;
        border-color: #6366f1;
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.5);
    }
    .dark .input-style {
        border-color: rgb(75 85 99);
        background-color: rgb(55 65 81);
        color: white;
    }

    .file-input-style {
        font-size: 0.875rem;
        line-height: 1.25rem;
        color: rgb(107 114 128);
    }
    .file-input-style::file-selector-button {
        margin-right: 1rem;
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
        padding-left: 1rem;
        padding-right: 1rem;
        border-radius: 9999px;
        border-width: 0;
        font-size: 0.875rem;
        line-height: 1.25rem;
        font-weight: 600;
        background-color: rgb(238 242 255);
        color: rgb(67 56 202);
    }
    .file-input-style:hover::file-selector-button {
        background-color: rgb(224 231 255);
    }
    .dark .file-input-style {
        color: rgb(156 163 175);
    }
    .dark .file-input-style::file-selector-button {
        background-color: rgb(49 46 129);
        color: rgb(165 180 252);
    }
    .dark .file-input-style:hover::file-selector-button {
        background-color: rgb(55 48 163);
    }
</style>