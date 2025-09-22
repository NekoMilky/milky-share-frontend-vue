<script setup>
import MusicPlayer from "/src/components/MusicPlayer.vue";
import MusicList from "/src/components/MusicList.vue";
import { useMusicList } from "/src/stores/MusicList";

const columns = [
    { key: "index", label: "#", sortable: false, width: 10 },
    { key: "title", label: "标题", sortable: true, width: 45 },
    { key: "album", label: "专辑", sortable: true, width: 20 },
    { key: "duration", label: "时长", sortable: true, width: 15 },
    { key: "download", label: "下载", sortable: false, width: 10 }
];
const list = () => {
    return useMusicList().staredMusicList;
};
</script>

<template>
    <div class="page">
        <MusicPlayer />
        <MusicList :columns="columns" :list="list" />
    </div>
</template>

<style scoped>
</style>
