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
const getList = () => {
    return useSongList().viewingSongList;
};
</script>

<template>
    <div class="page">
        <MusicPlayer class="box" style="height: 20%;" />
        <div class="sub-row">
            <Selector class="box" style="width: 20%;" />
            <SongList class="box" style="width: 75%;" :columns="columns" :list="getList" />
        </div>
    </div>
</template>

<style scoped>
.sub-row {
    width: 100%;
    height: 75%;
    margin: 0.25em;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
}
</style>
