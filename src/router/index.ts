import { createRouter, createWebHistory } from "vue-router";
import { useUser } from "@/stores/user";
import Home from "@/views/Home.vue";
import Playlist from "@/views/Playlist.vue";
import Upload from "@/views/Upload.vue";
import Profile from "@/views/Profile.vue";

import homeImg from "@/assets/images/buttons/home.png";
import playlistImg from "@/assets/images/buttons/playlist.png";
import uploadImg from "@/assets/images/buttons/upload.png";

// 路由配置
const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: "/",
            redirect: "/home"
        },
        {
            path: "/profile",
            name: "Profile",
            meta: { 
                showInTagSelector: true,
                isProfile: true
            },
            component: Profile
        },
        {
            path: "/home",
            name: "Home",
            meta: { 
                showInTagSelector: true,
                label: "首页",
                iconSrc: homeImg
            },
            component: Home
        },
        {
            path: "/playlist",
            name: "Playlist",
            meta: { 
                requireAuth: true, 
                showInTagSelector: true,
                label: "歌单",
                iconSrc: playlistImg
            },
            component: Playlist
        },
        {
            path: "/upload",
            name: "Upload",
            meta: { 
                requireAuth: true, 
                showInTagSelector: true,
                label: "上传",
                iconSrc: uploadImg
            },
            component: Upload
        }
    ]
});

// 前置守卫
router.beforeEach((to) => {
    const userStore = useUser();
    // 未登录用户无法访问个别页面
    if (to.meta.requireAuth && !userStore.isLogged) {
        return { path: "/home" };
    }
});

export default router;
