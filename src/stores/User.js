import { defineStore } from "pinia";
import { computed, onMounted, ref } from "vue";
import { isSuccessWithToast, checkEmptyField, hasObjectChanges } from "/src/utils/Utility";
import { login, register, get, saveProfile } from "/src/api/User";
import { useTagSelector } from "/src/stores/TagSelector";
import { useDialog } from "/src/stores/Dialog";
import { usePlaylist } from "/src/stores/Playlist";

export const useUser = defineStore("User", () => {
    const tagStore = useTagSelector();
    const dialogStore = useDialog();
    const playlistStore = usePlaylist();

    // 当前登录用户
    const emptyUser = () => ({
        id: "",
        nickname: "",
        avatar: null
    });
    const user = ref(emptyUser());
    const userOrigin = ref({});
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
        if (!isSuccessWithToast(response, true)) {
            tagStore.selectTag("home");
            return;
        }
        user.value = response.data.user;
        userOrigin.value = { nickname: user.value.nickname };
        console.log("已更新个人档案");
        // 更新歌单列表
        playlistStore.updatePlaylistList();
    };

    // 注册、登录与退出登录
    const handleResponse = (response) => {
        if (!isSuccessWithToast(response)) {
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
        dialogStore.loadDialog([
            { key: "title", type: "text", text: "退出登录确认" }
        ], confirmUserLogout);
    };
    const confirmUserLogout = () => {
        user.value = emptyUser();
        tagStore.selectTag("home");
    };

    // 保存档案，包含状态锁
    const isSavingProfile = ref(false);
    const userSaveProfile = async (avatarFile = null) => {
        if (isSavingProfile.value) {
            return;
        }
        if (!checkEmptyField(user.value.id, "用户id")) {
            return;
        }
        if (!avatarFile && !hasObjectChanges(userOrigin.value, user.value)) {
            return;
        }
        // 开始保存
        isSavingProfile.value = true;
        const response = await saveProfile(avatarFile, user.value);
        isSavingProfile.value = false;
        isSuccessWithToast(response);
        updateProfile();
    };

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
