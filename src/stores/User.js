import { defineStore } from "pinia";
import { computed, onMounted, ref } from "vue";
import { userLogin, userRegister, getUser, saveUserProfile } from "/src/api/User";
import { useMusicList } from "/src/stores/MusicList";
import { ws } from "/src/utils/WebSocket";

export const useUser = defineStore("User", () => {
    const musicListStore = useMusicList();

    // 当前登录用户
    const emptyUser = () => ({
        id: "",
        nickname: "",
        avatar: null
    });
    const user = ref(emptyUser());
    const isLogged = computed(() => {
        return user.value.id !== "";
    });
    const updateProfile = async () => {
        if (user.value.id === "") {
            user.value = emptyUser();
            return;
        }
        const response = await getUser(user.value.id);
        user.value = emptyUser();
        if (!response.success) {
            console.error(response.message);
            return;
        }
        user.value = { ...user.value, ...response.data.user };
        // 加载歌单
        musicListStore.updateStaredMusicList(user.value.id);
    };
    ws.addEventListener("message", (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "profile_updated" && data.id === user.value.id) {
            updateProfile();
        }
    });

    // 注册、登录与退出登录
    const register = async (nickname, password) => {
        const response = await userRegister(nickname, password);
        if (!response.success) {
            console.error(response.message);
            return response;
        }
        user.value.id = response.data.user.id;
        updateProfile();
        return response;
    };
    const login = async (nickname, password) => {
        const response = await userLogin(nickname, password);
        if (!response.success) {
            console.error(response.message);
            return response;
        }
        user.value.id = response.data.user.id;
        updateProfile();
        return response;
    };
    const logout = () => {
        user.value = emptyUser();
        musicListStore.updateStaredMusicList("");
    }

    // 保存档案
    const saveProfile = async (avatarFile = null) => {
        const response = await saveUserProfile(avatarFile, user.value);
        if (!response.success) {
            console.error(response.message);
        }
        return response;
    }

    // 初始化
    onMounted(() => {
        updateProfile();
    });

    return {
        user,
        isLogged,
        register,
        login,
        logout,
        updateProfile,
        saveProfile
    };
}, {
    // 只缓存当前用户
    persist: {
        key: "User",
        storage: localStorage,
        serializer: {
            serialize(value) {
                return JSON.stringify({
                    user: value.user
                });
            },
            deserialize(value) {
                return JSON.parse(value);
            }
        }
    }
});
