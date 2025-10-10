<script setup lang="ts">
import type { Song, CustomItemListColumn, RightClickMenu } from "@/types";

import router from "@/router";
import { computed } from "vue";

import { timeFormat, debouncedRef } from "@/utils";
import { useMusicPlayer, useSong } from "@/stores";

import CustomInput from "@/components/common/CustomInput.vue";
import CustomItemList from "@/components/common/CustomItemList.vue";

import DefaultAvatarImage from "@/assets/images/default/avatar.png";
import DefaultCoverImage from "@/assets/images/default/cover.png";
import DeleteImage from "@/assets/images/buttons/delete.png";
import DownloadImage from "@/assets/images/buttons/download.png";
import PauseCircleImage from "@/assets/images/buttons-circle/pause.png";
import PauseImage from "@/assets/images/buttons/pause.png";
import PlayCircleImage from "@/assets/images/buttons-circle/play.png";
import PlayImage from "@/assets/images/buttons/play.png";
import SearchImage from "@/assets/images/buttons/search.png";
import StarImage from "@/assets/images/buttons/star.png";

const musicPlayerStore = useMusicPlayer();
const songStore = useSong();

const props = withDefaults(defineProps<{
    list?: Array<Song>,
    columns?: Array<CustomItemListColumn>,
    rightClickMenuPreset?: Array<string> 
}>(), {
    list: () => [],
    columns: () => [
        { key: "index", label: "#", sortable: false, width: 10, widthAdjustable: false, itemAlign: "center" },
        { key: "title", label: "标题", sortable: true, width: 40, widthAdjustable: true, itemAlign: "flex-start" },
        { key: "album", label: "专辑", sortable: true, width: 20, widthAdjustable: true, itemAlign: "center" },
        { key: "duration", label: "时长", sortable: true, width: 10, widthAdjustable: true, itemAlign: "center" },
        { key: "uploader", label: "上传者", sortable: true, width: 20, widthAdjustable: true, itemAlign: "flex-start" }
    ],
    rightClickMenuPreset: () => ["play", "star", "download"]
});

// 正在播放的音乐
const isPlaying = (item: unknown): boolean => {
    const song = item as Song;
    return song.id === musicPlayerStore.playingSong.id;
};

// 音乐列表搜索与排序
const searchQuery = debouncedRef<string>("");
const finalSongList = computed<Array<Song>>(() => {
    if (!searchQuery.value) return props.list;
    return props.list.filter(song => {
        const lowerSearchQuery = searchQuery.value.toLowerCase();
        const titleIncluded = song.title.toLowerCase().includes(lowerSearchQuery);
        const artistIncluded = song.artist.toLowerCase().includes(lowerSearchQuery);
        const albumIncluded = song.album.toLowerCase().includes(lowerSearchQuery);
        return titleIncluded || artistIncluded || albumIncluded;
    });
});
const sortSongList = (sortBy: string, isDesc: boolean) => (
    (itemA: unknown, itemB: unknown): number => {
        const songA = (itemA as Song);
        const songB = (itemB as Song);
        let compareA, compareB;
        switch (sortBy) {
            case "title":
                compareA = songA.title;
                compareB = songB.title;
                break;
            case "album":
                compareA = songA.album;
                compareB = songB.album;
                break;
            case "duration":
                compareA = songA.duration;
                compareB = songB.duration;
                break;
            case "uploader":
                compareA = songA.uploader?.nickname;
                compareB = songB.uploader?.nickname;
                break;
        }
        if (!compareA || !compareB) {
            return 0;
        }
        if (compareA > compareB) {
            return isDesc ? -1 : 1;
        }
        if (compareA < compareB) {
            return isDesc ? 1 : -1;
        }
        return 0;
    }
);

