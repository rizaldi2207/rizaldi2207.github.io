/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
        extend: {
            colors: {
                background: '#f8fafc',
                primary: '#003377',
                'primary-hover': '#0077cc',
            },
            fontFamily: {
                serif: ['"IBM Plex Serif"', 'serif'],
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}
