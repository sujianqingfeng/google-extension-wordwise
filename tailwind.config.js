import defaultTheme from "tailwindcss/defaultTheme"

/** @type {import('tailwindcss').Config} */
export default {
	content: [
		"./src/entries/**/*.{js,ts,jsx,tsx}",
		"./src/components/**/*.{js,ts,jsx,tsx}",
	],
	theme: {
		extend: {
			fontFamily: {
				"sassy-frass": ['"Sassy Frass"', ...defaultTheme.fontFamily.sans],
				sans: ['"Inter"', '"SF Pro Display"', ...defaultTheme.fontFamily.sans],
			},
			colors: {
				"primary-color": "#de7897",
				primary: {
					50: "#fdf2f8",
					100: "#fce7f3",
					200: "#fbcfe8",
					300: "#f9a8d4",
					400: "#f472b6",
					500: "#de7897",
					600: "#db2777",
					700: "#be185d",
					800: "#9d174d",
					900: "#831843",
				},
				gray: {
					50: "#f8fafc",
					100: "#f1f5f9",
					200: "#e2e8f0",
					300: "#cbd5e1",
					400: "#94a3b8",
					500: "#64748b",
					600: "#475569",
					700: "#334155",
					800: "#1e293b",
					900: "#0f172a",
				},
				accent: {
					blue: "#3b82f6",
					green: "#10b981",
					yellow: "#f59e0b",
					red: "#ef4444",
				},
			},
			zIndex: {
				9999: 9999,
				10000: 10000,
			},
			listStyleType: {
				circle: "circle",
			},
			boxShadow: {
				soft: "0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)",
				medium:
					"0 4px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
				strong:
					"0 10px 40px -10px rgba(0, 0, 0, 0.15), 0 4px 25px -5px rgba(0, 0, 0, 0.1)",
				glow: "0 0 20px rgba(222, 120, 151, 0.3)",
			},
			backdropBlur: {
				xs: "2px",
			},
			animation: {
				"fade-in": "fadeIn 0.2s ease-out",
				"slide-in-right": "slideInRight 0.3s ease-out",
				"slide-in-up": "slideInUp 0.2s ease-out",
				"bounce-subtle": "bounceSubtle 0.6s ease-out",
				"pulse-soft": "pulseSoft 2s ease-in-out infinite",
			},
			keyframes: {
				fadeIn: {
					"0%": { opacity: "0" },
					"100%": { opacity: "1" },
				},
				slideInRight: {
					"0%": { transform: "translateX(100%)", opacity: "0" },
					"100%": { transform: "translateX(0)", opacity: "1" },
				},
				slideInUp: {
					"0%": { transform: "translateY(10px)", opacity: "0" },
					"100%": { transform: "translateY(0)", opacity: "1" },
				},
				bounceSubtle: {
					"0%, 20%, 53%, 80%, 100%": { transform: "translate3d(0,0,0)" },
					"40%, 43%": { transform: "translate3d(0, -8px, 0)" },
					"70%": { transform: "translate3d(0, -4px, 0)" },
					"90%": { transform: "translate3d(0, -2px, 0)" },
				},
				pulseSoft: {
					"0%, 100%": { opacity: "1" },
					"50%": { opacity: "0.8" },
				},
			},
		},
	},
	plugins: [],
}
