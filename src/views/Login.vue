<script setup lang="ts">
import CustomBackground from "@/components/common/CustomBackground.vue";
import TabSelector from "@/components/common/TabSelector.vue";
import Login from "@/components/page/login/Login.vue";
import Register from "@/components/page/login/Register.vue";

import BackgroundImage from "@/assets/images/background.png";
</script>

<template>
    <div class="page">
        <CustomBackground :backgroundSrc="BackgroundImage" />
        <div class="subpage">
            <TabSelector
                style="height: auto;"
                class="secondary-color"
                :tabs="[
                    { id: 'login', label: '登录' },
                    { id: 'register', label: '注册' }
                ]"
            >
                <template #login>
                    <Login />
                </template>
                <template #register>
                    <Register />
                </template>
            </TabSelector>
        </div>
    </div>
</template>

<style scoped>
.page {
    height: 100%;
}

.subpage {
    width: min(512px, 100%);
    height: 100%;
}

:deep(.container) {
    justify-content: center;
    gap: 0.5em;
}

:deep(.welcome) {
    font-size: 1.2em; 
}

:deep(.input) {
    width: 90%;
}

:deep(.button) {
    width: 90%;
    padding: 0.5em;
    box-sizing: border-box;
    border-radius: 1em;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    background-color: white;
    transition: background-color var(--transition-duration);
    will-change: background-color;
    color: black;
}

:deep(.button:hover) {
    cursor: pointer;
    background-color: rgba(255, 255, 255, 0.8);
    transform: translateZ(0);
}

:deep(.danger) {
    color: var(--danger-color);
    font-size: 0.8em;
}
</style>
