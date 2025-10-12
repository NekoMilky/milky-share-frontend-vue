<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed } from "vue";

import { timeFormat } from "@/utils";

import { useMusicPlayer } from "@/stores";

import DefaultCoverImage from "@/assets/images/default/cover.png";
import PauseCircleImage from "@/assets/images/icon-circle/pause.png";
import PlayCircleImage from "@/assets/images/icon-circle/play.png";
import VolumeHighImage from "@/assets/images/icon/volume-high.png";
import VolumeLowImage from "@/assets/images/icon/volume-low.png";
import VolumeMutedImage from "@/assets/images/icon/volume-muted.png";

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
const volumeContainer = ref<HTMLDivElement | null>(null);
const getVolumeContainerRect = (): DOMRect | null => {
    if (!volumeContainer.value) return null;
    return volumeContainer.value.getBoundingClientRect();
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
let isDraggingProgress: boolean = false;
const changeProgress = (event: MouseEvent): void => {
    if (!musicPlayerStore.isAudioLoaded) return;
    const containerRect = getProgressContainerRect();
    if (!containerRect) return;
    const offsetX = event.clientX - containerRect.left;
    const progress = Math.min(Math.max(0, offsetX / containerRect.width), 1);
    musicPlayerStore.setCurrentTime(progress * musicPlayerStore.duration);
};
const startDragProgress = (): void => {
    isDraggingProgress = true;
    window.addEventListener("mousemove", dragProgress);
    window.addEventListener("mouseup", stopDragProgress);
};
const stopDragProgress = (): void => {
    isDraggingProgress = false;
    window.removeEventListener("mousemove", dragProgress);
    window.removeEventListener("mouseup", stopDragProgress);
};
const dragProgress = (event: MouseEvent): void => {
    if (!isDraggingProgress) return;
    changeProgress(event);
};

// 点击轨道/拖拽音量条
const volumeDisplay = computed<number>(() => musicPlayerStore.isMuted ? 0 : musicPlayerStore.volume * 100);
let isDraggingVolume: boolean = false;
const changeVolume = (event: MouseEvent): void => {
    if (!musicPlayerStore.isAudioLoaded) return;
    const containerRect = getVolumeContainerRect();
    if (!containerRect) return;
    const offsetY = containerRect.bottom - event.clientY;
    const volume = Math.min(Math.max(0, offsetY / containerRect.height), 1);
    musicPlayerStore.setVolume(volume);
};
const startDragVolume = (): void => {
    isDraggingVolume = true;
    window.addEventListener("mousemove", dragVolume);
    window.addEventListener("mouseup", stopDragVolume);
};
const stopDragVolume = (): void => {
    isDraggingVolume = false;
    window.removeEventListener("mousemove", dragVolume);
    window.removeEventListener("mouseup", stopDragVolume);
};
const dragVolume = (event: MouseEvent): void => {
    if (!isDraggingVolume) return;
    changeVolume(event);
};

// 初始化
onMounted(() => {
    onUnmounted(() => {
        // 解除监听
        window.removeEventListener("mousemove", dragProgress);
        window.removeEventListener("mouseup", stopDragProgress);
        window.removeEventListener("mousemove", dragVolume);
        window.removeEventListener("mouseup", stopDragVolume);
    });
});
</script>

<template>
    <div class="container">
        <!--进度条-->
        <div class="progress-container" ref="progressContainer">
            <div class="progress-track" @click="changeProgress($event)"></div>
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
        <!--播放器主体-->
        <div class="main-body">
            <div class="cell cell-main-info">
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
            </div>
            <div class="cell cell-primary-button">
                <img 
                    class="button primary-button" 
                    src="@/assets/images/icon-circle/previous-song.png" 
                    @click="musicPlayerStore.switchPlay(true)"
                />
                <img 
                    class="button primary-button" 
                    :src="musicPlayerStore.isPlaying ? PauseCircleImage : PlayCircleImage" 
                    @click="musicPlayerStore.togglePlay()" 
                />
                <img 
                    class="button primary-button" 
                    src="@/assets/images/icon-circle/next-song.png" 
                    @click="musicPlayerStore.switchPlay(false)"
                />
            </div>
            <div class="cell cell-secondary-button">
                <div class="volume-control">
                    <img 
                        class="button secondary-button"
                        :src="
                            (musicPlayerStore.isMuted || musicPlayerStore.volume === 0) 
                            ? VolumeMutedImage 
                            : (musicPlayerStore.volume > 0.5 ? VolumeHighImage : VolumeLowImage)
                        "
                        @click="musicPlayerStore.toggleMute()"
                    />
                    <div class="volume-box primary-color">
                        <div class="volume-container" ref="volumeContainer">
                            <div class="volume-track" @click="changeVolume($event)"></div>
                            <div 
                                class="volume-bar" 
                                :style="{ height: `${volumeDisplay}%` }"
                                @click="changeVolume($event)"
                            ></div>
                            <div 
                                class="volume-thumb"
                                :style="{ bottom: `${volumeDisplay}%` }"
                                @mousedown="startDragVolume()"
                            ></div>
                        </div>
                        <div class="volume-value">{{ `${Math.round(volumeDisplay)}%` }}</div>
                    </div>
                </div>
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

    --track-border-radius: 10px;
    --bar-background-color: rgba(255, 255, 255, 0.4);
}