// 右键菜单预设
const rightClickMenu = (item: unknown): Array<RightClickMenu> => {
    const song = item as Song;
    let menus: Array<RightClickMenu> = [];
    props.rightClickMenuPreset.forEach(preset => {
        let menu = {};
        switch(preset) {
            case "play":
                let label = "播放";
                let icon = PlayImage;
                if (isPlaying(song) && musicPlayerStore.isPlaying) {
                    label = "暂停";
                    icon = PauseImage;
                }
                menu = {
                    key: "play",
                    label: label,
                    iconSrc: icon,
                    onClick: isPlaying(song) ? () => musicPlayerStore.togglePlay() : () => musicPlayerStore.loadSong(song.id)
                };
                break;
            case "star":
                menu = {
                    key: "star",
                    label: "收藏",
                    iconSrc: StarImage,
                    onClick: () => songStore.starSong(song.id, song.title)
                };
                break;
            case "download":
                menu = {
                    key: "download",
                    label: "下载",
                    iconSrc: DownloadImage,
                    onClick: () => songStore.downloadSong(song.id)
                };
                break;
            case "delete":
                menu = {
                    key: "delete",
                    label: "删除",
                    iconSrc: DeleteImage,
                    onClick: () => songStore.removeSong(song.id, song.title),
                    danger: true
                }
                break;
        }
        menus.push(menu as RightClickMenu);
    });
    return menus;
};
</script>

<template>
    <div class="container">
        <!--搜索音乐-->
        <CustomInput 
            class="search-song"
            v-model="searchQuery" 
            :iconSrc="SearchImage" 
            :placeHolder="'搜索标题、艺术家或专辑'" 
        />
        <!--音乐列表-->
        <CustomItemList
            class="song-list"
            :list="finalSongList"
            :columns="props.columns"
            :rightClickMenu="rightClickMenu"
            :sort="sortSongList"
            :isSelected="isPlaying"
        >
            <template #index="{ item, index, hoveredIndex }">
                <template v-if="isPlaying(item)">
                    <img 
                        class="song-item-button" 
                        :src="musicPlayerStore.isPlaying ? PauseCircleImage : PlayCircleImage" 
                        @click="musicPlayerStore.togglePlay"
                    />
                </template>
                <template v-else-if="index === hoveredIndex">
                    <img 
                        class="song-item-button" 
                        src="@/assets/images/buttons-circle/play.png" 
                        @click="musicPlayerStore.loadSong((item as Song).id)"
                    />
                </template>
                <template v-else>{{ index + 1 }}</template>
            </template>
            <template #title="{ item }">
                <img class="song-item-cover" :src="(item as Song).cover as string ?? DefaultCoverImage" />
                <div class="song-base-info">
                    <div class="song-title">{{ (item as Song).title }}</div>
                    <div class="song-artist">{{ (item as Song).artist }}</div>
                </div>
            </template>
            <template #album="{ item }">
                {{ (item as Song).album }}
            </template>
            <template #duration="{ item }">
                {{ timeFormat((item as Song).duration) }}
            </template>
            <template #uploader="{ item }">
                <div class="uploader" @click="router.push(`/profile/${(item as Song).uploader?.nickname}`)">
                    <img class="uploader-avatar" :src="(item as Song).uploader?.avatar as string ?? DefaultAvatarImage" />
                    <div class="uploader-nickname">{{ (item as Song).uploader?.nickname }}</div>
                </div>
            </template>
            <template #delete="{ item }">
                <img 
                    class="song-item-button"
                    src="@/assets/images/buttons/delete.png"
                    @click="songStore.removeSong((item as Song).id, (item as Song).title)"
                />
            </template>
        </CustomItemList>
    </div>
</template>

<style scoped>
.container {
    padding: 0.5em;
    gap: 0.5em;
}

.search-song {
    width: 100%;
    height: auto;
}

.song-list {
    width: 100%;
    flex: 1;
    min-height: 0;
}

.playing-now {
    font-weight: bold;
}

.song-item-cover {
    height: 2.4em;
    aspect-ratio: 1;
    margin-right: 0.5em;
}

.song-base-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: first baseline;
}

.song-artist {
    font-size: 0.8em;
}

.song-item-button {
    height: 1.2em;
    aspect-ratio: 1;
    padding: 0.5em;
    border-radius: 1em;
    background-color: transparent;
    transition: background-color var(--transition-duration);
    will-change: background-color;
}

.song-item-button:hover {
    cursor: pointer;
    background-color: var(--hovered-background-color);
    transform: translateZ(0);
}

.uploader {
    cursor: pointer;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5em;
}

.uploader-avatar {
    height: 2em;
    aspect-ratio: 1;
    border-radius: 50%;
}
</style>
