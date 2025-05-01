export default {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'ubuntu': ['var(--font-ubuntu)', 'sans-serif'],
        'system': ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        'cascadia': ['var(--font-cascadia-mono)', 'monospace'],
        'roboto-slab': ['var(--font-roboto-slab)', 'serif'],
        'hubot': ['var(--font-hubot-sans)', 'sans-serif'],
        'rowdies': ['var(--font-rowdies)', 'sans-serif'],
      },
      colors: {
        background: 'rgb(var(--background))',
        foreground: 'rgb(var(--foreground))',
        border: 'rgb(var(--border))'
      }
    }
  },
  plugins: [],
}