<script setup lang="ts">
import MusicPlayer from "@/components/common/MusicPlayer.vue";
import SongList from "@/components/common/SongList.vue";
</script>

<template>
    <div class="page">
        <MusicPlayer class="box" style="height: 20%;" />
        <SongList class="box" style="height: 75%;" />
    </div>
</template>

<style scoped>
</style>
