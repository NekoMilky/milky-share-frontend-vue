<script setup>
import MusicPlayer from "/src/components/common/MusicPlayer.vue";
import SongList from "/src/components/common/SongList.vue";
</script>

<template>
    <div class="page">
        <MusicPlayer class="box" style="height: 20%;" />
        <SongList class="box" style="height: 75%;" />
    </div>
</template>

<style scoped>
</style>
