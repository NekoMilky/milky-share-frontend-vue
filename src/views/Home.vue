<script setup lang="ts">
import { useSongList } from "@/stores/songList";
import MusicPlayer from "@/components/common/MusicPlayer.vue";
import SongList from "@/components/common/SongList.vue";

const songListStore = useSongList();
</script>

<template>
    <div class="page">
        <MusicPlayer class="box" style="height: 20%;" />
        <SongList class="box" style="height: 75%;" :list="songListStore.songList" />
    </div>
</template>

<style scoped>
</style>
