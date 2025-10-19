<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch, nextTick } from "vue";

import { timeFormat } from "@/utils";

import { useMusicPlayer } from "@/stores";

import CustomBackground from "@/components/common/CustomBackground.vue";

import BackgroundImage from "@/assets/images/background.png";
import DefaultCoverImage from "@/assets/images/default/cover.png";

const musicPlayerStore = useMusicPlayer();

const lyricsContainer = ref<HTMLDivElement | null>(null);

// 跳转进度
const toProgress = (time: number): void => {
    isUserScrolling.value = false;
    musicPlayerStore.setCurrentTime(time);
    if (!musicPlayerStore.isPlaying) musicPlayerStore.togglePlay();
};

// 滚动到当前歌词
const currentLyricIndex = computed<number>(() => {
    const lyrics = musicPlayerStore.playingSong.lyrics;
    if (!lyrics) return -1;
    const index = [...lyrics].reverse().findIndex(lyric => musicPlayerStore.currentTime >= lyric.start);
    return index === -1 ? -1 : lyrics.length - 1 - index;
});
const scrollToCurrentLyric = () => {
    if (!lyricsContainer.value || isUserScrolling.value) return;
    
    // 获取当前歌词dom
    const currentElement = lyricsContainer.value.children[currentLyricIndex.value] as HTMLDivElement;
    if (!currentElement) return;
    
    // 滚动到使当前歌词垂直居中
    const containerOffset = lyricsContainer.value.offsetTop;
    const containerHeight = lyricsContainer.value.clientHeight;
    const elementOffset = currentElement.offsetTop;
    const elementHeight = currentElement.offsetHeight;
    const scrollTop = elementOffset - containerOffset - (containerHeight - elementHeight) / 2;

    lyricsContainer.value.removeEventListener("scroll", handleUserScroll);
    lyricsContainer.value.scrollTo({top: scrollTop, behavior: "smooth"});
    setTimeout(() => lyricsContainer.value?.addEventListener("scroll", handleUserScroll), 500);
};
watch(() => currentLyricIndex.value, (newIndex, oldIndex) => {
    if (newIndex !== oldIndex && newIndex !== -1) nextTick(() => scrollToCurrentLyric());
});

// 处理用户滚动
const isUserScrolling = ref(false);
const userScrollTimer = ref<NodeJS.Timeout>();
const handleUserScroll = () => {
    if (!isUserScrolling.value) isUserScrolling.value = true;
    if (userScrollTimer.value) clearTimeout(userScrollTimer.value);
    userScrollTimer.value = setTimeout(() => isUserScrolling.value = false, 10000);
};
watch(() => musicPlayerStore.playingSong, () => {
    isUserScrolling.value = false;
    if (userScrollTimer.value) clearTimeout(userScrollTimer.value);
}, { deep: true });

// 初始化
onMounted(() => {
    // 监听
    if (lyricsContainer.value) lyricsContainer.value.addEventListener("scroll", handleUserScroll);
    onUnmounted(() => {
        // 解除监听
        if (lyricsContainer.value) lyricsContainer.value.removeEventListener("scroll", handleUserScroll);
        // 清除计时器
        if (userScrollTimer.value) clearTimeout(userScrollTimer.value);
    });
});
</script>

<template>
    <div class="page">
        <CustomBackground :backgroundSrc="BackgroundImage" />
        <div class="subpage primary-color">
            <div class="song-info">
                <img 
                    class="song-cover"
                    :src="musicPlayerStore.playingSong.cover as string ?? DefaultCoverImage" 
                />
                <template v-if="musicPlayerStore.isLoading">
                    <div class="song-title">音乐加载中</div>
                </template>
                <template v-else>
                    <div class="song-title">{{ musicPlayerStore.playingSong.title }}</div>
                    <div class="song-artist">{{ musicPlayerStore.playingSong.artist }}</div>
                </template>
                <div class="song-progress">
                    {{ `${timeFormat(musicPlayerStore.currentTime)} / ${timeFormat(musicPlayerStore.duration)}` }}
                </div>
            </div>
            <div 
                v-if="
                    musicPlayerStore.playingSong.lyrics 
                    && musicPlayerStore.playingSong.lyrics.length > 0
                "
                class="lyrics-container scrollbar-column" 
                ref="lyricsContainer"
            >
                <div 
                    class="lyric"
                    v-for="(lyric, index) in musicPlayerStore.playingSong.lyrics"
                    :key="index"
                    :class="{ 'playing-lyric': currentLyricIndex === index }"
                >
                    <div class="lyric-time">
                        <img 
                            class="play-button"
                            src="@/assets/images/icon-circle/play.png"
                            @click="toProgress(lyric.start)"
                        />
                        {{ timeFormat(lyric.start) }}
                    </div>
                    {{ lyric.text }}
                </div>
            </div>
            <div v-else class="lyrics-container lyric-empty">纯音乐，请欣赏</div>
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
    align-items: center;
    gap: 3em;
}

.song-info {
    width: auto;
    height: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.5em;
    box-sizing: border-box;
    gap: 0.5em;
}

.song-cover {
    width: 8em;
    aspect-ratio: 1;
    border-radius: 50%;
}

.song-title {
    font-size: 1.2em;
}

.song-progress {
    margin-top: 1em;
}

.lyrics-container {
    flex: 1;
    max-width: 50%;
    max-height: 75%;
    overflow: hidden auto;
    display: flex;
    flex-direction: column;
    gap: 2.4em;
}

.lyric-empty {
    justify-content: center;
    align-items: center;
}

.lyric {
    font-size: 1.2em;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    gap: 2em;
    color: rgba(255, 255, 255, 0.8);
}

.playing-lyric {
    font-size: 1.4em;
    font-weight: bold;
    color: white;
}

.lyric-time {
    opacity: 0;
    transition: opacity var(--transition-duration);
    will-change: opacity;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.25em;
}

.lyrics-container:hover .lyric-time {
    opacity: 1;
    transform: translateZ(0);
}

.play-button {
    height: 1em;
    aspect-ratio: 1;
    cursor: pointer;
}
</style>
