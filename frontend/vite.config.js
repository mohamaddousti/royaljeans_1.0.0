import react from '@vitejs/plugin-react'

export default {
  plugins: [react()],
  server: {
    hmr: {
      overlay: false,
    },
  },
};