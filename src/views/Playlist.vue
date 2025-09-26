<script setup>
import { useSongList } from "/src/stores/SongList";
import { usePlaylist } from "/src/stores/Playlist";
import MusicPlayer from "/src/components/common/MusicPlayer.vue";
import SongList from "/src/components/common/SongList.vue";
import Selector from "/src/components/page/playlist/Selector.vue";
import PlaylistInfo from "/src/components/page/playlist/PlaylistInfo.vue";

const playlistStore = usePlaylist();

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
        <template v-if="playlistStore.viewingPlaylistId === ''">
            <Selector class="box" />
        </template>
        <template v-else>
            <div class="sub-row">
                <Selector class="box" style="width: 20%;" />
                <div class="box sub-column">
                    <PlaylistInfo style="height: 20%;" />
                    <SongList style="height: 75%;" :columns="columns" :list="getList" />
                </div>
            </div>
        </template>
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

.sub-column {
    width: 75%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
}
</style>
