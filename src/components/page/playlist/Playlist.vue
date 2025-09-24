<script setup>
import { usePlaylist } from "/src/stores/Playlist";

const playlistStore = usePlaylist();

const props = defineProps({
    label: {
        type: String,
        default: ""
    },
    list: {
        type: Array,
        default: []
    },
    button: {
        type: Object,
        default: {
            src: "",
            onClick: null
        }
    }
});
</script>

<template>
    <div class="playlist">
        <div class="playlist-label">
            {{ props.label }}
            <img 
                class="button" 
                v-if="props.button.src !== ''"
                :src="props.button.src"
                @click="props.button.onClick"
            />
        </div>
        <div class="playlist-list scrollbar-column">
            <div class="playlist-list-empty" v-if="props.list.length === 0">这里空空如也</div>
            <div 
                class="playlist-item"
                v-for="(playlist, index) in props.list"
                :class="{ 'item-selected': playlist.id === playlistStore.viewingPlaylist.id }"
                :key="index"
                @click="playlistStore.viewPlaylist(playlist.id)"
            >
                {{ playlist.name }}
            </div>
        </div>
    </div>
    
</template>

<style scoped>
.playlist {
    width: 100%;
    height: 45%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
}

.playlist-label {
    width: 100%;
    height: 8%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    font-weight: bold;
}

.button {
    height: 100%;
    aspect-ratio: 1;
    border-radius: 50%;
    margin-left: 0.5em;
    padding: 0.25em;
    box-sizing: border-box;
    background-color: transparent;
    transition: var(--transition-duration);
}

.button:hover {
    cursor: pointer;
    background-color: var(--hovered-background-color);
}

.playlist-list {
    width: 100%;
    height: 85%;
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
    width: 90%;
    box-sizing: border-box;
    padding: 0.5em;
    border-radius: 1em;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    background-color: transparent;
    transition: var(--transition-duration);
}

.playlist-item:not(.item-selected):hover {
    cursor: pointer;
    background-color: var(--hovered-background-color);
}

.item-selected {
    background-color: var(--selected-background-color);
}
</style>
