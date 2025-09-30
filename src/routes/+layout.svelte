<script lang="ts">
	import '../app.css'; // Import Tailwind base styles
	import ThemeToggle from '$lib/components/ThemeToggle.svelte';
	import type { LayoutData } from './$types';
	import { page } from '$app/stores'; // To get current path for active links
	import { fade } from 'svelte/transition';

	export let data: LayoutData;

	$: siteTitle = data.siteSettings?.siteTitle || 'Portfolio';
	$: socialLinks = data.siteSettings?.socialLinks || {};
	$: navLinks = [
		{ href: '/', label: 'Home' },
		{ href: '/projects', label: 'Projects' },
		{ href: '/blog', label: 'Blog' },
		{ href: '/contact', label: 'Contact' }
		// Add more links as needed (e.g., Contact)
	];
</script>

<div class="flex flex-col min-h-screen bg-primary text-text">
	<header class="bg-secondary shadow-md sticky top-0 z-10">
		<nav class="container mx-auto px-4 py-3 flex justify-between items-center">
			<a href="/" class="text-xl font-bold text-accent">{siteTitle}</a>
			<div class="flex items-center space-x-4">
				<ul class="hidden md:flex space-x-4">
					{#each navLinks as link}
						<li>
							<a
								href={link.href}
								class="hover:text-accent transition-colors"
								aria-current={$page.url.pathname === link.href ? 'page' : undefined}
								class:text-accent={$page.url.pathname === link.href}
							>
								{link.label}
							</a>
						</li>
					{/each}
				</ul>
				<ThemeToggle />
			</div>
		</nav>
	</header>
  
	<main class="flex-grow container mx-auto px-4 py-8">
		{#key $page.url.pathname} <!-- Key block triggers transition on path change -->
		   <div in:fade={{ duration: 200, delay: 200 }} out:fade={{ duration: 200 }}>
			   <slot /> <!-- Page content goes here -->
		   </div>
		{/key}
	</main>
  
	<footer class="bg-secondary py-6 mt-10">
		<div class="container mx-auto px-4 text-center text-text">
			<p>© {new Date().getFullYear()} {siteTitle}. All rights reserved.</p>
			{#if Object.keys(socialLinks).length > 0}
				<div class="flex justify-center space-x-4 mt-2">
					{#each Object.entries(socialLinks) as [key, url]}
						{#if url}
							<a
								href={url}
								target="_blank"
								rel="noopener noreferrer"
								class="hover:text-accent capitalize"
							>
								{key}
							</a>
						{/if}
					{/each}
				</div>
			{/if}
			{#if data.siteSettings?.contactEmail}
				<p class="mt-2">
					Contact: <a href="mailto:{data.siteSettings.contactEmail}" class="hover:text-accent"
						>{data.siteSettings.contactEmail}</a
					>
				</p>
			{/if}
			{#if data.siteSettings?.resumeUrl}
				<p class="mt-2">
					<a
						href={data.siteSettings.resumeUrl}
						target="_blank"
						rel="noopener noreferrer"
						class="hover:text-accent">Download Resume</a
					>
				</p>
			{/if}
		</div>
	</footer>
  </div>