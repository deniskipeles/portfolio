<script lang="ts">
    import type { PageData } from './$types'; // Even if no specific load func here, we get layout data via PageData
    import { getFileUrl } from '$lib/pocketbase';
  
    export let data: PageData; // Contains siteSettings from layout load
  
    $: settings = data.siteSettings;
    $: profilePicUrl = settings?.profilePicture
       ? getFileUrl(settings, settings.profilePicture, 'thumb=300x300') // Adjust size
       : '/placeholder-profile.png'; // Provide a fallback image in /static
  </script>
  
  <svelte:head>
      <title>{settings?.siteTitle || 'Home'}</title>
      <meta name="description" content={settings?.tagline || 'Portfolio homepage'} />
  </svelte:head>
  
<section
	class="flex flex-col md:flex-row items-center gap-8 bg-secondary p-6 rounded-lg shadow-md"
>
	{#if settings?.profilePicture}
		<img
			src={profilePicUrl}
			alt="Profile Picture"
			class="w-32 h-32 md:w-48 md:h-48 rounded-full object-cover border-4 border-accent"
			width="192"
			height="192"
		/>
	{/if}
	<div class="text-center md:text-left">
		<h1 class="text-3xl md:text-4xl font-bold text-accent">
			{settings?.siteTitle || 'Welcome'}
		</h1>
		<p class="text-lg text-text mt-2">{settings?.tagline || 'My personal portfolio'}</p>
	</div>
</section>

<section class="mt-10 bg-secondary p-6 rounded-lg shadow-md">
	<h2 class="text-2xl font-semibold mb-4 border-b pb-2 border-primary">
		About Me
	</h2>
	{#if settings?.aboutMe}
		<div class="prose dark:prose-invert max-w-none text-text">
			{@html settings.aboutMe}
			<!-- Render markdown/HTML from PocketBase editor -->
		</div>
	{:else}
		<p>About information coming soon.</p>
	{/if}
</section>
  
  <!-- Optional: Featured Projects Section -->
  <!-- You would need to fetch featured projects separately or pass them from layout if needed globally -->