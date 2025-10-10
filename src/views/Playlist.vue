<script setup lang="ts">
import type { Playlist, CustomItemListColumn } from "@/types";

import { ref, watch } from "vue";

import { useSong, usePlaylist } from "@/stores";

import SongList from "@/components/common/SongList.vue";
import CustomBackground from "@/components/common/CustomBackground.vue";
import PlaylistSelector from "@/components/page/playlist/PlaylistSelector.vue";
import PlaylistInfo from "@/components/page/playlist/PlaylistInfo.vue";

import BackgroundImage from "@/assets/images/background.png";

const songStore = useSong();
const playlistStore = usePlaylist();

const songListColumns: Array<CustomItemListColumn> = [
    { key: "index", label: "#", sortable: false, width: 10, widthAdjustable: false, itemAlign: "center" },
    { key: "title", label: "标题", sortable: true, width: 50, widthAdjustable: true, itemAlign: "flex-start" },
    { key: "album", label: "专辑", sortable: true, width: 25, widthAdjustable: true, itemAlign: "center" },
    { key: "duration", label: "时长", sortable: true, width: 15, widthAdjustable: true, itemAlign: "center" }
];

// 歌单基本信息
const playlistInfo = ref<Playlist>(playlistStore.emptyPlaylist());
watch(() => playlistStore.viewingPlaylist, playlist => {
    playlistInfo.value = { ...playlist };
}, { deep: true, immediate: true });

// 保存信息
const savePlaylistInfo = (cover?: File):void => {
    if (!playlistStore.isViewingPlaylistEditable) return;
    if (cover) playlistInfo.value.coverFile = cover;
    playlistStore.saveViewingPlaylistInfo(playlistInfo.value);
};
</script>

<template>
    <div class="page">
        <CustomBackground :backgroundSrc="BackgroundImage" />
        <div class="subpage">
            <template v-if="playlistStore.hasPlaylist">
                <PlaylistSelector class="playlist-selector primary-color" />
                <div class="column secondary-color">
                    <PlaylistInfo 
                        class="info"
                        v-model="playlistInfo"
                        :isOwner="playlistStore.isViewingPlaylistEditable"
                        :onSave="savePlaylistInfo"
                    />
                    <SongList 
                        class="song-list" 
                        :list="songStore.viewingSongList" 
                        :rightClickMenuPreset="['play', 'download']"
                        :columns="songListColumns" 
                    />
                </div>
            </template>
            <template v-else>
                <PlaylistSelector class="primary-color" />
            </template>
        </div>
    </div>
</template>

<style scoped>
.page {
    height: 100%;
}

.subpage {
    width: 100%;
    height: 100%;
    padding: 0;
    flex-direction: row;
}

.playlist-selector {
    width: 25%;
    height: 100%;
}

.column {
    flex: 1;
    min-width: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.info {
    width: 100%;
    height: auto;
}

.song-list {
    width: 100%;
    flex: 1;
    min-height: 0;
}
</style>
