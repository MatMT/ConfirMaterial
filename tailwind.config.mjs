/** @type {import('tailwindcss').Config} */
export default {
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
		extend: {},
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
					"accent": "#fc6b03", // bronze-spice-500
					"accent-content": "#ffffff",
					"neutral": "#0e0f25", // ocean-twilight-900
					"base-100": "#ffffff", // Fondo blanco
					"base-200": "#ecedf8", // ocean-twilight-50
					"base-300": "#dadbf1", // ocean-twilight-100
					"success": "#22c55e",
					"warning": "#f59e0b",
					"error": "#ef4444",
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
