<script lang="ts">
    import type { Project } from '$lib/pocketbase';

    // Define the expected structure more accurately for the component
    export let project: Partial<Project> & { coverImageUrl?: string };
</script>

<a
	href="/projects/{project.slug}"
	class="block bg-secondary rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
>
	{#if project.coverImageUrl}
		<img
			src={project.coverImageUrl}
			alt="Cover image for {project.title}"
			class="w-full h-48 object-cover"
			loading="lazy"
			width="400"
			height="300"
		/>
	{:else}
		<div class="w-full h-48 bg-primary flex items-center justify-center text-text/50">
			No Image
		</div>
	{/if}
	<div class="p-4 text-text">
		<h3 class="text-lg font-semibold mb-1 text-accent">{project.title || 'Untitled Project'}</h3>
		<p class="text-sm text-text/80 mb-2">{project.excerpt || 'No description available.'}</p>
		{#if project.technologies}
			<div class="flex flex-wrap gap-1 mt-2">
				{#each project.technologies.split(',').map((t) => t.trim()) as tech}
					{#if tech}
						<span class="text-xs bg-primary text-text px-2 py-0.5 rounded">
							{tech}
						</span>
					{/if}
				{/each}
			</div>
		{/if}
	</div>
</a>