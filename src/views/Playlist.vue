<script setup>
import { useSongList } from "/src/stores/SongList";
import MusicPlayer from "/src/components/common/MusicPlayer.vue";
import SongList from "/src/components/common/SongList.vue";
import Selector from "/src/components/page/playlist/Selector.vue";

const columns = [
    { key: "index", label: "#", sortable: false, width: 10 },
    { key: "title", label: "标题", sortable: true, width: 50 },
    { key: "album", label: "专辑", sortable: true, width: 25 },
    { key: "duration", label: "时长", sortable: true, width: 15 }
];
const list = () => {
    return useSongList().viewingSongList;
};
</script>

<template>
    <div class="page">
        <MusicPlayer />
        <div class="list">
            <Selector style="width: 20%; height: 100%;" />
            <SongList :columns="columns" :list="list" style="width: 75%; height: 100%;" />
        </div>
    </div>
</template>

<style scoped>
.list {
    width: 100%;
    height: 75%;
    margin: 0.25em;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
}
</style>
