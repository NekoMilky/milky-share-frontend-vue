<script setup lang="ts">
import type { PageTag } from "./types";
import { ref, computed, watch } from "vue";
import { useRoute } from "vue-router";
import { useUser } from "@/stores/user";
import CustomDialog from "@/components/common/CustomDialog.vue";
import CustomToast from "@/components/common/CustomToast.vue";
import RightClickMenu from "@/components/common/RightClickMenu.vue";
import TagSelector from "@/components/layout/TagSelector.vue";

import defaultAvatarImg from "@/assets/images/default/avatar.png";
import homeImg from "@/assets/images/buttons/home.png";
import playlistImg from "@/assets/images/buttons/playlist.png";
import uploadImg from "@/assets/images/buttons/upload.png";

const route = useRoute();
const userStore = useUser();

// 标签
const tags = computed<Array<PageTag>>(() => {
    return [
        {
            path: "/profile", 
            iconSrc: userStore.user.avatar ?? defaultAvatarImg, 
            isAvatar: true,
            label: userStore.isLogged ? "档案" : "未登录" 
        },
        {
            path: "/home",
            iconSrc: homeImg,
            label: "首页"
        },
        {
            path: "/playlist",
            iconSrc: playlistImg,
            label: "歌单"
        },
        {
            path: "/upload",
            iconSrc: uploadImg,
            label: "上传"
        }
    ];
});

// 标签顺序与切换动画
const tagOrder = computed<Array<string>>(() => {
    return tags.value.map((tag) => tag.path);
});
const tagAnimation = ref<string>("slide-up");
watch(() => route.path, (newValue, oldValue) => {
    if (!newValue || !oldValue) {
        return;
    }
    const newIndex = tagOrder.value.indexOf(newValue);
    const oldIndex = tagOrder.value.indexOf(oldValue);
    tagAnimation.value = newIndex > oldIndex ? "slide-up" : "slide-down";
});
</script>

<template>
    <div class="app">
        <CustomDialog />
        <CustomToast />
        <RightClickMenu />
        <TagSelector class="box tag-selector" :tags="tags" />
        <div class="page-container">
            <RouterView #="{ Component }">
                <Transition :name="tagAnimation">
                    <component :is="Component" />
                </Transition>
            </RouterView>
        </div>
    </div>
</template>

<style scoped>
.app {
    width: 100vw;
    height: 100vh;
    position: relative;
}

.page-container {
    position: absolute;
    left: 50%;
    top: 0;
    transform: translateX(-50%);
    width: 70%;
    height: 100%;
}

.tag-selector {
    position: absolute;
    left: 0;
    top: 0;
    max-width: 15%;
}

.slide-up-enter-from, .slide-down-leave-to {
    opacity: 0;
    transform: translateY(100%);
}

.slide-down-enter-from, .slide-up-leave-to {
    opacity: 0;
    transform: translateY(-100%);
}

.slide-up-enter-active, .slide-up-leave-active, .slide-down-enter-active, .slide-down-leave-active {
    transition: calc(var(--transition-duration) * 2);
}

.slide-up-enter-to, .slide-up-leave-from, .slide-down-enter-to, .slide-down-leave-from  {
    opacity: 1;
    transform: translateY(0);
}
</style>
