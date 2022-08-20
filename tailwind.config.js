/** @type {import('tailwindcss').Config} */

module.exports = {
    content: ['./src/**/*.{js,ts,jsx,tsx}'],
    theme: {
        extend: {
            transitionProperty: {
                height: 'height',
            },
        },
    },
    plugins: [require('@tailwindcss/line-clamp')],
    darkMode: 'class',
};
