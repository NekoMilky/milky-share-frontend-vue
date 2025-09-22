<script setup>
import { useTagSelector } from "/src/stores/TagSelector";
import { useUser } from "/src/stores/User";

import defaultAvatarImg from "/src/assets/images/default/avatar.png";

const tagStore = useTagSelector();
const userStore = useUser();
</script>

<template>
    <div class="box tag-selector-box">
        <div class="row" @click="tagStore.selectTag('profile')" :class="{ 'row-selected': tagStore.isSelected('profile') }">
            <img 
                class="button avatar"
                :src="userStore.user.avatar || defaultAvatarImg"
            />
            <span v-if="userStore.isLogged">档案</span>
            <span v-else>未登录</span>
        </div>
        <div class="row" @click="tagStore.selectTag('home')" :class="{ 'row-selected': tagStore.isSelected('home') }">
            <img class="button" src="/src/assets/images/buttons/home-page.png" />
            <span>首页</span>
        </div>
        <div v-if="userStore.isLogged" class="row" @click="tagStore.selectTag('playlist')" :class="{ 'row-selected': tagStore.isSelected('playlist') }">
            <img class="button" src="/src/assets/images/buttons/playlist-page.png" />
            <span>歌单</span>
        </div>
        <div v-if="userStore.isLogged" class="row" @click="tagStore.selectTag('upload')" :class="{ 'row-selected': tagStore.isSelected('upload') }">
            <img class="button" src="/src/assets/images/buttons/upload-page.png" />
            <span>上传</span>
        </div>
    </div>
</template>

<style scoped>
.tag-selector-box {
    width: 25%;
    height: auto;
    padding: 5px 10px;
    flex-direction: column;
    transition: var(--transition-duration);
}

.tag-selector-box:hover {
    width: 50%;
}

.tag-selector-box .button {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%); 
    height: 75%;
    aspect-ratio: 1;
    transition: var(--transition-duration);
}

.tag-selector-box:hover .button {
    left: 15%;
    transform: translate(0, -50%);
}

.tag-selector-box span {
    position: absolute;
    top: 50%;
    right: 15%;
    transform: translate(0, -50%);
    opacity: 0;
    font-size: 0.1rem;
    transition: var(--transition-duration);
}

.tag-selector-box:hover span {
    opacity: 1;
    font-size: 1.2rem;
}

.avatar {
    border-radius: 50%;
}

.row {
    position: relative;
    width: 100%;
    height: 2rem;
    margin: 5px;
    padding: 10px;
    border-radius: 15px;
    box-sizing: border-box;
    color: white;
    background-color: transparent;
    transition: var(--transition-duration);
}

.row:not(.row-selected):hover {
    cursor: pointer;
    background-color: var(--hovered-background-color);
}

.row-selected {
    background-color: rgba(255, 255, 255, 0.2);
}
</style>
