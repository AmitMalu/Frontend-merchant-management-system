import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

export default defineConfig({
  base: '/',

  plugins: [react()],

  server: {
    host: true,
    port: 5173,
    https: {
      key: fs.readFileSync('D:/IdeaProjects/razorjks/private.key'),
      cert: fs.readFileSync('D:/IdeaProjects/razorjks/fullchain.pem'),
    },
    hmr: {
      protocol: 'wss',
      host: 'portal.ashwamlearning.co.in',
      port: 5173
    }
  }
});