<script lang="ts">
	import '../app.css'; // Import Tailwind base styles
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
		{ href: '/contact', label: 'Contact' },
		// Add more links as needed (e.g., Contact)
	];
  </script>
  
  <div class="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
	<header class="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-10">
	  <nav class="container mx-auto px-4 py-3 flex justify-between items-center">
		<a href="/" class="text-xl font-bold text-indigo-600 dark:text-indigo-400">{siteTitle}</a>
		<ul class="flex space-x-4">
		  {#each navLinks as link}
			<li>
			  <a
				href={link.href}
				class="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
				aria-current={$page.url.pathname === link.href ? 'page' : undefined}
				class:text-indigo-600={$page.url.pathname === link.href}
				class:dark:text-indigo-400={$page.url.pathname === link.href}
			  >
				{link.label}
			  </a>
			</li>
		  {/each}
		</ul>
	  </nav>
	</header>
  
	<main class="flex-grow container mx-auto px-4 py-8">
		{#key $page.url.pathname} <!-- Key block triggers transition on path change -->
		   <div in:fade={{ duration: 200, delay: 200 }} out:fade={{ duration: 200 }}>
			   <slot /> <!-- Page content goes here -->
		   </div>
		{/key}
	</main>
  
	<footer class="bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 py-6 mt-10">
	  <div class="container mx-auto px-4 text-center">
		<p>© {new Date().getFullYear()} {siteTitle}. All rights reserved.</p>
		{#if Object.keys(socialLinks).length > 0}
		  <div class="flex justify-center space-x-4 mt-2">
			{#each Object.entries(socialLinks) as [key, url]}
			   {#if url}
				 <a href={url} target="_blank" rel="noopener noreferrer" class="hover:text-indigo-600 dark:hover:text-indigo-400 capitalize">
				   {key}
				 </a>
			   {/if}
			{/each}
		  </div>
		{/if}
		{#if data.siteSettings?.contactEmail}
		   <p class="mt-2">Contact: <a href="mailto:{data.siteSettings.contactEmail}" class="hover:text-indigo-600 dark:hover:text-indigo-400">{data.siteSettings.contactEmail}</a></p>
		{/if}
		 {#if data.siteSettings?.resumeUrl}
		   <p class="mt-2"><a href={data.siteSettings.resumeUrl} target="_blank" rel="noopener noreferrer" class="hover:text-indigo-600 dark:hover:text-indigo-400">Download Resume</a></p>
		{/if}
	  </div>
	</footer>
  </div>