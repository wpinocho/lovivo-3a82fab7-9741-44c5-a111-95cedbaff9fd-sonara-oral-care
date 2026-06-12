import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				'sora': ['Sora', 'sans-serif'],
				'dm-sans': ['"DM Sans"', 'sans-serif'],
				'inter': ['Inter', 'sans-serif'],
				'lato': ['Lato', 'sans-serif'],
				'lora': ['Lora', 'serif'],
				'merriweather': ['Merriweather', 'serif'],
				'montserrat': ['Montserrat', 'sans-serif'],
				'nunito': ['Nunito', 'sans-serif'],
				'open-sans': ['"Open Sans"', 'sans-serif'],
				'playfair': ['"Playfair Display"', 'serif'],
				'jakarta': ['"Plus Jakarta Sans"', 'sans-serif'],
				'poppins': ['Poppins', 'sans-serif'],
				'raleway': ['Raleway', 'sans-serif'],
				'roboto': ['Roboto', 'sans-serif'],
				'space-grotesk': ['"Space Grotesk"', 'sans-serif'],
				'work-sans': ['"Work Sans"', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
				spacing: {
					'section-sm': '64px',
					'section': '96px',
					'section-lg': '128px',
				},
				borderRadius: {
					'card': '22px',
					'card-lg': '28px',
					'pill': '100px',
				},
				keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.5s ease forwards',
				'slide-up': 'slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
				'float': 'float 3s ease-in-out infinite',
			},
			backgroundImage: {
				'gradient-hero': 'linear-gradient(135deg, hsl(212 100% 95%) 0%, hsl(162 67% 96%) 100%)',
				'gradient-ink': 'linear-gradient(135deg, hsl(213 52% 12%) 0%, hsl(213 52% 20%) 100%)',
				'gradient-aqua': 'linear-gradient(135deg, hsl(175 62% 61%) 0%, hsl(195 72% 55%) 100%)',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;