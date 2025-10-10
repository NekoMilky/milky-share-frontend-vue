<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from "vue";

import { useRightClickMenu } from "@/stores";

const rightClickMenuStore = useRightClickMenu();

// 点击越界处理
const menuBox = ref<HTMLDivElement | null>(null);
const handleClickOutside = (event: MouseEvent): void => {
    if (
        menuBox.value 
        && rightClickMenuStore.isOpened 
        && !menuBox.value?.contains(event.target as Node)
    ) rightClickMenuStore.close();
};

// 菜单位置修正
const adjustMenuPos = async (): Promise<void> => {
    await nextTick(); 
    if (!menuBox.value) return;
    const { x, y } = rightClickMenuStore.pos;
    const menuWidth = menuBox.value.offsetWidth;
    const menuHeight = menuBox.value.offsetHeight;

    // 超出视口右侧
    if (x as number + menuWidth > window.innerWidth) {
        rightClickMenuStore.pos.x = x as number - menuWidth;
    }

    // 超出视口底部
    if (y as number + menuHeight > window.innerHeight) {
        rightClickMenuStore.pos.y = y as number - menuHeight;
    }
};
watch(() => [rightClickMenuStore.isOpened, rightClickMenuStore.pos], () => {
    if (rightClickMenuStore.isOpened) adjustMenuPos();
}, { immediate: true });

// 初始化
onMounted(() => {
    // 监听
    document.addEventListener("click", handleClickOutside);
    onUnmounted(() => {
        // 解除监听
        document.removeEventListener("click", handleClickOutside);
    });
});
</script>

<template>
    <div 
        class="menu-box" 
        ref="menuBox"
        v-if="rightClickMenuStore.isOpened"
        :style="{ left: `${rightClickMenuStore.pos.x}px`, top: `${rightClickMenuStore.pos.y}px` }"
    >
        <div 
            class="menu"
            v-for="(menu, index) in rightClickMenuStore.menus"
            :key="menu.key"
            :class="{ 'danger': menu.danger }"
            @click="rightClickMenuStore.onClick(index)"
        >
            <img class="menu-icon" :src="menu.iconSrc" />
            {{ menu.label }}
        </div>
    </div>
</template>

<style scoped>
.menu-box {
    position: fixed;
    width: auto;
    height: auto;
    display: inline-block;
    padding: 0.25em;
    box-sizing: border-box;
    font-family: "Aa小迷糊少女";
    color: white;
    background-color: rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(1px);
    border-radius: 0.5em;
    z-index: 500;
}

.menu {
    width: 100%;
    height: 2em;
    padding: 0.5em;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    white-space: nowrap;
    border-radius: 0.5em;
    box-sizing: border-box;
    background-color: transparent;
    transition: background-color var(--transition-duration);
    will-change: background-color;
}

.menu:hover {
    cursor: pointer;
    background-color: var(--hovered-background-color);
    transform: translateZ(0);
}

.menu-icon {
    height: 1em;
    aspect-ratio: 1;
    margin-right: 0.5em;
}

.danger {
    color: var(--danger-color);
}
</style>
