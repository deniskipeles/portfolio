<script lang="ts">
    import type { PageData } from './$types';
    import { page } from '$app/stores'; // For canonical URL etc.

    export let data: PageData;
    $: post = data.post;

     $: displayDate = post?.publishedDate ? new Date(post.publishedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
</script>

<svelte:head>
    <title>{post?.title || 'Blog Post'} - {data.siteSettings?.siteTitle}</title>
    {#if post?.excerpt}
       <meta name="description" content={post.excerpt} />
       <!-- Add OG/Twitter/JSON-LD meta tags specific to the blog post -->
       <meta property="og:type" content="article" />
       <meta property="article:published_time" content={post?.publishedDate} />
       {#if post?.tags}
        <meta property="article:tag" content={post.tags} />
       {/if}
    {/if}
</svelte:head>

{#if post}
	<article class="bg-secondary p-6 md:p-8 rounded-lg shadow-md max-w-3xl mx-auto">
		<h1 class="text-3xl md:text-4xl font-bold mb-3 text-accent">{post.title}</h1>
		<p class="text-md text-text/80 mb-6">{displayDate}</p>

		{#if post.coverImageUrl}
			<img
				src={post.coverImageUrl}
				alt="Cover for {post.title}"
				class="w-full h-auto object-contain rounded-md mb-8 shadow-sm"
			/>
		{/if}

		{#if post.tags}
			<div class="flex flex-wrap gap-2 mb-6">
				{#each post.tags.split(',').map((t) => t.trim()) as tag}
					{#if tag}
						<span class="text-sm bg-primary text-accent px-3 py-1 rounded-full">
							{tag}
						</span>
					{/if}
				{/each}
			</div>
		{/if}

		{#if post.content}
			<div class="prose dark:prose-invert max-w-none prose-lg text-text">
				{@html post.content}
			</div>
		{:else}
			<p class="text-text">Post content is missing.</p>
		{/if}
	</article>
{:else}
	<!-- Should be handled by error boundary from load function -->
	<p class="text-center text-red-500 mt-10">Could not load blog post.</p>
{/if}

<div class="mt-8 text-center">
	<a href="/blog" class="text-accent hover:underline">← Back to Blog List</a>
</div>