/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ["./src/**/*.{js,jsx,ts,tsx}"],
	plugins: [],
	theme: {
		extend: {
			colors: {
				brand: {
					50: "#eef7f2",
					100: "#d5edde",
					200: "#ade0c1",
					300: "#7acda0",
					400: "#4ab87f",
					500: "#2d9d64",
					600: "#1f7f4f",
					700: "#1a6641",
					800: "#175236",
					900: "#14432d",
				},
			},
			boxShadow: {
				glass: "0 8px 32px rgba(0, 0, 0, 0.08)",
				"card-hover": "0 12px 40px rgba(0, 0, 0, 0.12)",
				soft: "0 2px 15px rgba(0, 0, 0, 0.05)",
			},
			animation: {
				"fade-in": "fadeIn 0.5s ease-out",
				"slide-up": "slideUp 0.4s ease-out",
				float: "float 3s ease-in-out infinite",
			},
			keyframes: {
				fadeIn: {
					"0%": { opacity: "0" },
					"100%": { opacity: "1" },
				},
				slideUp: {
					"0%": { opacity: "0", transform: "translateY(10px)" },
					"100%": { opacity: "1", transform: "translateY(0)" },
				},
				float: {
					"0%, 100%": { transform: "translateY(0px)" },
					"50%": { transform: "translateY(-8px)" },
				},
			},
		},
		screens: {
			sm: "640px",
			md: "768px",
			lg: "1024px",
			landscape: { raw: "(orientation: landscape)" },
			portrait: { raw: "(orientation: portrait)" },
		},
	},
};
