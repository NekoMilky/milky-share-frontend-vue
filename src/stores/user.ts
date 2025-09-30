import { defineStore } from "pinia";
import { computed, onMounted, ref } from "vue";
import type { ApiResponse, JSONObject, User } from "@/types";
import { isSuccessWithToast, checkEmptyField, hasObjectChanges } from "@/utils";
import { login, register, get, saveProfile } from "@/api/user";
import { useDialog } from "./dialog";
import { usePlaylist } from "./playlist";

export const useUser = defineStore("user", () => {
    const dialogStore = useDialog();
    const playlistStore = usePlaylist();

    // 当前登录用户
    const emptyUser = (): User => ({
        id: "",
        nickname: "",
        avatar: null
    });
    const user = ref<User>(emptyUser());
    const userOrigin = ref<JSONObject>({});
    const isLogged = computed<boolean>(() => {
        return user.value.id ? true : false;
    });
    const updateProfile = async (): Promise<void> => {
        if (!isLogged.value) {
            user.value = emptyUser();
            return;
        }
        const response = await get(user.value.id);
        user.value = emptyUser();
        if (!isSuccessWithToast(response, true)) {
            return;
        }
        user.value = response.data?.user as User;
        userOrigin.value = { nickname: user.value.nickname };
        console.log("已更新个人档案");
        // 更新歌单列表
        playlistStore.updatePlaylistList("default");
    };

    // 注册、登录与退出登录
    const handleResponse = (response: ApiResponse): void => {
        if (!isSuccessWithToast(response)) {
            return;
        }
        user.value.id = (response.data?.user as User).id;
        updateProfile();
    };
    const userRegister = async (nickname: string, password: string): Promise<void> => {
        handleResponse(await register(nickname, password));
    };
    const userLogin = async (nickname: string, password: string): Promise<void> => {
        handleResponse(await login(nickname, password));
    };
    const userLogout = (): void => {
        dialogStore.loadDialog([
            { key: "title", type: "text", text: "退出登录确认" }
        ], confirmUserLogout);
    };
    const confirmUserLogout = (): void => {
        user.value = emptyUser();
        updateProfile();
    };

    // 保存档案，包含状态锁
    const isSavingProfile = ref<boolean>(false);
    const userSaveProfile = async (avatarFile: File | null = null): Promise<void> => {
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
