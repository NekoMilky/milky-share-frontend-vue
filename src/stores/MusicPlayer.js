import { defineStore } from "pinia";
import { ref, computed, onMounted } from "vue";
import { get } from "/src/api/Song";
import { useSongList } from "/src/stores/SongList";
import { checkEmptyField } from "/src/utils/Utility";
import { isSuccessWithToast } from "/src/utils/Utility";

export const useMusicPlayer = defineStore("MusicPlayer", () => {
    const songListStore = useSongList();

    // 当前播放音乐
    const audio = ref(null);
    const isAudioLoaded = ref(false);
    const emptySong = () => ({
        id: "",
        title: "未播放",
        artist: "",
        album: "",
        url: "",
        cover: null,
    });
    const playingSong = ref(emptySong());
    const clearSong = () => {
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
    };
    const isLoading = ref(false);
    const loadSong = async (songId, autoPlay = true) => {
        if (!checkEmptyField(songId, "歌曲id")) {
            return false;
        }
        isLoading.value = true;
        const response = await get(songId);
        clearSong();
        if (!isSuccessWithToast(response, true)) {
            isLoading.value = false;
            return false;
        }
        playingSong.value = { ...playingSong.value, ...response.data.song };
        // 创建audio元素
        await createAudioElement(playingSong.value.url);
        // 自动播放
        if (autoPlay) {
            togglePlay();
        }
        isLoading.value = false;
        return true;
    };
    const createAudioElement = async (url) => {
        audio.value = new Audio(url);
        await new Promise((resolve) => {
            audio.value.addEventListener("canplay", () => {
                resolve();
            });
        });
        audio.value.addEventListener("timeupdate", updateProgress);
        isAudioLoaded.value = true;
    }

    // 播放/暂停
    const isPlaying = ref(false);
    const currentTime = ref(0);
    const duration = ref(0);
    const progress = computed(() => {
        return duration.value > 0 ? currentTime.value / duration.value * 100 : 0;
    });
    const togglePlay = () => {
        if (!isAudioLoaded.value) {
            return;
        }
        isPlaying.value = !isPlaying.value;
        if (isPlaying.value) {
            audio.value.play();
            updateCoverAnimation();
        }
        else {
            audio.value.pause();
        }
    };
    const updateProgress = () => {
        if (!isAudioLoaded.value) {
            return;
        }
        currentTime.value = audio.value.currentTime;
        duration.value = audio.value.duration;
        // 播放结束
        if (duration.value > 0 && currentTime.value >= duration.value - 0.1) {
            switchPlay(false);
        }
    };
    const setCurrentTime = (value) => {
        if (isAudioLoaded.value && value >= 0 && value < duration.value) {
            audio.value.currentTime = value;
            updateProgress();
            if (!isPlaying.value) {
                updateCoverAnimation();
            }
        }
    };

    // 上一首/下一首
    const switchPlay = (isPrevious = false) => {
        if (!isAudioLoaded.value) {
            return;
        }
        let index = songListStore.songList.findIndex((song) => playingSong.value.id === song.id);
        if (index === -1) {
            return;
        }
        const length = songListStore.songList.length;
        index += (isPrevious ? -1 : 1);
        if (index < 0) {
            index = length - 1;
        }
        else if (index > length - 1) {
            index = 0;
        }
        loadSong(songListStore.songList[index].id);
    };

    // 封面旋转
    const coverRotation = ref(0);
    let coverAnimationId = null;
    const updateCoverAnimation = () => {
        coverAnimationId = requestAnimationFrame(() => {
            if (!isAudioLoaded.value) {
                coverRotation.value = 0;
                return;
            }
            coverRotation.value = audio.value.currentTime * 18 % 360;
            if (isPlaying.value) {
                updateCoverAnimation();
            }
            else {
                cancelAnimationFrame(coverAnimationId);
            }
        });
    }

    // 初始化
    onMounted(async () => {
        // 恢复播放进度
        if (playingSong.value.id !== "") {
            const current = currentTime.value;
            if (await loadSong(playingSong.value.id, false)) {
                audio.value.currentTime = current;
                updateProgress();
                updateCoverAnimation();
            }
        }
    });

    return {
        playingSong,
        isLoading,
        isAudioLoaded,
        isPlaying,
        currentTime,
        duration,
        progress,
        coverRotation,
        loadSong,
        clearSong,
        togglePlay,
        switchPlay,
        setCurrentTime
    };
}, {
    // 只缓存当前歌曲和播放进度
    persist: {
        key: "MusicPlayer",
        storage: localStorage,
        serializer: {
            serialize(value) {
                return JSON.stringify({
                    playingSong: value.playingSong,
                    currentTime: value.currentTime,
                });
            },
            deserialize(value) {
                return JSON.parse(value);
            }
        }
    }
});
