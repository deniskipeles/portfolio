<script lang="ts">
    import type { PageData, ActionData } from './$types';
    import ProjectForm from '$lib/components/admin/ProjectForm.svelte';

    export let data: PageData;
    export let form: ActionData; // Action data takes precedence if form submission failed

    // Use form data if available (submission failed), otherwise use loaded project data
     $: projectDataForForm = form?.data ?? data.project;
     $: actionResult = form; // Pass the whole form result to the component

</script>

<svelte:head>
    <title>Admin - Edit Project: {data.project?.title}</title>
</svelte:head>

<h1 class="text-2xl font-semibold mb-6">Edit Project: <span class="font-normal">{data.project?.title}</span></h1>

{#if projectDataForForm}
     <ProjectForm project={projectDataForForm} actionResult={actionResult} />
{:else}
     <p class="text-red-500">Could not load project data.</p>
{/if}