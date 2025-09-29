import { defineConfig } from "vite"
import path from "path";
import vue from "@vitejs/plugin-vue"
import vueDevTools from "vite-plugin-vue-devtools"

export default defineConfig(({ mode }) => ({
    plugins: [
        vue(),
        mode === "development" ? vueDevTools() : undefined,
    ],
    server: {
        host: "0.0.0.0",
        port: 8080,
        strictPort: true,
        allowedHosts: [
            "aeqjexypgfbc.sealosgzg.site"
        ]
    },
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src")
        }
    }
}))
