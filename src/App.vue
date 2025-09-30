<script setup lang="ts">
import type { PageTag } from "./types";
import { ref, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUser } from "@/stores/user";
import CustomDialog from "@/components/common/CustomDialog.vue";
import CustomToast from "@/components/common/CustomToast.vue";
import RightClickMenu from "@/components/common/RightClickMenu.vue";
import TagSelector from "@/components/layout/TagSelector.vue";

import defaultAvatarImg from "@/assets/images/default/avatar.png";

const route = useRoute();
const router = useRouter();
const userStore = useUser();

// 标签
const tags = computed<Array<PageTag>>(() => {
    const routes = router.getRoutes();
    return routes.filter((r) => {
        const meta = r.meta;
        if (!meta.showInTagSelector) {
            return false;
        }
        return !meta.requireAuth || userStore.isLogged;
    }).map((r) => {
        const meta = r.meta;
        const isProfile = meta.isProfile ?? false;
        let label = meta.label ?? "";
        let iconSrc = meta.iconSrc ?? "";
        // 如果是档案选项，动态调整标签和图标
        if (isProfile) {
            label = userStore.isLogged ? userStore.user.nickname : "未登录";
            iconSrc = userStore.isLogged ? (userStore.user.avatar ?? defaultAvatarImg) : defaultAvatarImg;
        }
        const pageTag = {
            path: r.path,
            label: label,
            iconSrc: iconSrc,
            isIconCircle: isProfile
        } as PageTag;
        return pageTag;
    });
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
    width: 60%;
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
