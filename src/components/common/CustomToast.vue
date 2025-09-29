<script setup lang="ts">
import { useToast } from "@/stores/toast";

import confirmImg from "@/assets/images/buttons/confirm.png";
import cancelImg from "@/assets/images/buttons/cancel.png";

const toastStore = useToast();
</script>

<template>
    <Teleport to="body">
        <div class="toast-box">
            <div 
                class="toast-item"
                v-for="toast in toastStore.messages"
                :key="toast.id"
                :class="{ 'issue': !toast.success }"
                :style="{ opacity: toast.opacity.toString() }"
            >
                <img class="toast-icon" :src="toast.success ? confirmImg : cancelImg" />
                {{ toast.message }}
            </div>
        </div>
    </Teleport>
</template>

<style scoped>
.toast-box {
    position: fixed;
    left: 50%;
    top: 5%;
    width: auto;
    height: auto;
    transform: translateX(-50%);
    max-height: 90%;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    font-family: "Aa小迷糊少女";
    font-size: 1.2rem;
    color: white;
    z-index: 2000;
}

.toast-item {
    position: relative;
    width: auto;
    height: 2em;
    margin: 0.25em;
    padding: 0.5em 1em 0.5em 2.5em;
    border-radius: 1em;
    box-sizing: border-box;
    background-color: var(--success-color);
    transition: var(--transition-duration);
}

.issue {
    background-color: var(--error-color);
}

.toast-icon {
    position: absolute;
    height: 1em;
    aspect-ratio: 1;
    left: 1em;
    top: 50%;
    transform: translateY(-50%);
}
</style>
