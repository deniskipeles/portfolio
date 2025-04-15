<script lang="ts">
    import type { PageData, ActionData } from './$types';
    import BlogPostForm from '$lib/components/admin/BlogPostForm.svelte';

    export let data: PageData;
    export let form: ActionData; // Action data takes precedence if form submission failed

     // Use form data if available (submission failed), otherwise use loaded post data
     $: postDataForForm = form?.data ?? data.post;
     $: actionResult = form; // Pass the whole form result to the component

</script>

<svelte:head>
    <title>Admin - Edit Blog Post: {data.post?.title}</title>
</svelte:head>

<h1 class="text-2xl font-semibold mb-6">Edit Blog Post: <span class="font-normal">{data.post?.title}</span></h1>

{#if postDataForForm}
     <BlogPostForm post={postDataForForm} actionResult={actionResult} />
{:else}
     <p class="text-red-500">Could not load blog post data.</p>
{/if}