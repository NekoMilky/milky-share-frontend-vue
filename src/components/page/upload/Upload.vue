<script setup>
import { ref } from "vue";
import { timeFormat } from "/src/utils/Utility";
import { useToast } from "/src/stores/Toast";
import { useUser } from "/src/stores/User";
import { useSongList } from "/src/stores/SongList";
import jsmediatags from "jsmediatags/dist/jsmediatags.min";

import defaultCoverImg from "/src/assets/images/default/cover.png";

const fileInput = ref(null);

const toastStore = useToast();
const userStore = useUser();
const songListStore = useSongList();

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
    updateSongInfo();
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
    isUploading.value = false;
}

// 处理文件上传
const isUploading = ref(false);
const uploadFile = async () => {
    if (!selectedFile.value || !userStore.isLogged) {
        return;
    }
    // 处理空值
    if (songInfo.value.title === "") {
        songInfo.value.title = "未知标题";
    }
    if (songInfo.value.artist === "") {
        songInfo.value.artist = "未知艺术家";
    }
    if (songInfo.value.album === "") {
        songInfo.value.album = "未知专辑";
    }
    // 开始上传
    isUploading.value = true;
    await songListStore.uploadSong(selectedFile.value, songInfo.value);
    // 上传结束
    clearSelectedFile();
};

// 显示信息
const emptySongInfo = () => ({
    title: "",
    artist: "",
    album: "",
    duration: 0,
    cover: null,
    coverDisplay: null
});
const songInfo = ref(emptySongInfo());
const updateSongInfo = () => {
    if (!selectedFile.value) {
        return;
    }
    songInfo.value = emptySongInfo();
    // 解析基础信息
    jsmediatags.read(selectedFile.value, {
        onSuccess: async (tag) => {
            const tags = tag.tags;
            songInfo.value = { ...songInfo.value, ...tags };
            const cover = tags.picture;
            if (cover) {
                songInfo.value.cover = await objectToFile(cover);
                songInfo.value.coverDisplay = objectToURI(cover);
            }
        },
        onError: (error) => {
            const message = "加载歌曲元数据时出错";
            toastStore.addMessage({ message: message, success: false });
            console.error(message, error);
        }
    });
    // 解析时长
    const fileUrl = URL.createObjectURL(selectedFile.value);
    const audioElement = document.createElement("audio");
    audioElement.src = fileUrl;
    audioElement.addEventListener("loadedmetadata", () => {
        songInfo.value.duration = audioElement.duration;
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
        const message = "无法将对象转为URI";
        toastStore.addMessage({ message: message, success: false });
        console.error(message, error);
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
        const message = "无法将对象转为File对象";
        toastStore.addMessage({ message: message, success: false });
        console.error(message, error);
        return null;
    }
};
</script>

<template>
    <div class="box song-upload-box">
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
        <div v-else-if="!isUploading" class="song-selected">
            <div class="song-info">
                <img class="song-cover" :src="songInfo.coverDisplay || defaultCoverImg" />
                <div class="info-items">
                    <div class="info">
                        <div class="info-text">标题</div>
                        <input 
                            v-model="songInfo.title" 
                            class="info-value info-input" 
                            type="text" 
                            placeholder="未知标题" 
                        />
                    </div>
                    <div class="info">
                        <div class="info-text">艺术家</div>
                        <input 
                            v-model="songInfo.artist" 
                            class="info-value info-input" 
                            type="text" 
                            placeholder="未知艺术家" 
                        />
                    </div>
                    <div class="info">
                        <div class="info-text">专辑</div>
                        <input 
                            v-model="songInfo.album" 
                            class="info-value info-input" 
                            type="text" 
                            placeholder="未知专辑" 
                        />
                    </div>
                    <div class="info">
                        <div class="info-text">时长</div>
                        <div class="info-value">{{ timeFormat(songInfo.duration) }}</div>
                    </div>
                </div>
            </div>
            <div class="button-list">
                <img class="button" src="/src/assets/images/buttons/return.png" @click="clearSelectedFile" />
                <img class="button" src="/src/assets/images/buttons/upload.png" @click="uploadFile" />
            </div>
        </div>
        <div v-else class="song-uploading">
            文件上传中，请稍候
        </div>
    </div>
</template>

<style scoped>
.song-upload-box {
    height: 50%;
    flex-direction: column;
}

.upload-area {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    border-radius: 1.5em;
    background-color: transparent;
    transition: var(--transition-duration);
}

.upload-area:hover {
    background-color: var(--hovered-background-color);
    cursor: pointer;
}

.song-selected {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
}

.song-uploading {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.song-info {
    width: 100%;
    height: 80%;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
}

.song-cover {
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
    height: 2em;
    margin: 0.2em;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
}

.info-text {
    width: 15%;
    height: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
}

.info-value {
    width: 75%;
    height: 100%;
    padding: 0 1em;
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    border-radius: 1em;
    background-color: transparent;
    transition: var(--transition-duration);
}

.info-value:not(.info-input:focus):hover {
    background-color: var(--hovered-background-color);
}

.info-input {
    border: none;
    outline: none;
    color: white;
    font-family: "Aa小迷糊少女";
    font-size: 1em;
}

.info-input:focus {
    background-color: var(--selected-background-color);
}

.info-input::placeholder {
    color: rgb(192, 192, 192);
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
