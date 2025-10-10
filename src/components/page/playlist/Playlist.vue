<script setup lang="ts">
import type { Playlist } from "@/types";

import { usePlaylist } from "@/stores";

import DefaultCoverImage from "@/assets/images/default/cover.png";

const playlistStore = usePlaylist();

const props = withDefaults(defineProps<{
    label: string,
    list: Array<Playlist>,
    button?: {
        iconSrc: string,
        onClick: () => void
    }
}>(), {
    label: "",
    list: () => [],
    button: () => ({
        iconSrc: "",
        onClick: () => {}
    })
});
</script>

<template>
    <div class="container">
        <div class="playlist-label">
            {{ props.label }}
            <img 
                class="button" 
                v-if="props.button.iconSrc"
                :src="props.button.iconSrc"
                @click="props.button.onClick"
            />
        </div>
        <div class="playlist-list scrollbar-column">
            <div class="playlist-list-empty" v-if="props.list.length === 0">这里空空如也</div>
            <div 
                class="playlist-item"
                v-for="(playlist, index) in props.list"
                :key="index"
                :class="{ 'item-selected': playlist.id === playlistStore.viewingPlaylist.id }"
                @click="playlistStore.viewPlaylist(playlist.id)"
            >
                <img class="cover" :src="playlist.cover ?? DefaultCoverImage" />
                {{ playlist.name }}
            </div>
        </div>
    </div>
    
</template>

<style scoped>
.container {
    border-radius: 1em !important;
}

.playlist-label {
    width: 100%;
    height: auto;
    padding: 0.25em;
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    font-weight: bold;
    gap: 0.25em;
}

.button {
    height: 1em;
    aspect-ratio: 1;
    border-radius: 50%;
    padding: 0.25em;
    box-sizing: border-box;
    background-color: transparent;
    transition: background-color var(--transition-duration);
    will-change: background-color;
}

.button:hover {
    cursor: pointer;
    background-color: var(--hovered-background-color);
    transform: translateZ(0);
}

.playlist-list {
    width: 100%;
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    overflow-x: hidden;
    overflow-y: auto;
}

.playlist-list-empty {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
}

.playlist-item {
    width: 100%;
    height: auto;
    box-sizing: border-box;
    padding: 0.5em;
    border-radius: 1em;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    background-color: transparent;
    transition: background-color var(--transition-duration);
    will-change: background-color;
}

.playlist-item:not(.item-selected):hover {
    cursor: pointer;
    background-color: var(--hovered-background-color);
    transform: translateZ(0);
}

.item-selected {
    background-color: var(--selected-background-color);
    transform: translateZ(0);
}

.cover {
    height: 2em;
    aspect-ratio: 1;
    margin-right: 0.5em;
    border-radius: 50%;
}
</style>
