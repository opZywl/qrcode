
import type {Config} from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['Inter', 'sans-serif'],
        headline: ['Inter', 'sans-serif'],
        code: ['monospace'],
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
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
        'text-glow-footer': {
          '0%, 100%': { textShadow: '0 0 3px hsl(var(--footer-glow-hue) var(--footer-glow-saturation) var(--footer-glow-lightness) / 0.8), 0 0 6px hsl(var(--footer-glow-hue) var(--footer-glow-saturation) var(--footer-glow-lightness) / 0.5)' },
          '50%': { textShadow: '0 0 6px hsl(var(--footer-glow-hue) var(--footer-glow-saturation) var(--footer-glow-lightness) / 0.8), 0 0 12px hsl(var(--footer-glow-hue) var(--footer-glow-saturation) var(--footer-glow-lightness) / 0.5)' },
        },
        'text-glow-primary': {
          '0%, 100%': { textShadow: '0 0 4px hsl(var(--primary) / 0.7), 0 0 8px hsl(var(--primary) / 0.5)' },
          '50%': { textShadow: '0 0 8px hsl(var(--primary) / 0.7), 0 0 16px hsl(var(--primary) / 0.5)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'text-glow-footer': 'text-glow-footer 2.5s ease-in-out infinite',
        'text-glow-primary': 'text-glow-primary 2.5s ease-in-out infinite alternate',
      },
      boxShadow: {
        'outline-primary': '0 0 0 2px hsl(var(--primary) / 0.5)',
        'green-glow': '0 0 8px rgba(72,187,120,0.5), 0 0 15px rgba(72,187,120,0.3)',
        'primary-glow': '0 0 8px hsl(var(--primary) / 0.6), 0 0 15px hsl(var(--primary) / 0.4)',
      }
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;

    