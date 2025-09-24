import { defineStore } from "pinia";
import { computed, onMounted, ref } from "vue";
import { login, register, get, saveProfile } from "/src/api/User";
import { useTagSelector } from "/src/stores/TagSelector";
import { useToast } from "/src/stores/Toast";
import { usePlaylist } from "/src/stores/Playlist";

export const useUser = defineStore("User", () => {
    const tagStore = useTagSelector();
    const toastStore = useToast();
    const playlistStore = usePlaylist();

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
        if (!isLogged) {
            user.value = emptyUser();
            tagStore.selectTag("home");
            return;
        }
        const response = await get(user.value.id);
        user.value = emptyUser();
        if (!response.success) {
            toastStore.addMessage(response);
            console.error(response.message);
            tagStore.selectTag("home");
            return;
        }
        user.value = { ...user.value, ...response.data.user };
        console.log("已更新个人档案");
        // 更新用户的歌单列表
        playlistStore.updatePlaylistList();
    };

    // 注册、登录与退出登录
    const handleResponse = (response) => {
        toastStore.addMessage(response);
        if (!response.success) {
            console.error(response.message);
            return;
        }
        user.value.id = response.data.user.id;
        updateProfile();
    };
    const userRegister = async (nickname, password) => {
        handleResponse(await register(nickname, password));
    };
    const userLogin = async (nickname, password) => {
        handleResponse(await login(nickname, password));
    };
    const userLogout = () => {
        user.value = emptyUser();
        updateProfile();
    }

    // 保存档案
    const userSaveProfile = async (avatarFile = null) => {
        const response = await saveProfile(avatarFile, user.value);
        toastStore.addMessage(response);
        if (!response.success) {
            console.error(response.message);
        }
        updateProfile();
    }

    // 初始化
    onMounted(() => {
        updateProfile();
    });

    return {
        user,
        isLogged,
        userRegister,
        userLogin,
        userLogout,
        updateProfile,
        userSaveProfile
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
