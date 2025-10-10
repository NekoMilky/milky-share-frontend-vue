<script setup lang="ts">
import { useCustomToast } from "@/stores";

import CancelImage from "@/assets/images/buttons/cancel.png";
import ConfirmImage from "@/assets/images/buttons/confirm.png";

const customToastStore = useCustomToast();
</script>

<template>
    <div class="toast-box">
        <div 
            class="toast-item"
            v-for="toast in customToastStore.toasts"
            :key="toast.id"
            :class="{ 'issue': !toast.success, 'success': toast.success }"
            :style="{ opacity: toast.opacity }"
        >
            <img class="toast-icon" :src="toast.success ? ConfirmImage : CancelImage" />
            {{ toast.message }}
        </div>
    </div>
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
    transition: opacity var(--transition-duration);
    will-change: opacity;
}

.issue {
    background-color: var(--error-color);
}

.success {
    background-color: var(--success-color);
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
