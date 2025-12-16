import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // REMPLACEZ 'nom-de-votre-depot' par le nom exact sur GitHub
  base: '/nom-de-votre-depot/', 
  plugins: [react()],
})