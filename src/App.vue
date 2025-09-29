<script setup lang="ts">
import { useTagSelector } from "@/stores/tagSelector";
import CustomDialog from "@/components/common/CustomDialog.vue";
import CustomToast from "@/components/common/CustomToast.vue";
import RightClickMenu from "@/components/common/RightClickMenu.vue";
import TagSelector from "@/components/layout/TagSelector.vue";
import Home from "@/views/Home.vue";
import Playlist from "@/views/Playlist.vue";
import Upload from "@/views/Upload.vue";
import Profile from "@/views/Profile.vue";

// 选择标签
const tagStore = useTagSelector();
</script>

<template>
    <div class="app">
        <CustomDialog />
        <CustomToast />
        <RightClickMenu />
        <div class="column column-tag">
            <TagSelector class="box" />
        </div>
        <div class="column column-page">
            <Home v-if="tagStore.isSelected('home')" />
            <Playlist v-if="tagStore.isSelected('playlist')" />
            <Upload v-if="tagStore.isSelected('upload')" />
            <Profile v-if="tagStore.isSelected('profile')" />
        </div>
    </div>
</template>

<style scoped>
.app {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
}

.column {
    height: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
}

.column-page {
    width: 60%;
}

.column-tag {
    width: 20%;
}
</style>
