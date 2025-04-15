<script lang="ts">
	import { page } from '$app/stores';
	import { getFileUrl,pb } from '$lib/pocketbase';
    import type { PageData } from './$types';
    import { ExternalLink } from 'lucide-svelte'; // Example using an icon library

    export let data: PageData;

    $: project = data.project;
</script>

<svelte:head>
    <title>{project?.title || 'Project Detail'} - {data.siteSettings?.siteTitle}</title>
    {#if project?.excerpt}
       <meta name="description" content={project.excerpt} />
       <meta property="og:description" content={project.excerpt} />
       <meta name="twitter:description" content={project.excerpt} />
    {/if}
    {#if project?.title}
       <meta property="og:title" content={`${project.title} - ${data.siteSettings?.siteTitle}`} />
       <meta name="twitter:title" content={`${project.title} - ${data.siteSettings?.siteTitle}`} />
    {/if}
     {#if project?.coverImageUrl}
        <!-- Use a non-thumb version for OG image if possible, or a larger thumb -->
        {@const ogImageUrl = project.coverImage ? getFileUrl(project, project.coverImage, 'thumb=1200x630') : ''}
        {#if ogImageUrl}
          <meta property="og:image" content={new URL(ogImageUrl, pb.baseUrl).toString()} />
          <meta name="twitter:image" content={new URL(ogImageUrl, pb.baseUrl).toString()} />
          <meta name="twitter:card" content="summary_large_image" />
        {/if}
    {/if}
     <meta property="og:url" content={$page.url.href} />
     <meta property="og:type" content="article" /> <!-- Use 'website' for homepage/list pages -->

     <!-- Optional: Twitter specific tags -->
     <!-- <meta name="twitter:site" content="@yourTwitterHandle"> -->
     <!-- <meta name="twitter:creator" content="@yourTwitterHandle"> -->

{#if project}
   <script type="application/ld+json">
     {JSON.stringify({
       "@context": "https://schema.org",
       "@type": "TechArticle", // Or SoftwareApplication, CreativeWork, etc. Choose appropriate type.
       "headline": project.title,
       "description": project.excerpt,
       "image": project.coverImageUrl ? new URL(getFileUrl(project, project.coverImage), pb.baseUrl).toString() : undefined,
       "author": { // Assuming you add author info to siteSettings or project
         "@type": "Person",
         "name": data.siteSettings?.siteTitle.split('-')[0].trim() || "Your Name"
       },
       "datePublished": project.created, // Use created or a dedicated publishedDate field
       "dateModified": project.updated,
        "url": $page.url.href,
        // Add other relevant fields: keywords (from technologies), applicationCategory, etc.
     })}
   </script>
  {/if}

</svelte:head>

{#if project}
    <article class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h1 class="text-3xl font-bold mb-4 text-indigo-700 dark:text-indigo-300">{project.title}</h1>

        {#if project.coverImageUrl}
            <img src={project.coverImageUrl} alt="Cover for {project.title}" class="w-full max-w-3xl mx-auto h-auto object-contain rounded-md mb-6" />
        {/if}

        {#if project.projectUrl || project.repoUrl}
            <div class="flex flex-wrap gap-4 mb-6">
                {#if project.projectUrl}
                    <a href={project.projectUrl} target="_blank" rel="noopener noreferrer" class="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors">
                        View Live Project <ExternalLink class="w-4 h-4 ml-2"/>
                    </a>
                {/if}
                {#if project.repoUrl}
                     <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" class="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md text-sm font-medium transition-colors">
                        View Code <ExternalLink class="w-4 h-4 ml-2"/> <!-- Replace with GitHub/GitLab icon -->
                    </a>
                {/if}
            </div>
        {/if}

         {#if project.technologies}
            <div class="mb-6">
                <h3 class="text-lg font-semibold mb-2">Technologies Used:</h3>
                 <div class="flex flex-wrap gap-2">
                    {#each project.technologies.split(',').map(t => t.trim()) as tech}
                        {#if tech}
                            <span class="text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full">
                                {tech}
                            </span>
                        {/if}
                    {/each}
                </div>
            </div>
         {/if}

        <h2 class="text-2xl font-semibold mb-3 mt-6 border-t pt-4 border-gray-300 dark:border-gray-700">Description</h2>
         {#if project.description}
            <div class="prose dark:prose-invert max-w-none">
                 {@html project.description}
            </div>
         {:else}
            <p>No detailed description available.</p>
         {/if}

         {#if project.galleryUrls && project.galleryUrls.length > 0}
            <h2 class="text-2xl font-semibold mb-4 mt-8 border-t pt-4 border-gray-300 dark:border-gray-700">Gallery</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {#each project.galleryUrls as imageUrl (imageUrl)}
                    <a href={imageUrl} target="_blank" rel="noopener noreferrer" class="block">
                        <img src={imageUrl} alt="Project gallery image" class="w-full h-auto object-cover rounded-md shadow-sm hover:shadow-md transition-shadow" loading="lazy" />
                    </a>
                    <!-- <a href={imageUrl} target="_blank" rel="noopener noreferrer" class="block">
                        <img src={imageUrl} alt="Project gallery image" class="w-full h-auto object-cover rounded-md shadow-sm hover:shadow-md transition-shadow" loading="lazy"/>
                    </a> -->
                {/each}
            </div>
         {/if}

    </article>
{:else}
     <!-- This part might not be reached if error handling in load function works correctly -->
    <p class="text-center text-red-500 mt-10">Project data could not be loaded.</p>
{/if}

<div class="mt-8">
    <a href="/projects" class="text-indigo-600 dark:text-indigo-400 hover:underline">← Back to Projects</a>
</div>