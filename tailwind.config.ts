
import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    // Removed web/app and web/components as they are being consolidated/deleted
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['var(--font-inter)', 'sans-serif'],
        'space-grotesk': ['var(--font-space-grotesk)', 'sans-serif'],
      },
      colors: {
        background: 'hsl(var(--background))', // Uses HSL var from globals.css
        foreground: 'hsl(var(--foreground))', // Uses HSL var from globals.css
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))', // Desaturated Blue
          foreground: 'hsl(var(--primary-foreground))', // White
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))', // Lighter Grey
          foreground: 'hsl(var(--secondary-foreground))', // Darker Slate
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))', // Medium Grey
          foreground: 'hsl(var(--muted-foreground))', // Mid-tone slate
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))', // Soft Green
          foreground: 'hsl(var(--accent-foreground))', // Deep Slate/Dark Green
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))', // Light Grey border
        input: 'hsl(var(--input))', // White input background
        ring: 'hsl(var(--ring))', // Soft Green for focus rings (or Primary)
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        // Landing page specific semantic colors (can be phased out if covered by above)
        'deep-slate': 'hsl(var(--foreground-hsl))', // Maps to foreground now
        'electric-blue': 'hsl(var(--primary-hsl))', // Maps to primary now
        'pure-white': 'hsl(var(--card-hsl))', // Maps to card/popover background now
        'light-gray-bg': 'hsl(var(--background-hsl))', // Maps to background now
        'medium-gray-border': 'hsl(var(--border-hsl))', // Maps to border now
        'dark-gray-text': 'hsl(var(--foreground-hsl))', // Maps to foreground now
      },
      borderRadius: {
        lg: 'var(--radius)', 
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: 'calc(var(--radius) + 4px)', 
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        'medium': '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
        'strong': '0 10px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -2px rgba(0, 0, 0, 0.03)',
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
