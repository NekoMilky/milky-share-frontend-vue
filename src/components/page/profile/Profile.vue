<script setup>
import { ref } from "vue";
import { checkEmptyField } from "/src/utils/Utility";
import { compressImage } from "/src/utils/Convert";
import { useUser } from "/src/stores/User";

import defaultAvatarImg from "/src/assets/images/default/avatar.png";

const userStore = useUser();

// 处理头像选择
const avatarInput = ref(null);
const selectFiles = async (files) => {
    if (!checkEmptyField(files, "头像文件")) {
        return;
    }
    const imageFiles = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length === 0) {
        return;
    }
    userStore.userSaveProfile(await compressImage(imageFiles[0]));
};
</script>

<template>
    <div class="container">
        <div class="profile">
            <img 
                class="avatar" 
                :src="userStore.user.avatar || defaultAvatarImg" 
                @click="avatarInput.click"
            />
            <input 
                type="file" 
                ref="avatarInput" 
                accept="image/*" 
                style="display: none;"
                @change="selectFiles($event.target.files)" 
            />
            <div class="info-list">
                <div class="info">
                    <div class="info-text">昵称</div>
                    <input 
                        v-model="userStore.user.nickname" 
                        class="input-frame" 
                        type="text" 
                        placeholder="请输入昵称"
                        v-on:blur="userStore.userSaveProfile(null)" 
                    />
                </div>
            </div>
        </div>
        <div class="button-list">
            <div class="button danger" @click="userStore.userLogout">退出登录</div>
        </div>
    </div>
</template>

<style scoped>
.profile {
    width: 100%;
    height: 75%;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
}

.button-list {
    width: 50%;
    height: 15%;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
}

.avatar {
    width: 15%;
    aspect-ratio: 1;
    border-radius: 50%;
    filter: brightness(1);
    transform: var(--transition-duration);
}

.avatar:hover {
    cursor: pointer;
    filter: brightness(0.8);
}

.info-list {
    width: 65%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.info {
    width: 100%;
    margin: 0.2em;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
}

.info-text {
    width: 15%;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
}

.input-frame {
    width: 75%;
}

.button {
    padding: 0.5em;
    box-sizing: border-box;
    background-color: transparent;
    border-radius: 1em;
    transition: var(--transition-duration);
}

.button:hover {
    cursor: pointer;
    background-color: var(--hovered-background-color);
}

.danger {
    color: var(--danger-color);
}
</style>