.main-body {
    position: relative;
    width: 100%;
    height: 100%;
}

.cell {
    position: absolute;
    top: 0;
    width: auto;
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.5em;
}

.cell-main-info {
    left: 0.5em;
}

.cell-primary-button {
    left: 50%;
    transform: translateX(-50%);
}

.cell-secondary-button {
    right: 0.5em;
}

.volume-control {
    position: relative;
    width: auto;
    height: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
}

.volume-box {
    visibility: hidden;
    position: absolute;
    left: 50%;
    bottom: 70%;
    width: 2.5em;
    height: 8em;
    transform: translateX(-50%);
    padding: 0.75em;
    border-radius: 0.5em;
    box-sizing: border-box;
    pointer-events: none;
    backdrop-filter: blur(5px);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25em;
}

.volume-control:hover .volume-box {
    visibility: visible;
    pointer-events: auto;
}

.volume-container {
    position: relative;
    width: 0.5em;
    flex: 1;
    min-height: 0;
}

.volume-track {
    position: absolute;
    left: 50%;
    bottom: 0;
    transform: translateX(-50%);
    width: 75%;
    height: 100%;
    background-color: var(--selected-background-color);
    border-radius: var(--track-border-radius);
    cursor: pointer;
}

.volume-bar {
    position: absolute;
    left: 50%;
    bottom: 0;
    transform: translateX(-50%);
    width: 75%;
    background-color: var(--bar-background-color);
    border-radius: var(--track-border-radius);
    cursor: pointer;
}

.volume-thumb {
    position: absolute;
    left: 0;
    transform: translateY(50%);
    width: 100%;
    aspect-ratio: 1;
    background-color: white;
    border-radius: 50%;
    cursor: pointer;
}

.volume-value {
    width: auto;
    height: auto;
    white-space: nowrap;
}

.music-cover {
    height: 90%;
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

.button {
    aspect-ratio: 1;
    filter: brightness(1);
}

.button:hover {
    cursor: pointer;
    filter: brightness(0.8);
}

.primary-button {
    height: 50%;
}

.secondary-button {
    height: 30%;
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
    border-radius: var(--track-border-radius);
    cursor: pointer;
}

.progress-bar {
    position: absolute;
    top: 50%;
    left: 0;
    transform: translateY(-50%);
    height: 75%;
    background-color: var(--bar-background-color);
    border-radius: var(--track-border-radius);
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
