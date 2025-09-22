<script setup>
import { useTagSelector } from "/src/stores/TagSelector";
import TagSelector from "/src/components/TagSelector.vue";
import Home from "/src/views/Home.vue";
import Playlist from "/src/views/Playlist.vue";
import Upload from "/src/views/Upload.vue";
import Profile from "/src/views/Profile.vue";

// 选择标签
const tagStore = useTagSelector();
</script>

<template>
    <div class="app">
        <div class="column column-tag">
            <TagSelector />
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
