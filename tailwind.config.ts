import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	darkMode: 'class',
	theme: {
		colors: {
			gray: colors.gray,
			blue: colors.blue,
			white: colors.white,
			black: colors.black,
			primary: {
				DEFAULT: colors.gray[100],
				dark: colors.gray[900]
			},
			secondary: {
				DEFAULT: colors.gray[200],
				dark: colors.gray[800]
			},
			accent: {
				DEFAULT: colors.blue[500],
				dark: colors.blue[400]
			},
			text: {
				DEFAULT: colors.gray[800],
				dark: colors.gray[200]
			}
		},
		extend: {}
	},
	plugins: []
} satisfies Config;