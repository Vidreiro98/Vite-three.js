import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './', // ⚠️ aqui usamos './' para caminhos relativos
  plugins: [react()],
});
