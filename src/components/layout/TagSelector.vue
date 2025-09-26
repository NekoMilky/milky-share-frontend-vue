<script setup>
import { useTagSelector } from "/src/stores/TagSelector";
import { useUser } from "/src/stores/User";

import defaultAvatarImg from "/src/assets/images/default/avatar.png";

const tagStore = useTagSelector();
const userStore = useUser();
</script>

<template>
    <div class="container">
        <div class="row" @click="tagStore.selectTag('profile')" :class="{ 'row-selected': tagStore.isSelected('profile') }">
            <img 
                class="button avatar"
                :src="userStore.user.avatar || defaultAvatarImg"
            />
            <span v-if="userStore.isLogged">档案</span>
            <span v-else>未登录</span>
        </div>
        <div class="row" @click="tagStore.selectTag('home')" :class="{ 'row-selected': tagStore.isSelected('home') }">
            <img class="button" src="/src/assets/images/buttons/home.png" />
            <span>首页</span>
        </div>
        <div v-if="userStore.isLogged" class="row" @click="tagStore.selectTag('playlist')" :class="{ 'row-selected': tagStore.isSelected('playlist') }">
            <img class="button" src="/src/assets/images/buttons/playlist.png" />
            <span>歌单</span>
        </div>
        <div v-if="userStore.isLogged" class="row" @click="tagStore.selectTag('upload')" :class="{ 'row-selected': tagStore.isSelected('upload') }">
            <img class="button" src="/src/assets/images/buttons/upload.png" />
            <span>上传</span>
        </div>
    </div>
</template>

<style scoped>
.container {
    width: 25%;
    height: auto;
    transition: var(--transition-duration);
}

.container:hover {
    width: 50%;
}

.container .button {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%); 
    height: 60%;
    aspect-ratio: 1;
    transition: var(--transition-duration);
}

.container:hover .button {
    left: 15%;
    transform: translate(0, -50%);
}

.container span {
    position: absolute;
    top: 50%;
    right: 15%;
    transform: translate(0, -50%);
    opacity: 0;
    font-size: 0.1em;
    transition: var(--transition-duration);
}

.container:hover span {
    opacity: 1;
    font-size: 1em;
}

.avatar {
    border-radius: 50%;
}

.row {
    position: relative;
    width: 100%;
    height: 2em;
    margin: 0.25em;
    border-radius: 1.5em;
    background-color: transparent;
    transition: var(--transition-duration);
}

.row:not(.row-selected):hover {
    cursor: pointer;
    background-color: var(--hovered-background-color);
}

.row-selected {
    background-color: var(--selected-background-color);
}
</style>
