<script setup>
import { ref, nextTick, watch, onMounted, computed, defineProps, onUnmounted } from "vue";
import { timeFormat } from "/src/utils/Utility";
import { getMusic } from "/src/api/Music";
import { useMusicPlayer } from "/src/stores/MusicPlayer";
import { useMusicList } from "/src/stores/MusicList";

import defaultCoverImg from "/src/assets/images/default/cover.png";
import playImg from "/src/assets/images/buttons/play.png";
import pauseImg from "/src/assets/images/buttons/pause.png";
import starImg from "/src/assets/images/buttons/star.png";
import staredImg from "/src/assets/images/buttons/stared.png";

const musicPlayerStore = useMusicPlayer();
const musicListStore = useMusicList();

const musicListHeader = ref(null);
const getMusicListHeaderWidth = () => {
    if (!musicListHeader.value) {
        return 0;
    }
    return parseFloat(getComputedStyle(musicListHeader.value).width);
};

const props = defineProps({
    columns: {
        type: Array,
        default: () => [
            { key: "index", label: "#", sortable: false, width: 10 },
            { key: "title", label: "标题", sortable: true, width: 40 },
            { key: "album", label: "专辑", sortable: true, width: 15 },
            { key: "duration", label: "时长", sortable: true, width: 15 },
            { key: "star", label: "收藏", sortable: false, width: 10 },
            { key: "download", label: "下载", sortable: false, width: 10 }
        ]
    },
    list: {
        type: Function,
        default: () => {
            return useMusicList().musicList;
        }
    }
});

// 音乐列表
const musicList = computed(() => props.list());

// 列配置
const columnWidths = ref({});
const updateColumns = () => {
    props.columns.forEach((column) => {
        columnWidths.value[column.key] = column.width;
    });
};
const isDraggingColumn = ref(false);
const currentColumn = ref("");
const nextColumn = ref("");
const isLeft = ref(false);
const startX = ref(0);
const startWidth = ref(0);
const totalWidth = ref(0);
const columnOrder = computed(() => {
    return props.columns.map((column) => {
        return column.key;
    });
});
const isResizable = (column, left) => {
    const index = columnOrder.value.indexOf(column);
    if (left && index === 0) {
        return false;
    }
    if (!left && index === columnOrder.value.length - 1) {
        return false;
    }
    return true;
}
const startDragColumn = (column, left, event) => {
    if (!isResizable(column, left)) {
        return;
    }
    // 记录初始数据
    isDraggingColumn.value = true;
    isLeft.value = left;
    currentColumn.value = column;
    nextColumn.value = columnOrder.value[columnOrder.value.indexOf(currentColumn.value) + (isLeft.value ? -1 : 1)]; 
    startWidth.value = columnWidths.value[currentColumn.value];
    totalWidth.value = columnWidths.value[nextColumn.value] + startWidth.value;
    startX.value = event.clientX;
    // 监听事件
    window.addEventListener("mousemove", dragColumn);
    window.addEventListener("mouseup", stopDragColumn);
};
const stopDragColumn = () => {
    isDraggingColumn.value = false;
    window.removeEventListener("mousemove", dragColumn);
    window.removeEventListener("mouseup", stopDragColumn);
};
const dragColumn = (event) => {
    if (!isDraggingColumn.value) { 
        return; 
    }
    // 计算新列宽
    const minWidth = 10;
    const delta = (event.clientX - startX.value) / getMusicListHeaderWidth() * 100;
    const newWidth = Math.max(minWidth, Math.min(totalWidth.value - minWidth, startWidth.value + delta * (isLeft.value ? -1 : 1)));
    columnWidths.value[currentColumn.value] = newWidth;
    columnWidths.value[nextColumn.value] = totalWidth.value - newWidth;
};

// 鼠标悬停显示播放按钮
const mouseHoverIndex = ref(-1);
const handleMouseEnter = (index) => {
    mouseHoverIndex.value = index;
};
const handleMouseLeave = (index) => {
    if (mouseHoverIndex.value === index) {
        mouseHoverIndex.value = -1;
    }
};

