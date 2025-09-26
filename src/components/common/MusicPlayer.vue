<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { timeFormat } from "/src/utils/Utility";
import { useMusicPlayer } from "/src/stores/MusicPlayer";

import defaultCoverImg from "/src/assets/images/default/cover.png";
import playCircleImg from "/src/assets/images/buttons-circle/play.png";
import pauseCircleImg from "/src/assets/images/buttons-circle/pause.png";

const musicPlayerStore = useMusicPlayer();

const progressThumb = ref(null);
const getProgressThumbWidth = () => {
    if (!progressThumb.value) {
        return 0;
    }
    return parseFloat(getComputedStyle(progressThumb.value).width);
};
const progressContainer = ref(null);
const getProgressContainerBox = () => {
    if (!progressContainer.value) {
        return null;
    }
    return progressContainer.value.getBoundingClientRect();
};

// 点击轨道/拖拽进度条
const isDraggingProgress = ref(false);
const changeProgress = (event) => {
    if (!musicPlayerStore.isAudioLoaded) {
        return;
    }
    const containerBox = getProgressContainerBox()
    const offsetX = event.clientX + getProgressThumbWidth() / 2 - containerBox.left;
    const progress = Math.min(Math.max(0, offsetX / containerBox.width), 1);
    musicPlayerStore.setCurrentTime(progress * musicPlayerStore.duration);
};
const startDragProgress = () => {
    isDraggingProgress.value = true;
    window.addEventListener("mousemove", dragProgress);
    window.addEventListener("mouseup", stopDragProgress);
};
const stopDragProgress = () => {
    isDraggingProgress.value = false;
    window.removeEventListener("mousemove", dragProgress);
    window.removeEventListener("mouseup", stopDragProgress);
};
const dragProgress = (event) => {
    if (!isDraggingProgress.value) {
        return;
    }
    changeProgress(event);
};

// 初始化
onMounted(() => {
    onUnmounted(() => {
        // 解除监听
        window.removeEventListener("mousemove", dragProgress);
        window.removeEventListener("mouseup", stopDragProgress);
    });
});
</script>

<template>
    <div class="container">
        <!--播放器主体-->
        <div class="basic">
            <div class="column column-music-cover">
                <img 
                    class="music-cover" 
                    :src="musicPlayerStore.playingSong.cover || defaultCoverImg" 
                    :style="{ rotate: `${musicPlayerStore.coverRotation}deg` }"
                />
            </div>
            <div class="column column-music-info">
                <div class="music-info">
                    <template v-if="musicPlayerStore.isLoading">
                        音乐加载中
                    </template>
                    <template v-else>
                        {{ musicPlayerStore.playingSong.title }}
                        <div class="small-font">{{ musicPlayerStore.playingSong.artist }}</div>
                    </template>
                </div>
            </div>
            <div class="column column-control">
                <img 
                    class="control-button" 
                    src="/src/assets/images/buttons-circle/previous-song.png" 
                    @click="musicPlayerStore.switchPlay(true)"
                />
                <img 
                    class="control-button" 
                    :src="musicPlayerStore.isPlaying ? pauseCircleImg : playCircleImg" 
                    @click="musicPlayerStore.togglePlay" 
                />
                <img 
                    class="control-button" 
                    src="/src/assets/images/buttons-circle/next-song.png" 
                    @click="musicPlayerStore.switchPlay(false)"
                />
            </div>
        </div>
        <!--进度条-->
        <div class="progress">
            <div class="column column-time-display">{{ timeFormat(musicPlayerStore.currentTime) }} / {{ timeFormat(musicPlayerStore.duration) }}</div>
            <div class="column column-progress-container" ref="progressContainer">
                <div class="progress-track" @click="changeProgress"></div>
                <div 
                    class="progress-bar" 
                    :style="{ width: `${musicPlayerStore.progress}%` }" 
                    @click="changeProgress"
                ></div>
                <div 
                    class="progress-thumb" 
                    :style="{ left: `calc(${musicPlayerStore.progress}% - ${getProgressThumbWidth() / 2}px)` }"
                    @mousedown="startDragProgress"
                    ref="progressThumb"
                ></div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.container {
    --progress-track-border-radius: 10px;
}

.basic {
    width: 100%;
    height: 75%;
    display: flex;
    flex-direction: row;
}

.progress {
    width: 90%;
    height: 15%;
    display: flex;
    flex-direction: row;
    align-items: center;
}

.column {
    display: flex;
    flex-direction: row;
    align-items: center;
}

.column-control {
    width: 30%;
    justify-content: space-around;
    align-items: center;
}

.column-music-info {
    width: 50%;
    color: white;
    font-size: 1.2em;
    justify-content: flex-start;
}

.column-music-cover {
    width: 20%;
    justify-content: center;
}

.column-progress-container {
    width: 85%;
    height: 50%;
    position: relative;
}

.column-time-display {
    width: 15%;
    color: white;
    font-size: 1rem;
}

.music-info {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: left;
}

.music-cover {
    height: 100%;
    aspect-ratio: 1;
    border-radius: 50%;
}

.small-font {
    font-size: 0.8em;
}

.control-button {
    height: 40%;
    aspect-ratio: 1;
    filter: brightness(1);
    transform: var(--transition-duration);
}

.control-button:hover {
    cursor: pointer;
    filter: brightness(0.8);
}

.progress-track {
    width: 100%;
    height: 100%;
    background-color: var(--selected-background-color);
    border-radius: var(--progress-track-border-radius);
    cursor: pointer;
}

.progress-bar {
    position: absolute;
    top: 0;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.4);
    border-radius: var(--progress-track-border-radius);
    cursor: pointer;
}

.progress-thumb {
    position: absolute;
    top: 0;
    height: 100%;
    aspect-ratio: 1;
    border-radius: 50%;
    background-color: white;
    cursor: pointer;
}
</style>
