<script setup>
import { ref } from "vue";
import { timeFormat } from "/src/utils/Utility";
import { uploadMusic } from "/src/api/Music";
import jsmediatags from "jsmediatags/dist/jsmediatags.min";

import defaultCoverImg from "/src/assets/images/default/cover.png";

const fileInput = ref(null);

// 处理文件选择
const selectedFile = ref(null);
const selectFiles = (files) => {
    if (!files || !files.length) {
        return;
    }
    const audioFiles = Array.from(files).filter((file) => file.type.startsWith("audio/"));
    if (audioFiles.length === 0) {
        return;
    }
    selectedFile.value = audioFiles[0];
    updateMusicInfo();
};
const onDrop = (event) => {
    event.preventDefault();
    selectFiles(event.dataTransfer.files);
};
const onDragOver = (event) => {
    event.preventDefault();
};
const clearSelectedFile = () => {
    selectedFile.value = null;
    uploadStatus.value = 0;
}

// 处理文件上传
const uploadStatus = ref(0);
const response = ref({});
const uploadFile = async () => {
    if (!selectedFile.value) {
        return;
    }
    // 处理空值
    if (musicInfo.value.title === "") {
        musicInfo.value.title = "未知标题";
    }
    if (musicInfo.value.artist === "") {
        musicInfo.value.artist = "未知艺术家";
    }
    if (musicInfo.value.album === "") {
        musicInfo.value.album = "未知专辑";
    }
    // 开始上传
    uploadStatus.value = 1;
    response.value = await uploadMusic(selectedFile.value, musicInfo.value);
    if (!response.value.success) {
        console.error(response.value.message);
    }
    // 上传结束
    uploadStatus.value = 2;
};
const isStatus = (state) => {
    return uploadStatus.value === state;
}

// 显示信息
const emptyMusicInfo = () => ({
    title: "",
    artist: "",
    album: "",
    duration: 0,
    cover: null,
    coverDisplay: null
});
const musicInfo = ref(emptyMusicInfo());
const updateMusicInfo = () => {
    if (!selectedFile.value) {
        return;
    }
    musicInfo.value = emptyMusicInfo();
    // 解析基础信息
    jsmediatags.read(selectedFile.value, {
        onSuccess: async (tag) => {
            const tags = tag.tags;
            musicInfo.value = { ...musicInfo.value, ...tags };
            const cover = tags.picture;
            if (cover) {
                musicInfo.value.cover = await objectToFile(cover);
                musicInfo.value.coverDisplay = objectToURI(cover);
            }
        },
        onError: (error) => {
            console.error("加载歌曲元数据时出错：", error);
        }
    });
    // 解析时长
    const fileUrl = URL.createObjectURL(selectedFile.value);
    const audioElement = document.createElement("audio");
    audioElement.src = fileUrl;
    audioElement.addEventListener("loadedmetadata", () => {
        musicInfo.value.duration = audioElement.duration;
        URL.revokeObjectURL(fileUrl);
    });
}
const objectToURI = (object) => {
    try {
        const byteArray = new Uint8Array(object.data);
        let binary = "";
        for (let i = 0; i < byteArray.byteLength; i++) {
            binary += String.fromCharCode(byteArray[i]);
        }
        const base64 = window.btoa(binary);
        return `data:${object.format};base64,${base64}`;
    }
    catch (error) {
        console.error("无法将对象转为URI：", error);
        return null;
    }
};
const objectToFile = async (object, maxSize = 256) => {
    try {
        // 读取为blob
        const format = object.format;
        const byteArray = new Uint8Array(object.data);
        const blob = new Blob([byteArray], { type: format });
        // 转为image
        const imgUrl = URL.createObjectURL(blob);
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
        console.error("无法将对象转为File对象：", error);
        return null;
    }
};
</script>

<template>
    <div class="box music-upload-box">
        <div 
            v-if="!selectedFile" 
            class="upload-area" 
            @drop="onDrop" 
            @dragover="onDragOver" 
            @click="fileInput.click"
        >
            <input 
                type="file" 
                ref="fileInput" 
                accept="audio/*" 
                style="display: none;"
                @change="selectFiles($event.target.files)" 
            />
            点击选择音频文件，或拖拽文件到这里
        </div>
        <div v-else-if="isStatus(0)" class="music-selected">
            <div class="music-info">
                <img class="music-cover" :src="musicInfo.coverDisplay || defaultCoverImg" />
                <div class="info-items">
                    <div class="info">
                        <div class="info-text">标题</div>
                        <input v-model="musicInfo.title" class="info-input" type="text" placeholder="未知标题" />
                    </div>
                    <div class="info">
                        <div class="info-text">艺术家</div>
                        <input v-model="musicInfo.artist" class="info-input" type="text" placeholder="未知艺术家" />
                    </div>
                    <div class="info">
                        <div class="info-text">专辑</div>
                        <input v-model="musicInfo.album" class="info-input" type="text" placeholder="未知专辑" />
                    </div>
                    <div class="info">
                        <div class="info-text">时长</div>
                        <div class="info-input">{{ timeFormat(musicInfo.duration) }}</div>
                    </div>
                </div>
            </div>
            <div class="button-list">
                <img class="button" src="/src/assets/images/buttons/return.png" @click="clearSelectedFile" />
                <img class="button" src="/src/assets/images/buttons/upload-page.png" @click="uploadFile" />
            </div>
        </div>
        <div v-else-if="isStatus(1)" class="music-uploading">
            文件上传中，请稍候
        </div>
        <div v-else class="music-uploaded">
            <div class="response" :class="{ 'response-error': !response.success }">{{ response.message }}</div>
            <div class="button-list">
                <img class="button" src="/src/assets/images/buttons/return.png" @click="clearSelectedFile" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.music-upload-box {
    height: 50%;
    flex-direction: column;

    --progress-track-border-radius: 10px;
}

.upload-area {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    border-radius: 15px;
    background-color: transparent;
    transition: var(--transition-duration);
}

.upload-area:hover {
    background-color: var(--hovered-background-color);
    cursor: pointer;
}

.music-selected {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
}

.music-uploading {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.music-uploaded {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.music-info {
    width: 100%;
    height: 80%;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
}

.music-cover {
    width: 15%;
    aspect-ratio: 1;
    border-radius: 50%;
}

.info-items {
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

.response {
    width: 100%;
    height: 75%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.response-error {
    color: var(--error-color);
}

.button-list {
    width: 50%;
    height: 15%;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
}

.button {
    height: 1.2em;
    aspect-ratio: 1;
    padding: 0.5em;
    border-radius: 1em;
    background-color: transparent;
    transition: var(--transition-duration);
}

.button:hover {
    cursor: pointer;
    background-color: var(--hovered-background-color);
}
</style>
