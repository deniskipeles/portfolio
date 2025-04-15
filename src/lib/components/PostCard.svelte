<script lang="ts">
    import type { BaseAuthStore } from 'pocketbase'; // For type hints if needed
    import { getFileUrl } from '$lib/pocketbase'; // Assuming you defined BlogPost type
 
    // Define BlogPost type in pocketbase.ts or here
    export interface BlogPost {
       id: string;
       collectionId: string; // Add other fields as needed
       title: string;
       slug: string;
       excerpt: string;
       coverImage?: string;
       publishedDate: string; // ISO string
       tags?: string;
       // Add computed fields if needed in load function
       coverImageUrl?: string;
       formattedDate?: string;
    }
 
     export let post: Partial<BlogPost>; // Use partial as not all fields might be loaded in list view
 
     // Format date for display
     $: displayDate = post.publishedDate ? new Date(post.publishedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
 </script>
 
 <a href="/blog/{post.slug}" class="block bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {#if post.coverImageUrl}
         <img src={post.coverImageUrl} alt="Cover image for {post.title}" class="w-full h-48 object-cover" loading="lazy" width="400" height="240"/>
      {:else}
           <div class="w-full h-48 bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900 dark:to-blue-900"></div> <!-- Placeholder gradient -->
      {/if}
     <div class="p-4">
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">{displayDate}</p>
         <h3 class="text-lg font-semibold mb-1 text-indigo-700 dark:text-indigo-300">{post.title || 'Untitled Post'}</h3>
         <p class="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-3">{post.excerpt || ''}</p> <!-- line-clamp requires @tailwindcss/line-clamp plugin -->
          {#if post.tags}
             <div class="flex flex-wrap gap-1 mt-2">
                 {#each post.tags.split(',').map(t => t.trim()) as tag}
                     {#if tag}
                         <span class="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded">
                             {tag}
                         </span>
                     {/if}
                 {/each}
             </div>
         {/if}
     </div>
 </a>