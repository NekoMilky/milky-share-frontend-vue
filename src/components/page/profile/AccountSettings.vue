<script setup lang="ts">
import { useUser } from "@/stores";

const userStore = useUser();
</script>

<template>
    <div class="container">
        <div class="button danger" @click="userStore.userLogout()">退出登录</div>
    </div>
</template>

<style scoped>
.container {
    padding: 0.5em;
}

.button {
    padding: 0.5em;
    box-sizing: border-box;
    border-radius: 1em;
    background-color: transparent;
    transition: background-color var(--transition-duration);
    will-change: background-color;
}

.button:hover {
    cursor: pointer;
    background-color: var(--hovered-background-color);
    transform: translateZ(0);
}

.danger {
    color: var(--danger-color);
}
</style>
