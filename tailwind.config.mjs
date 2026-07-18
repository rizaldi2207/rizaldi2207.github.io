/** @type {import('tailwindcss').Config} */

// Brand scale from the Claude Design handoff (AppSecMonarch Blog.dc.html).
// Runtime theming reads the CSS variables in Layout.astro — these tokens exist
// so Tailwind utilities resolve to the same values. Keep the two in step.
export default {
    darkMode: 'class',
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
        extend: {
            colors: {
                navy: {
                    DEFAULT: '#001840',
                    deep: '#0a1b33',
                    lifted: '#06224f',
                },
                accent: {
                    DEFAULT: '#0070d0',
                    hover: '#005cb0',
                    soft: '#e8f3ff',
                    light: '#4da3f0',
                },
                ink: {
                    DEFAULT: '#001840',
                    body: '#3a4658',
                    muted: '#5a6b82',
                    dim: '#8c9bb5',
                },
                line: {
                    DEFAULT: '#e7edf5',
                    strong: '#dce5f0',
                },
                mist: '#f4f8fd',
                danger: '#e05555',

                // Theme-aware aliases — prefer these in markup so utilities
                // follow the light/dark switch instead of pinning one theme.
                bg: 'var(--bg)',
                'bg-secondary': 'var(--bg-secondary)',
                'card-bg': 'var(--card-bg)',
            },
            fontFamily: {
                sans: ['"DM Sans"', 'sans-serif'],
                display: ['Syne', 'sans-serif'],
                mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
            },
            maxWidth: {
                container: '1180px',
            },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}
