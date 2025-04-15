<script lang="ts">
    import type { ActionData } from './$types';
    import ProjectForm from '$lib/components/admin/ProjectForm.svelte';

    export let form: ActionData; // From the server action
</script>

<svelte:head>
    <title>Admin - New Project</title>
</svelte:head>

<h1 class="text-2xl font-semibold mb-6">Create New Project</h1>

<ProjectForm actionResult={form} />