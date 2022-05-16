import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte()],
  server : {
    port : 4000
  },
  resolve:{
    alias : [{
      find : 'utils/*',
      replacement : './src/utils/*'
    },{
      find : 'store/*',
      replacement : './src/store/*'
    },
    {
      find : 'store',
      replacement : './src/store/index.ts'
    }]
  }
})