// 音乐列表搜索与排序
const searchQuery = ref("");
const sortBy = ref("none");
const sortDesc = ref(false);
const finalMusicList = computed(() => {
    let result = musicList.value;
    if (searchQuery.value !== "") {
        result = result.filter((song) => {
            const lowerSearchQuery = searchQuery.value.toLowerCase();
            const titleIncluded = song.title.toLowerCase().includes(lowerSearchQuery);
            const artistIncluded = song.artist.toLowerCase().includes(lowerSearchQuery);
            const albumIncluded = song.album.toLowerCase().includes(lowerSearchQuery);
            return titleIncluded || artistIncluded || albumIncluded;
        });
    }
    if (sortBy.value !== "none") {
        result = sortMusicList(result);
    }
    return result;
});
const switchSortBy = (column) => {
    if (sortBy.value === "none" || sortBy.value !== column) {
        sortBy.value = column;
        sortDesc.value = false;
        return;
    }
    else if (sortDesc.value) {
        sortBy.value = "none";
        sortDesc.value = false;
    }
    else {
        sortDesc.value = true;
    }
};
const sortMusicList = (list) => {
    let result = [...list];
    result.sort((a, b) => {
        let compareA, compareB;
        if (sortBy.value === "title") {
            compareA = a.title.toLowerCase();
            compareB = b.title.toLowerCase();
        } 
        else if (sortBy.value === "album") {
            compareA = a.album.toLowerCase();
            compareB = b.album.toLowerCase();
        }
        else if (sortBy.value === "duration") {
            compareA = a.duration;
            compareB = b.duration;
        }
        if (sortDesc.value) {
            return compareA > compareB ? -1 : compareA < compareB ? 1 : 0;
        } 
        else {
            return compareA < compareB ? -1 : compareA > compareB ? 1 : 0;
        }
    });
    return result;
};
const getColumnName = (column, label) => {
    if (sortBy.value !== column) {
        return label;
    }
    if (sortDesc.value) {
        return `${label} ↓`;
    }
    else {
        return `${label} ↑`;
    }
};

// 列表表头滚动条修正
const musicListItems = ref(null);
const hasScrollbar = ref(false);
const checkScrollbar = () => {
    hasScrollbar.value = false;
    if (musicListItems.value) {
        hasScrollbar.value = musicListItems.value.scrollHeight > musicListItems.value.clientHeight;
    }
};
watch(() => finalMusicList, async () => {
    await nextTick();
    checkScrollbar();
});

// 下载音乐
const musicDownload = async (songId) => {
    const response = await getMusic(songId);
    if (!response.success) {
        console.error(response.message);
        return;
    }
    const url = response.data.song.url;
    const link = document.createElement("a");
    link.href = url;
    link.click();
};

// 初始化
onMounted(() => {
    updateColumns();
    checkScrollbar();
    onUnmounted(() => {
        // 解除监听
        window.removeEventListener("mousemove", dragColumn);
        window.removeEventListener("mouseup", stopDragColumn);
    });
});
</script>

<template>
    <div class="box music-list-box">
        <!--搜索音乐-->
        <input v-model="searchQuery" class="music-search" type="text" placeholder="搜索标题、艺术家或专辑" />
        <!--音乐列表-->
        <div class="music-list">
            <!--表头-->
            <div class="music-list-header" ref="musicListHeader" :style="{ paddingRight: hasScrollbar ? 'var(--scrollbar-width)' : '0' }">
                <div 
                    v-for="column in columns" 
                    :key="column.key"
                    :class="['column', `column-${column.key}`, { 'column-sortable': column.sortable }]"
                    :style="{ width: `${columnWidths[column.key]}%` }"
                >
                    <div 
                        class="resize-handle" 
                        style="left: 0;"
                        @mousedown="startDragColumn(column.key, true, $event)"
                        v-if="isResizable(column.key, true)"
                    ></div>
                    <div 
                        class="column-label" 
                        @click="column.sortable && switchSortBy(column.key)"
                    >
                        {{ getColumnName(column.key, column.label) }}
                    </div>
                    <div 
                        class="resize-handle" 
                        style="right: 0;"
                        @mousedown="startDragColumn(column.key, false, $event)"
                        v-if="isResizable(column.key, false)"
                    ></div>
                </div>
            </div>
            <!--列表-->
            <div class="music-list-items" ref="musicListItems">
                <div class="music-list-empty" v-if="finalMusicList.length === 0">
                    这里空空如也
                </div>
                <div 
                    v-else
                    v-for="(song, index) in finalMusicList" 
                    class="music-item"
                    :class="{ 'playing-now': song.id === musicPlayerStore.playingSong.id }"
                    :key="index"
                    @mouseenter="handleMouseEnter(index)"
                    @mouseleave="handleMouseLeave(index)"
                >
                    <div 
                        v-for="column in columns" 
                        :key="column.key"
                        :class="['column', `column-${column.key}`]"
                        :style="{ width: `${columnWidths[column.key]}%` }"
                    >
                        <template v-if="column.key === 'index'">
                            <img 
                                v-if="song.id === musicPlayerStore.playingSong.id"
                                class="music-item-button" 
                                :src="musicPlayerStore.isPlaying ? pauseImg : playImg" 
                                @click="musicPlayerStore.togglePlay"
                            />
                            <img 
                                v-else-if="mouseHoverIndex === index"
                                class="music-item-button" 
                                src="/src/assets/images/buttons/play.png" 
                                @click="musicPlayerStore.loadSong(song.id)" 
                            />
                            <span v-else>{{ index + 1 }}</span>
                        </template>
                        <template v-if="column.key === 'title'">
                            <img class="music-item-cover" :src="song.cover || defaultCoverImg" />
                            <div class="music-item-info">
                                {{ song.title }}<br />
                                <div class="column-small-font">{{ song.artist }}</div>
                            </div>
                        </template>
                        <template v-if="column.key === 'album'">
                            {{ song.album }}
                        </template>
                        <template v-if="column.key === 'duration'">
                            {{ timeFormat(song.duration) }}
                        </template>
                        <template v-if="column.key === 'star'">
                            <img 
                                class="music-item-button" 
                                :src="musicListStore.isStared(song.id) ? staredImg : starImg"  
                                @click="musicListStore.star(song.id)"
                            />
                        </template>
                        <template v-if="column.key === 'download'">
                            <img 
                                class="music-item-button" 
                                src="/src/assets/images/buttons/download.png" 
                                @click="musicDownload(song.id)" 
                            />
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.music-list-box {
    height: 75%;
    flex-direction: column;

    --scrollbar-width: 6px;
    --scrollbar-track-color: rgba(255, 255, 255, 0.2);
    --scrollbar-track-border-radius: 10px;
}

