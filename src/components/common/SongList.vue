<script setup>
import { ref, nextTick, watch, onMounted, computed, onUnmounted } from "vue";
import { timeFormat } from "/src/utils/Utility";
import { get } from "/src/api/Song";
import { useRightClickMenu } from "/src/stores/RightClickMenu";
import { useUser } from "/src/stores/User";
import { useMusicPlayer } from "/src/stores/MusicPlayer";
import { useSongList } from "/src/stores/SongList";

import defaultCoverImg from "/src/assets/images/default/cover.png";
import deleteImg from "/src/assets/images/buttons/delete.png";
import playImg from "/src/assets/images/buttons/play.png";
import pauseImg from "/src/assets/images/buttons/pause.png";
import downloadImg from "/src/assets/images/buttons/download.png";
import likeImg from "/src/assets/images/buttons/like.png";
import hasLikedImg from "/src/assets/images/buttons/has-liked.png";
import playCircleImg from "/src/assets/images/buttons-circle/play.png";
import pauseCircleImg from "/src/assets/images/buttons-circle/pause.png";

const rightClickMenuStore = useRightClickMenu();
const userStore = useUser();
const musicPlayerStore = useMusicPlayer();
const songListStore = useSongList();

const songListHeader = ref(null);
const getSongListHeaderWidth = () => {
    if (!songListHeader.value) {
        return 0;
    }
    return parseFloat(getComputedStyle(songListHeader.value).width);
};

const props = defineProps({
    columns: {
        type: Array,
        default: [
            { key: "index", label: "#", sortable: false, width: 10 },
            { key: "title", label: "标题", sortable: true, width: 45 },
            { key: "album", label: "专辑", sortable: true, width: 20 },
            { key: "duration", label: "时长", sortable: true, width: 15 },
            { key: "like", label: "喜欢", sortable: false, width: 10 }
        ]
    },
    list: {
        type: Function,
        default: () => {
            return useSongList().songList;
        }
    }
});

// 音乐列表
const songList = computed(() => props.list());

