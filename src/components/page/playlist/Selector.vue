<script setup>
import { ref, computed } from "vue";
import { useDialog } from "/src/stores/Dialog";
import { usePlaylist } from "/src/stores/Playlist";
import Playlist from "/src/components/page/playlist/Playlist.vue";

import addImg from "/src/assets/images/buttons/add.png";

const dialogStore = useDialog();
const playlistStore = usePlaylist();

// 歌单搜索
const searchQuery = ref("");
const searchFilter = (list) => {
    if (searchQuery.value === "") {
        return list;
    }
    return list.filter((playlist) => {
        const lowerSearchQuery = searchQuery.value.toLowerCase();
        return playlist.name.toLowerCase().includes(lowerSearchQuery);
    });
};
const finalCreatePlaylist = computed(() => {
    return searchFilter(playlistStore.createPlaylist);
});
const finalStarPlaylist = computed(() => {
    return searchFilter(playlistStore.starPlaylist);
});

// 创建歌单
const createRows = [
    { key: "title", type: "text", text: "创建新歌单" },
    { key: "playlistName", type: "input", input: { required: true, type: "text", label: "歌单名", value: "", placeholder: "请输入歌单名" } }
];
const openCreate = () => {
    dialogStore.loadDialog(createRows, submitCreate);
};
const submitCreate = (values) => {
    playlistStore.playlistCreate(values.playlistName);
};
const createButton = {
    src: addImg,
    onClick: openCreate
};
</script>

<template>
    <div class="box playlist-selector-box">
        <!--搜索歌单-->
        <input v-model="searchQuery" class="search-bar" type="text" placeholder="搜索歌单" />
        <!--创建的歌单-->
        <Playlist :label="'创建的歌单'" :list="finalCreatePlaylist" :button="createButton" />
        <!--收藏的歌单-->
        <Playlist :label="'收藏的歌单'" :list="finalStarPlaylist" />
    </div>
</template>

<style scoped>
.playlist-selector-box {
    height: 75%;
    flex-direction: column;
    font-size: 1rem;
}

.search-bar {
    height: 8%;
}
</style>
