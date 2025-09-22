import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig(({ mode }) => ({
  plugins: [
    vue(),
    // 只在开发环境启用 devtools
    mode === 'development' && vueDevTools(),
  ],
  server: {
    host: '0.0.0.0',
    port: 8080,
    strictPort: true,
    allowedHosts: [
      'aeqjexypgfbc.sealosgzg.site'
    ]
  }
}))