// 列配置
const columnWidths = ref({});
const initColumns = () => {
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
    const delta = (event.clientX - startX.value) / getSongListHeaderWidth() * 100;
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

// 右键菜单
const handleRightMenu = (event, song) => {
    let menu = [];
    // 播放/暂停
    const isPlayingThis = song.id === musicPlayerStore.playingSong.id;
    const isPlaying = musicPlayerStore.isPlaying;
    const shouldShowPause = isPlayingThis && isPlaying;
    menu.push({ 
        key: "togglePlay", 
        label: shouldShowPause ? "暂停" : "播放",
        iconSrc: shouldShowPause ? pauseImg : playImg,
        onClick: () => (isPlayingThis ? musicPlayerStore.togglePlay() : musicPlayerStore.loadSong(song.id))
    });
    // 下载
    menu.push({
        key: "download",
        label: "下载",
        iconSrc: downloadImg,
        onClick: () => songDownload(song.id)
    });
    // 如果是上传者，可以删除歌曲
    if (userStore.isLogged && song.uploader === userStore.user.id) {
        menu.push({ 
            key: "deleteSong", 
            label: "删除歌曲", 
            iconSrc: deleteImg, 
            onClick: () => songListStore.removeSong(song.id, song.title), 
            danger: true 
        });
    }
    rightClickMenuStore.loadMenu(event, menu);
};

// 音乐列表搜索与排序
const searchQuery = ref("");
const sortBy = ref("none");
const sortDesc = ref(false);
const finalSongList = computed(() => {
    let result = songList.value;
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
        result = sortSongList(result);
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
const sortSongList = (list) => {
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
const songListItems = ref(null);
const hasScrollbar = ref(false);
const checkScrollbar = () => {
    hasScrollbar.value = false;
    if (songListItems.value) {
        hasScrollbar.value = songListItems.value.scrollHeight > songListItems.value.clientHeight;
    }
};
watch(() => finalSongList.value, async () => {
    await nextTick();
    checkScrollbar();
});

// 下载音乐
const songDownload = async (songId) => {
    const response = await get(songId);
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
    initColumns();
    checkScrollbar();
    onUnmounted(() => {
        // 解除监听
        window.removeEventListener("mousemove", dragColumn);
        window.removeEventListener("mouseup", stopDragColumn);
    });
});
</script>

<template>
    <div class="box song-list-box">
        <!--搜索音乐-->
        <input v-model="searchQuery" class="search-bar" type="text" placeholder="搜索标题、艺术家或专辑" />
        <!--音乐列表-->
        <div class="song-list">
            <!--表头-->
            <div class="song-list-header" ref="songListHeader" :style="{ paddingRight: hasScrollbar ? 'var(--scrollbar-width)' : '0' }">
                <div 
                    class="column"
                    v-for="column in columns" 
                    :key="column.key"
                    :class="[`column-${column.key}`, { 'column-sortable': column.sortable }]"
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
            <div class="song-list-items scrollbar-column" ref="songListItems">
                <div class="song-list-empty" v-if="finalSongList.length === 0">
                    这里空空如也
                </div>
                <div 
                    v-else
                    v-for="(song, index) in finalSongList" 
                    class="song-item"
                    :class="{ 'playing-now': song.id === musicPlayerStore.playingSong.id }"
                    :key="index"
                    @mouseenter="handleMouseEnter(index)"
                    @mouseleave="handleMouseLeave(index)"
                    @contextmenu.prevent="handleRightMenu($event, song)"
                >
                    <div 
                        class="column"
                        v-for="column in columns" 
                        :key="column.key"
                        :class="[`column-${column.key}`]"
                        :style="{ width: `${columnWidths[column.key]}%` }"
                    >
                        <template v-if="column.key === 'index'">
                            <img 
                                v-if="song.id === musicPlayerStore.playingSong.id"
                                class="song-item-button" 
                                :src="musicPlayerStore.isPlaying ? pauseCircleImg : playCircleImg" 
                                @click="musicPlayerStore.togglePlay"
                            />
                            <img 
                                v-else-if="mouseHoverIndex === index"
                                class="song-item-button" 
                                src="/src/assets/images/buttons-circle/play.png" 
                                @click="musicPlayerStore.loadSong(song.id)" 
                            />
                            <span v-else>{{ index + 1 }}</span>
                        </template>
                        <template v-if="column.key === 'title'">
                            <img class="song-item-cover" :src="song.cover || defaultCoverImg" />
                            <div class="song-item-info">
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
                        <template v-if="column.key === 'like'">
                            <img 
                                class="song-item-button"
                                :src="likeImg"
                            />
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.song-list-box {
    height: 75%;
    flex-direction: column;
}

.search-bar {
    height: 8%;
}

.song-list {
    width: 90%;
    height: 90%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
}

.song-list-header {
    height: 10%;
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    font-size: 1.2em;
    font-weight: bold;
    align-items: center;
}

.song-list-items {
    height: 85%;
    box-sizing: border-box;
    overflow-x: hidden;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
}

.song-list-empty {
    height: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
}

.song-item {
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    align-items: center;
    border-radius: 1em;
    background-color: transparent;
    transition: background-color var(--transition-duration);
}

.song-item:hover {
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

.song-list-header .column {
    position: relative;
    transition: background-color var(--transition-duration);
}

.song-list-header .column:hover {
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

.song-item-cover {
    height: 2.4em;
    aspect-ratio: 1;
    margin-right: 0.5em;
}

.song-item-button {
    height: 1.2em;
    aspect-ratio: 1;
    padding: 0.5em;
    border-radius: 1em;
    background-color: transparent;
    transition: var(--transition-duration);
}

.song-item-button:hover {
    cursor: pointer;
    background-color: var(--hovered-background-color);
}
</style>
