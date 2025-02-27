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
		themes: ["light"], // false: only light + dark | true: all themes | array: specific themes like this ["light", "dark", "cupcake"]
		// darkTheme: "dark", // name of one of the included themes for dark mode
		base: false, // applies background color and foreground color for root element by default
		styled: false, // include daisyUI colors and design decisions for all components
		utils: true, // adds responsive and modifier utility classes
		prefix: "", // prefix for daisyUI classnames (components, modifiers and responsive class names. Not colors)
		logs: true, // Shows info about daisyUI version and used config in the console when building your CSS
		themeRoot: ":root", // The element that receives theme color CSS variables
	},
}
