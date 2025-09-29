<script setup lang="ts">
import { computed } from "vue";
import type { Playlist } from "@/types";
import { debouncedRef } from "@/utils";
import { usePlaylist } from "@/stores/playlist";
import PlaylistComponent from "@/components/page/playlist/Playlist.vue";

import addImg from "@/assets/images/buttons/add.png";

const playlistStore = usePlaylist();

// 歌单搜索
const searchQuery = debouncedRef<string>("");
const searchFilter = (list: Array<Playlist>): Array<Playlist> => {
    if (!searchQuery.value) {
        return list;
    }
    return list.filter((playlist) => {
        const lowerSearchQuery = searchQuery.value.toLowerCase();
        return playlist.name.toLowerCase().includes(lowerSearchQuery);
    });
};
const finalCreatePlaylist = computed<Array<Playlist>>(() => {
    return searchFilter(playlistStore.createPlaylist);
});
const finalStarPlaylist = computed<Array<Playlist>>(() => {
    return searchFilter(playlistStore.starPlaylist);
});
</script>

<template>
    <template v-if="playlistStore.hasPlaylist">
        <div class="container" style="font-size: 1rem;">
            <!--搜索歌单-->
            <input v-model="searchQuery" class="input-frame with-icon" type="text" placeholder="搜索歌单" />
            <!--创建的歌单-->
            <PlaylistComponent 
                style="height: 45%;" 
                :label="'创建的歌单'" 
                :list="finalCreatePlaylist" 
                :button="{ src: addImg, onClick: playlistStore.playlistCreate }" 
            />
            <!--收藏的歌单-->
            <PlaylistComponent 
                style="height: 45%;" 
                :label="'收藏的歌单'" 
                :list="finalStarPlaylist" 
            />
        </div>
    </template>
    <template v-else>
        <div class="container">
            <!--创建歌单-->
            <PlaylistComponent 
                :label="'创建的歌单'" 
                :list="finalCreatePlaylist" 
                :button="{ src: addImg, onClick: playlistStore.playlistCreate }" 
            />
        </div>
    </template>
</template>

<style scoped>
.container {
    flex-direction: column;
}

.input-frame {
    width: 90%;
    height: 5%;
    background-image: url("@/assets/images/buttons/search.png");
}
</style>
