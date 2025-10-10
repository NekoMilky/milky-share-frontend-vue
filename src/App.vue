<script setup lang="ts">
import { onMounted } from "vue";

import { useUser } from "@/stores/user";
import { useMusicPlayer } from "@/stores/musicPlayer";
import { usePageResponsive } from "@/stores/page";

import CustomDialog from "@/components/common/CustomDialog.vue";
import CustomToast from "@/components/common/CustomToast.vue";
import RightClickMenu from "@/components/common/RightClickMenu.vue";
import MusicPlayer from "@/components/common/MusicPlayer.vue";
import Sidebar from "@/components/layout/Sidebar.vue";

const userStore = useUser();
const musicPlayerStore = useMusicPlayer();
const pageResponsiveStore = usePageResponsive();

// 初始化仓库
onMounted(() => {
    userStore.init();
    musicPlayerStore.init();
});
</script>

<template>
    <div class="app" :style="{ fontSize: pageResponsiveStore.rootFontSize }">
        <div class="app-main">
            <Sidebar class="sidebar primary-color" />
            <div class="page-container scrollbar-column">
                <RouterView #="{ Component }">
                    <Transition name="page-transition">
                        <component :is="Component" />
                    </Transition>
                </RouterView>
            </div>
        </div>
        <MusicPlayer class="music-player primary-color" />
        <CustomDialog />
        <CustomToast />
        <RightClickMenu />
    </div>
</template>

<style scoped>
.app {
    position: fixed;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100dvh;
    z-index: 100;
    display: flex;
    flex-direction: column;
}

.app-main {
    width: 100%;
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: row;
    z-index: 0;
}

.music-player {
    width: 100%;
    height: 6em;
    z-index: 10;
}

.sidebar {
    width: auto;
    height: 100%;
}

.page-container {
    position: relative;
    flex: 1;
    min-width: 0;
    height: 100%;
    transition: var(--transition-duration);
    overflow: hidden auto;
}

.page-transition-enter-from, .transition-leave-to {
    opacity: 0;
}

.page-transition-enter-active, .transition-leave-active {
    transition: calc(var(--transition-duration) * 2);
}

.page-transition-enter-to, .transition-leave-from {
    opacity: 1;
}
</style>
