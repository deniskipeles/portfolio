import { browser } from '$app/environment';
import { writable } from 'svelte/store';

type Theme = 'light' | 'dark';

const getInitialTheme = (): Theme => {
	if (browser) {
		const storedTheme = localStorage.getItem('theme');
		if (storedTheme) {
			return storedTheme as Theme;
		}
		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}
	return 'light';
};

export const theme = writable<Theme>(getInitialTheme());

if (browser) {
	theme.subscribe((value) => {
		localStorage.setItem('theme', value);
		document.documentElement.classList.remove('light', 'dark');
		document.documentElement.classList.add(value);
	});
}