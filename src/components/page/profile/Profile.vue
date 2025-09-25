<script setup>
import { ref } from "vue";
import { isSuccessWithToast, checkEmptyField } from "/src/utils/Utility";
import { useUser } from "/src/stores/User";

import defaultAvatarImg from "/src/assets/images/default/avatar.png";

const userStore = useUser();

const avatarInput = ref(null);

// 处理头像选择
const selectedFile = ref(null);
const selectFiles = async (files) => {
    if (!checkEmptyField(files, "头像文件")) {
        return;
    }
    const imageFiles = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (imageFiles.length === 0) {
        return;
    }
    selectedFile.value = await fileToFile(imageFiles[0]);
    userStore.user.avatar = URL.createObjectURL(selectedFile.value);
};
const fileToFile = async (file, maxSize = 256) => {
    try {
        // 读取格式
        const format = file.type || "image/jpeg";
        // 转为image
        const imgUrl = URL.createObjectURL(file);
        const img = await new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = reject;
            image.src = imgUrl;
        });
        // 用canvas压缩
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        let { width, height } = img;
        const scale = Math.min(maxSize / width, maxSize / height);
        if (scale < 1) {
            width = Math.round(width * scale);
            height = Math.round(height * scale);
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        // 转为blob
        const blobCompressed = await new Promise((resolve) =>
            canvas.toBlob(resolve, format, 0.5)
        );
        const filePostfix = format.split("/")[1] || "jpeg";
        return new File([blobCompressed], `file.${filePostfix}`, { type: format });
    }
    catch (error) {
        isSuccessWithToast({ message: "无法将File对象转为File对象", success: false });
        return null;
    }
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
                    <input v-model="userStore.user.nickname" class="info-input" type="text" placeholder="请输入昵称" />
                </div>
            </div>
        </div>
        <div class="button-list">
            <div class="button" @click="userStore.userSaveProfile(selectedFile)">保存</div>
            <div class="button danger" @click="userStore.userLogout">退出登录</div>
        </div>
    </div>
</template>

<style scoped>
.container {
    flex-direction: column;
}

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

.info-input {
    width: 75%;
    padding: 0.5em 1em;
    border: none;
    outline: none;
    border-radius: 1em;
    background-color: transparent;
    color: white;
    font-family: "Aa小迷糊少女";
    font-size: 1em;
    transition: var(--transition-duration);
}

.info-input:hover, .info-input.focus {
    background-color: var(--hovered-background-color);
}

.info-input::placeholder {
    color: rgb(192, 192, 192);
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
