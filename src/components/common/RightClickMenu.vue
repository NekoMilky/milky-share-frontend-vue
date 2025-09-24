<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useRightClickMenu } from "/src/stores/RightClickMenu";

const rightClickMenuStore = useRightClickMenu();

// 点击越界处理
const menuBox = ref(null);
const handleClickOutside = (event) => {
    if (menuBox.value && rightClickMenuStore.isOpened && !menuBox.value.contains(event.target)) {
        rightClickMenuStore.close();
    }
};

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
    <Teleport to="body">
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
                @click="rightClickMenuStore.click(index)"
            >
                <img class="menu-icon" :src="menu.iconSrc" />
                {{ menu.label }}
            </div>
        </div>
    </Teleport>
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
    font-size: 1.2rem;
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
    border-radius: 0.5em;
    box-sizing: border-box;
    background-color: transparent;
    transition: var(--transition-duration);
}

.menu:hover {
    cursor: pointer;
    background-color: var(--hovered-background-color);
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
