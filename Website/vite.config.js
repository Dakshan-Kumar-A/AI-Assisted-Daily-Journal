import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

<<<<<<< HEAD

export default defineConfig({
  plugins: [tailwindcss(), react()],
=======
// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(),react()],
>>>>>>> edbd1ccbbcffee205aa5f0610c10f86792a6517e
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})
<<<<<<< HEAD

=======
>>>>>>> edbd1ccbbcffee205aa5f0610c10f86792a6517e
