/** @type {import('tailwindcss').Config} */
export default {
	darkMode: 'class',
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	safelist: [
		"bg-gradient-to-r",
		"from-green-400",
		"to-blue-500",
		"from-cyan-500",
		"to-blue-500",
		"from-purple-500",
		"to-pink-500",
		"from-yellow-400",
		"to-orange-500",
	],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Nunito', 'ui-sans-serif', 'system-ui', 'sans-serif'],
			},
		},
	},
	plugins: [
		require('tailwindcss-animated'),
		require('daisyui'),
	],
	daisyui: {
		themes: [
			{
				confirtheme: {
					"primary": "#454dba", // ocean-twilight-500
					"primary-content": "#ffffff",
					"secondary": "#b14e89", // berry-blush-500
					"secondary-content": "#ffffff",
					"accent": "#974002", // bronze-spice-700: contraste AA con texto blanco
					"accent-content": "#ffffff",
					"neutral": "#0e0f25", // ocean-twilight-900
					"neutral-content": "#ffffff",
					"base-100": "#ffffff", // Fondo blanco
					"base-200": "#ecedf8", // ocean-twilight-50
					"base-300": "#dadbf1", // ocean-twilight-100
					"base-content": "#0e0f25",
					"success": "#15803d",
					"success-content": "#ffffff",
					"warning": "#a16207",
					"warning-content": "#ffffff",
					"error": "#b91c1c",
					"error-content": "#ffffff",
					"--rounded-btn": "0.75rem",
				},
			},
			{
				"confirtheme-dark": {
					"primary": "#8f94d6", // ocean-twilight-300
					"primary-content": "#0e0f25",
					"secondary": "#d095b8", // berry-blush-300
					"secondary-content": "#190b13",
					"accent": "#fd8835", // bronze-spice-400
					"accent-content": "#321501",
					"neutral": "#ecedf8",
					"neutral-content": "#0a0b1a",
					"base-100": "#0a0b1a",
					"base-200": "#0e0f25",
					"base-300": "#1c1f4a",
					"base-content": "#ecedf8",
					"success": "#4ade80",
					"success-content": "#0a0b1a",
					"warning": "#fbbf24",
					"warning-content": "#0a0b1a",
					"error": "#f87171",
					"error-content": "#0a0b1a",
					"--rounded-btn": "0.75rem",
				},
			},
			"light", // Fallback
		],
		// darkTheme: "dark", // name of one of the included themes for dark mode
		base: true, // applies background color and foreground color for root element by default
		styled: true, // include daisyUI colors and design decisions for all components
		utils: true, // adds responsive and modifier utility classes
		prefix: "", // prefix for daisyUI classnames (components, modifiers and responsive class names. Not colors)
		logs: true, // Shows info about daisyUI version and used config in the console when building your CSS
		themeRoot: ":root", // The element that receives theme color CSS variables
	},
}
