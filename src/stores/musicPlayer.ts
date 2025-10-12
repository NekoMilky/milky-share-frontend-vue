import type { JSONObject, Song } from "@/types";

import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";

import { get } from "@/api/song";
import { checkEmptyField, isSuccessWithToast } from "@/utils";

import { useSong } from "@/stores/song";

export const useMusicPlayer = defineStore("musicPlayer", () => {
    const songStore = useSong();

    // 当前播放音乐
    const audio = ref<HTMLAudioElement | null>(null);
    const isAudioLoaded = ref<boolean>(false);
    const emptySong = (): Song => ({
        id: "",
        title: "未播放",
        artist: "",
        album: "",
        duration: 0,
        url: "",
        cover: null,
    });
    const playingSong = ref<Song>(emptySong());
    const clearSong = (): void => {
        // 移除dom
        if (audio.value) {
            audio.value.pause();
            audio.value.removeEventListener("timeupdate", updateProgress);
            audio.value.remove();
            audio.value = null;
        }
        isAudioLoaded.value = false;
        isPlaying.value = false;
        playingSong.value = emptySong();
        currentTime.value = 0;
        duration.value = 0;
        updateCoverAnimation();
    };
    const isLoading = ref<boolean>(false);
    const loadSong = async (
        songId: string, 
        autoPlay: boolean = true
    ): Promise<boolean> => {
        if (!checkEmptyField(songId, "歌曲id")) return false;
        isLoading.value = true;
        const response = await get(songId);
        clearSong();
        if (!isSuccessWithToast(response, true)) {
            isLoading.value = false;
            return false;
        }
        playingSong.value = { ...playingSong.value, ...response.data?.song as JSONObject };

        // 创建audio元素
        await createAudioElement(playingSong.value.url as string);

        // 自动播放
        if (autoPlay) togglePlay();
        isLoading.value = false;
        return true;
    };
    const createAudioElement = async (url: string): Promise<void> => {
        audio.value = new Audio(url);
        await new Promise<void>(resolve => {
            audio.value?.addEventListener("canplay", () => resolve());
        });
        audio.value.addEventListener("timeupdate", updateProgress);
        isAudioLoaded.value = true;
    }

    // 播放/暂停
    const isPlaying = ref<boolean>(false);
    const currentTime = ref<number>(0);
    const duration = ref<number>(0);
    const progress = computed<number>(() => duration.value > 0 ? currentTime.value / duration.value * 100 : 0);
    const togglePlay = (): void => {
        if (!isAudioLoaded.value || !audio.value) return;
        isPlaying.value = !isPlaying.value;
        if (isPlaying.value) {
            audio.value.play();
            updateCoverAnimation();
        }
        else {
            audio.value.pause();
        }
    };
    const updateProgress = (): void => {
        if (!isAudioLoaded.value || !audio.value) return;
        currentTime.value = audio.value.currentTime ?? 0;
        duration.value = audio.value.duration ?? 0;

        // 播放结束
        if (duration.value > 0 && currentTime.value >= duration.value - 0.1) switchPlay(false);
    };
    const setCurrentTime = (value: number): void => {
        if (!isAudioLoaded.value || !audio.value) return;
        if (value < 0 || value >= duration.value) return;
        audio.value.currentTime = value;
        updateProgress();
        if (!isPlaying.value) updateCoverAnimation();
    };

    // 音量调节
    const volume = ref<number>(1);
    const setVolume = (value: number): void => {
        if (!isAudioLoaded.value || !audio.value) return;
        if (value < 0 || value > 1) return;
        volume.value = value;
    };
    const isMuted = ref<boolean>(false);
    const toggleMute = (): void => {
        isMuted.value = !isMuted.value;
    };
    watch(() => [audio.value, volume.value, isMuted.value], () => {
        if (!audio.value) return;
        audio.value.volume = isMuted.value ? 0 : volume.value;
    }, { immediate: true });

    // 上一首/下一首
    const switchPlay = (isPrevious: boolean = false): void => {
        if (!isAudioLoaded.value) return;
        let index = songStore.songList.findIndex(song => playingSong.value.id === song.id);
        if (index === -1) return;
        const length = songStore.songList.length;
        index += (isPrevious ? -1 : 1);
        if (index < 0) index = length - 1;
        else if (index > length - 1) index = 0;
        const song = songStore.songList[index];
        if (song) loadSong(song.id);
    };

    // 封面旋转
    const coverRotation = ref<number>(0);
    let coverAnimationId: number | null = null;
    const updateCoverAnimation = (): void => {
        coverAnimationId = requestAnimationFrame(() => {
            if (!isAudioLoaded.value || !audio.value) {
                coverRotation.value = 0;
                return;
            }
            coverRotation.value = audio.value.currentTime * 18 % 360;
            if (isPlaying.value) updateCoverAnimation();
            else if (coverAnimationId) cancelAnimationFrame(coverAnimationId);
        });
    }

    // 初始化
    const init = async (): Promise<void> => {
        // 恢复播放进度
        if (playingSong.value.id) {
            const current = currentTime.value;
            if (await loadSong(playingSong.value.id, false) && audio.value) {
                audio.value.currentTime = current;
                updateProgress();
                updateCoverAnimation();
            }
        }
    };

    return {
        playingSong,
        isLoading,
        isAudioLoaded,
        isPlaying,
        currentTime,
        duration,
        progress,
        coverRotation,
        volume,
        isMuted,
        
        init,
        loadSong,
        clearSong,
        togglePlay,
        switchPlay,
        setCurrentTime,
        setVolume,
        toggleMute
    };
}, {
    // 只缓存当前歌曲、播放进度与音量
    persist: {
        key: "MusicPlayer",
        storage: localStorage,
        serializer: {
            serialize(value) {
                return JSON.stringify({
                    playingSong: value.playingSong,
                    currentTime: value.currentTime,
                    volume: value.volume,
                    isMuted: value.isMuted
                });
            },
            deserialize(value) {
                return JSON.parse(value);
            }
        }
    }
});
