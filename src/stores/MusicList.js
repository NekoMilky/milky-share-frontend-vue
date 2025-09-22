import { defineStore } from "pinia";
import { ref, onMounted } from "vue";
import { getMusicAll, getStaredMusicAll, starMusic } from "/src/api/Music";
import { useUser } from "/src/stores/User";
import { ws } from "/src/utils/WebSocket";

export const useMusicList = defineStore("MusicList", () => {
    const userStore = useUser();

    // 总列表
    const musicList = ref([]);
    const updateMusicList = async () => {
        const response = await getMusicAll();
        if (!response.success) {
            console.error(response.message);
            musicList.value = [];
            return;
        }
        musicList.value = response.data.songs;
    }
    ws.addEventListener("message", (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "music_uploaded") {
            updateMusicList();
        }
    });

    // 当前用户收藏列表
    const staredMusicList = ref([]);
    const updateStaredMusicList = async (userId) => {
        if (userId === "") {
            staredMusicList.value = [];
            return;
        }
        const response = await getStaredMusicAll(userId);
        if (!response.success) {
            console.error(response.message);
            staredMusicList.value = [];
            return;
        }
        staredMusicList.value = response.data.songs;
    };
    const star = async (songId) => {
        if (userStore.user.id === "") {
            return;
        }
        const response = await starMusic(userStore.user.id, songId);
        if (!response.success) {
            console.error(response.message);
            return;
        }
        updateStaredMusicList(userStore.user.id);
    }
    const isStared = (songId) => {
        return staredMusicList.value.some((song) => song.id === songId);
    };

    // 初始化
    onMounted(() => {
        updateMusicList();
    });

    return {
        musicList,
        staredMusicList,
        updateStaredMusicList,
        star,
        isStared
    };
});
