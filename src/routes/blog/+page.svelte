<script lang="ts">
    import type { PageData } from './$types';
    import PostCard from '$lib/components/PostCard.svelte'; // Import the new card
    // Import pagination logic/components if needed
 
    export let data: PageData;
 
    $: posts = data.posts || [];
 </script>
 
 <svelte:head>
     <title>Blog - {data.siteSettings?.siteTitle || 'Portfolio'}</title>
     <meta name="description" content="Read articles about development, design, and technology." />
      <!-- Add relevant OG/Twitter tags -->
 </svelte:head>
 
 <h1 class="text-3xl font-bold mb-6">Blog</h1>
 
 {#if data.error}
      <p class="text-center text-red-500 mt-10">{data.error}</p>
 {:else if posts.length > 0}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {#each posts as post (post.id)}
             <PostCard {post} />
         {/each}
     </div>
      <!-- Add Pagination Controls here if needed -->
 {:else}
      <p class="text-center text-gray-500 dark:text-gray-400 mt-10">No blog posts published yet.</p>
 {/if}