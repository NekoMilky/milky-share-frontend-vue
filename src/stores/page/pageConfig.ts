import type { PageConfig } from "@/types";

import { defineStore } from "pinia";
import { computed } from "vue";

import DefaultAvatarImage from "@/assets/images/default/avatar.png";
import HomeImage from "@/assets/images/icon/home.png";
import PlaylistImage from "@/assets/images/icon/playlist.png";

export const usePageConfig = defineStore("pageConfig", () => {
    const basePages = computed<Array<PageConfig>>(() => [
        {
            name: "login",
            requireRole: "onlyGuest",
            showInSidebar: true,
            label: "登录",
            iconSrc: DefaultAvatarImage,
            isIconCircle: true
        },
        {
            name: "profile",
            requireRole: "onlyUser",
            showInSidebar: true,
            isIconCircle: true
        },
        {
            name: "home",
            requireRole: "public",
            showInSidebar: true,
            label: "首页",
            iconSrc: HomeImage
        },
        {
            name: "playlist",
            requireRole: "onlyUser",
            showInSidebar: true,
            label: "歌单",
            iconSrc: PlaylistImage
        },
        {
            name: "playing",
            requireRole: "public",
            showInSidebar: false
        }
    ]);

    return {
        basePages
    };
});
