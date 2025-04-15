<script lang="ts">
    import type { ActionData } from './$types';
    import BlogPostForm from '$lib/components/admin/BlogPostForm.svelte';

    export let form: ActionData; // From the server action
</script>

<svelte:head>
    <title>Admin - New Blog Post</title>
</svelte:head>

<h1 class="text-2xl font-semibold mb-6">Create New Blog Post</h1>

<BlogPostForm actionResult={form} />