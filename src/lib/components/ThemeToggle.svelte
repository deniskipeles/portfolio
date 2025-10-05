<script lang="ts">
	import { theme } from '$lib/theme';
	import { Sun, Moon } from 'lucide-svelte';

	function toggleTheme() {
		theme.update((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light'));
	}
</script>

<button
	on:click={toggleTheme}
	class="p-2 rounded-md hover:bg-secondary dark:hover:bg-secondary-dark"
	aria-label="Toggle theme"
>
	{#if $theme === 'light'}
		<Moon class="h-6 w-6 text-text" />
	{:else}
		<Sun class="h-6 w-6 text-text-dark" />
	{/if}
</button>