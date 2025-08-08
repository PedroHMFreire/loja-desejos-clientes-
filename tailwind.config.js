// tailwind.config.js
import daisyui from 'daisyui'

export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif']
      }
    },
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        anote: {
          primary: '#2563eb',
          secondary: '#9333ea',
          accent: '#f97316',
          neutral: '#1f2937',
          'base-100': '#ffffff',
          info: '#0ea5e9',
          success: '#10b981',
          warning: '#fbbf24',
          error: '#ef4444',
        },
      },
    ],
  },
}
