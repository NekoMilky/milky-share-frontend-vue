import "./assets/styles/global.css";
import { createApp } from "vue";
import App from "./App.vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import router, { setupRoutes } from "@/router";

const app = createApp(App);

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);
app.use(pinia);

setupRoutes();
app.use(router);

app.mount("#app");
