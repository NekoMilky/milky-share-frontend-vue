<script setup lang="ts">
import type { Playlist } from "@/types";

import { computed } from "vue";

import { debouncedRef } from "@/utils";

import { usePlaylist } from "@/stores";

import CustomInput from "@/components/common/CustomInput.vue";
import PlaylistComponent from "@/components/page/playlist/Playlist.vue";

import AddImage from "@/assets/images/icon/add.png";
import SearchImage from "@/assets/images/icon/search.png";

const playlistStore = usePlaylist();

// 歌单搜索
const searchQuery = debouncedRef<string>("");
const searchFilter = (list: Array<Playlist>): Array<Playlist> => {
    if (!searchQuery.value) return list;
    return list.filter((playlist) => {
        const lowerSearchQuery = searchQuery.value.toLowerCase();
        return playlist.name.toLowerCase().includes(lowerSearchQuery);
    });
};
const finalCreatePlaylist = computed<Array<Playlist>>(() => searchFilter(playlistStore.createPlaylist));
const finalStarPlaylist = computed<Array<Playlist>>(() => searchFilter(playlistStore.starPlaylist));
</script>

<template>
    <div class="container">
        <template v-if="playlistStore.hasPlaylist">
            <!--搜索歌单-->
            <CustomInput 
                class="search-playlist"
                v-model="searchQuery"
                :iconSrc="SearchImage"
                :placeHolder="'搜索歌单'"
            />
            <!--创建的歌单-->
            <PlaylistComponent 
                class="playlist secondary-color"
                :label="'创建的歌单'" 
                :list="finalCreatePlaylist" 
                :button="{ iconSrc: AddImage, onClick: playlistStore.playlistCreate }" 
            />
            <!--收藏的歌单-->
            <PlaylistComponent 
                class="playlist secondary-color" 
                :label="'收藏的歌单'" 
                :list="finalStarPlaylist" 
            />
        </template>
        <template v-else>
            <!--创建歌单-->
            <PlaylistComponent 
                class="playlist"
                :label="'创建的歌单'" 
                :list="finalCreatePlaylist" 
                :button="{ iconSrc: AddImage, onClick: playlistStore.playlistCreate }" 
            />
        </template>
    </div>
</template>

<style scoped>
.container {
    padding: 0.5em;
    gap: 0.5em;
    border-radius: 0;
    backdrop-filter: blur(3px);
}

.search-playlist {
    width: 100%;
    height: auto;
}

.playlist {
    width: 100%;
    flex: 1;
    min-height: 0;
}
</style>
