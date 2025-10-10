<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from "vue";

import { timeFormat } from "@/utils";

import { useMusicPlayer } from "@/stores";

import DefaultCoverImage from "@/assets/images/default/cover.png";
import PauseCircleImage from "@/assets/images/icon-circle/pause.png";
import PlayCircleImage from "@/assets/images/icon-circle/play.png";

const musicPlayerStore = useMusicPlayer();

const progressContainer = ref<HTMLDivElement | null>(null);
const getProgressContainerRect = (): DOMRect | null => {
    if (!progressContainer.value) return null;
    return progressContainer.value.getBoundingClientRect();
};
const progressTime = ref<HTMLDivElement | null>(null);
const getProgressTimeRect = (): DOMRect | null => {
    if (!progressTime.value) return null;
    return progressTime.value.getBoundingClientRect();
};

// 播放时间盒子位置
const progressTimePositionLeft = ref<number>(0);
watch(() => musicPlayerStore.progress, () => {
    const containerRect = getProgressContainerRect();
    const timeRect = getProgressTimeRect();
    if (!containerRect || !timeRect) return;
    const totalPercent = timeRect.width * 100 / containerRect.width;
    progressTimePositionLeft.value = Math.min(Math.max(0, musicPlayerStore.progress - totalPercent / 2), 100 - totalPercent);
}, { immediate: true });

// 点击轨道/拖拽进度条
const isDraggingProgress = ref<boolean>(false);
const changeProgress = (event: MouseEvent): void => {
    if (!musicPlayerStore.isAudioLoaded) return;
    const containerRect = getProgressContainerRect();
    if (!containerRect) return;
    const offsetX = event.clientX - containerRect.left;
    const progress = Math.min(Math.max(0, offsetX / containerRect.width), 1);
    musicPlayerStore.setCurrentTime(progress * musicPlayerStore.duration);
};
const startDragProgress = (): void => {
    isDraggingProgress.value = true;
    window.addEventListener("mousemove", dragProgress);
    window.addEventListener("mouseup", stopDragProgress);
};
const stopDragProgress = (): void => {
    isDraggingProgress.value = false;
    window.removeEventListener("mousemove", dragProgress);
    window.removeEventListener("mouseup", stopDragProgress);
};
const dragProgress = (event: MouseEvent): void => {
    if (!isDraggingProgress.value) return;
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
        <div class="main-body">
            <img 
                class="music-cover" 
                :src="musicPlayerStore.playingSong.cover as string ?? DefaultCoverImage" 
                :style="{ rotate: `${musicPlayerStore.coverRotation}deg` }"
            />
            <div class="music-info">
                <template v-if="musicPlayerStore.isLoading">音乐加载中</template>
                <template v-else>
                    {{ musicPlayerStore.playingSong.title }}
                    <div class="small-font">{{ musicPlayerStore.playingSong.artist }}</div>
                </template>
            </div>
            <div class="button-list">
                <img 
                    class="button" 
                    src="@/assets/images/icon-circle/previous-song.png" 
                    @click="musicPlayerStore.switchPlay(true)"
                />
                <img 
                    class="button" 
                    :src="musicPlayerStore.isPlaying ? PauseCircleImage : PlayCircleImage" 
                    @click="musicPlayerStore.togglePlay()" 
                />
                <img 
                    class="button" 
                    src="@/assets/images/icon-circle/next-song.png" 
                    @click="musicPlayerStore.switchPlay(false)"
                />
            </div>
        </div>
        <!--进度条-->
        <div class="progress-container" ref="progressContainer">
            <div class="progress-track" @click="changeProgress"></div>
            <div
                class="progress-bar" 
                :style="{ width: `${musicPlayerStore.progress}%` }" 
                @click="changeProgress($event)"
            ></div>
            <div
                class="progress-thumb"
                :style="{ left: `${musicPlayerStore.progress}%` }"
                @mousedown="startDragProgress()"
            ></div>
            <div 
                class="progress-time primary-color"
                :style="{ left: `${progressTimePositionLeft}%` }"
                ref="progressTime"
                @mousedown="startDragProgress()"
            >
                {{ `${timeFormat(musicPlayerStore.currentTime)} / ${timeFormat(musicPlayerStore.duration)}` }}
            </div>
        </div>
    </div>
</template>

<style scoped>
.container {
    position: relative;
    padding: 0.5em;
    border-radius: 0;
    backdrop-filter: blur(3px);

    --progress-track-border-radius: 10px;
}

.main-body {
    width: 100%;
    min-height: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1em;
}

.music-cover {
    max-width: 20%;
    max-height: 90%;
    aspect-ratio: 1;
    border-radius: 50%;
}

.music-info {
    height: 100%;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: left;
    font-size: 1.2em;
}

.small-font {
    font-size: 0.8em;
}

.button-list {
    width: auto;
    max-width: 30%;
    height: 40%;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5em;
}

.button {
    height: 100%;
    aspect-ratio: 1;
    filter: brightness(1);
    transform: var(--transition-duration);
}

.button:hover {
    cursor: pointer;
    filter: brightness(0.8);
}

.progress-container {
    position: absolute;
    left: 0;
    top: -0.25em;
    width: 100%;
    height: 0.5em;
}

.progress-container:hover {
    top: -0.375em;
    height: 0.75em;
}

.progress-track {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 100%;
    height: 75%;
    background-color: var(--selected-background-color);
    border-radius: var(--progress-track-border-radius);
    cursor: pointer;
}

.progress-bar {
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    height: 75%;
    background-color: rgba(255, 255, 255, 0.4);
    border-radius: var(--progress-track-border-radius);
    cursor: pointer;
}

.progress-thumb {
    position: absolute;
    top: 0;
    height: 100%;
    transform: translateX(-50%);
    aspect-ratio: 1;
    border-radius: 50%;
    background-color: white;
    cursor: pointer;
}

.progress-time {
    visibility: hidden;
    position: absolute;
    bottom: 100%;
    width: auto;
    height: auto;
    padding: 0.5em;
    border-radius: 0.5em;
    box-sizing: border-box;
    white-space: nowrap;
    pointer-events: none;
    backdrop-filter: blur(5px);
}

.progress-container:hover .progress-time {
    visibility: visible;
    pointer-events: auto;
    cursor: pointer;
}
</style>
