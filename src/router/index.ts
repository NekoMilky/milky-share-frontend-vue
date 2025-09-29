import { createRouter, createWebHistory } from "vue-router"
import Home from "@/views/Home.vue"
import Playlist from "@/views/Playlist.vue"
import Upload from "@/views/Upload.vue"
import Profile from "@/views/Profile.vue"

// 路由配置
const routes = [
    {
        path: "/",
        redirect: "/home"
    },
    {
        path: "/home",
        name: "Home",
        component: Home
    },
    {
        path: "/playlist",
        name: "Playlist",
        component: Playlist
    },
    {
        path: "/upload",
        name: "Upload",
        component: Upload
    },
    {
        path: "/profile",
        name: "Profile",
        component: Profile
    }
];
const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