.music-search {
    font-size: 1em;
    font-family: "Aa小迷糊少女";
    color: white;
    width: 90%;
    height: 8%;
    padding: 0.5em 0.5em 0.5em 2em;
    box-sizing: border-box;
    background-color: transparent;
    border-radius: 1em;
    border: none;
    outline: none;
    background-image: url("/src/assets/images/buttons/search.png");
    background-size: 1em;
    background-position: 0.6em center;
    background-repeat: no-repeat;
    transition: var(--transition-duration);
}

.music-search:focus, .music-search:hover {
    background-color: var(--hovered-background-color);
}

.music-search::placeholder {
    color: rgb(192, 192, 192)
}

.music-list {
    width: 90%;
    height: 90%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
}

.music-list-header {
    height: 10%;
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    font-size: 1.2em;
    font-weight: bold;
    align-items: center;
}

.music-list-items {
    height: 85%;
    box-sizing: border-box;
    overflow-x: hidden;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
}

.music-list-items::-webkit-scrollbar {
    width: var(--scrollbar-width);
    opacity: 0;
}

.music-list-items::-webkit-scrollbar-track {
    background-color: transparent;
    border-radius: var(--scrollbar-track-border-radius);
}

.music-list-items::-webkit-scrollbar-thumb {
    background-color: transparent;
    border-radius: var(--scrollbar-track-border-radius);
}

.music-list-items:hover::-webkit-scrollbar {
    opacity: 1;
}

.music-list-items:hover::-webkit-scrollbar-track {
    background-color: var(--scrollbar-track-color);
}

.music-list-items:hover::-webkit-scrollbar-thumb {
    background-color: white;
}

.music-list-items:hover::-webkit-scrollbar-thumb:hover {
    background-color: rgb(192, 192, 192);
}

.music-list-empty {
    height: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
}

.music-item {
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    align-items: center;
    border-radius: 1em;
    background-color: transparent;
    transition: background-color var(--transition-duration);
}

.music-item:hover {
    background-color: var(--hovered-background-color);
}

.column {
    padding: 0.5em;
    border-radius: 0.5em;
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    background-color: transparent;
}

.music-list-header .column {
    position: relative;
    transition: background-color var(--transition-duration);
}

.music-list-header .column:hover {
    background-color: var(--hovered-background-color);
}

.resize-handle {
    position: absolute;
    top: 0;
    width: 0.25em;
    height: 100%;
    cursor: e-resize;
}

.column-label {
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
}

.column-title {
    justify-content: flex-start;
}

.column-title .column-label {
    justify-content: flex-start;
}

.column-small-font {
    font-size: 0.8em;
}

.column-sortable:hover {
    cursor: pointer;
}

.playing-now {
    font-weight: bold;
}

.music-item-cover {
    height: 2.4em;
    aspect-ratio: 1;
    margin-right: 0.5em;
}

.music-item-button {
    height: 1.2em;
    aspect-ratio: 1;
    padding: 0.5em;
    border-radius: 1em;
    background-color: transparent;
    transition: var(--transition-duration);
}

.music-item-button:hover {
    cursor: pointer;
    background-color: var(--hovered-background-color);
}
</style>
