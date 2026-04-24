/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
        extend: {
            colors: {
                background: '#f8fafc',
                primary: '#003377',
                'primary-hover': '#0077cc',
                accent: '#00d4ff',
                'accent-green': '#22d3a5',
            },
            fontFamily: {
                serif: ['"IBM Plex Serif"', 'serif'],
                sans: ['Inter', 'sans-serif'],
                mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}
