<script lang="ts">
    import type { PageData } from './$types';
    import ProjectCard from '$lib/components/ProjectCard.svelte';
    import { goto } from '$app/navigation'; // To update URL programmatically
    import { page } from '$app/stores'; // To get current URL search params
	import { fade } from 'svelte/transition';
 
    export let data: PageData;
 
    $: projects = data.projects || [];
    $: currentSort = data.currentSort;
    $: currentTechFilter = data.currentTechFilter;
    $: availableTechnologies = data.availableTechnologies || [];
 
    function handleFilterChange(event: Event) {
         const target = event.target as HTMLSelectElement;
         const newTech = target.value;
         const searchParams = new URLSearchParams($page.url.search);
         if (newTech) {
             searchParams.set('tech', newTech);
         } else {
             searchParams.delete('tech');
         }
         searchParams.delete('page'); // Reset to page 1 on filter change
         goto(`/projects?${searchParams.toString()}`, { keepFocus: true, noScroll: true });
    }
 
    function handleSortChange(event: Event) {
        const target = event.target as HTMLSelectElement;
        const newSort = target.value;
        const searchParams = new URLSearchParams($page.url.search);
        searchParams.set('sort', newSort);
        searchParams.delete('page'); // Reset to page 1 on sort change
        goto(`/projects?${searchParams.toString()}`, { keepFocus: true, noScroll: true });
    }
 
    // Basic Pagination Logic (Example)
    function changePage(newPage: number) {
        const searchParams = new URLSearchParams($page.url.search);
        searchParams.set('page', newPage.toString());
        goto(`/projects?${searchParams.toString()}`, { keepFocus: true }); // Might want scrolling here
    }
 
 </script>
 
 <svelte:head>
     <title>Projects - {data.siteSettings?.siteTitle || 'Portfolio'}</title>
     <meta name="description" content="Browse through my projects." />
 </svelte:head>
 
 <h1 class="text-3xl font-bold mb-6 border-b pb-2 border-gray-300 dark:border-gray-700">My Projects</h1>
 
 <!-- Filter and Sort Controls -->
 <div class="flex flex-col md:flex-row gap-4 mb-6 items-center">
     {#if availableTechnologies.length > 0}
     <div class="flex-1 w-full md:w-auto">
         <label for="tech-filter" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Filter by Technology:</label>
         <select id="tech-filter" on:change={handleFilterChange} value={currentTechFilter} class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white">
             <option value="">All Technologies</option>
             {#each availableTechnologies as tech (tech)}
                 <option value={tech}>{tech}</option>
             {/each}
         </select>
     </div>
     {/if}
 
     <div class="flex-1 w-full md:w-auto">
         <label for="sort-order" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sort by:</label>
         <select id="sort-order" on:change={handleSortChange} value={currentSort} class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white">
             <option value="-created">Newest First</option>
             <option value="created">Oldest First</option>
             <option value="title">Title (A-Z)</option>
             <option value="-title">Title (Z-A)</option>
              {#if data.projects.some(p => p.order !== null && p.order !== undefined)}
              <option value="order">Custom Order</option> <!-- Only show if 'order' field is used -->
             {/if}
         </select>
     </div>
 </div>
 
 {#if data.error}
     <p class="text-center text-red-500 mt-10">{data.error}</p>
 {:else if projects.length > 0}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each projects as project (project.id)}
            <div in:fade={{ duration: 300, delay: 50 * projects.indexOf(project) }}> <!-- Apply fade-in -->
            <ProjectCard {project} />
            </div>
        {/each}
    </div>
 
     <!-- Basic Pagination Controls -->
     {#if data.totalPages > 1}
     <div class="flex justify-center items-center space-x-2 mt-8">
          <button
             on:click={() => changePage(data.currentPage - 1)}
             disabled={data.currentPage <= 1}
             class="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
              Prev
          </button>
          <span>Page {data.currentPage} of {data.totalPages}</span>
           <button
             on:click={() => changePage(data.currentPage + 1)}
             disabled={data.currentPage >= data.totalPages}
             class="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
             Next 
          </button>
     </div>
     {/if}
 {:else}
     <p class="text-center text-gray-500 dark:text-gray-400 mt-10">
         {#if currentTechFilter}
             No projects found matching "{currentTechFilter}".
         {:else}
             No projects found. Add some via the PocketBase admin!
         {/if}
         <a href="/projects" class="ml-2 text-indigo-600 dark:text-indigo-400 hover:underline">Clear Filters</a>
     </p>
 {/if}