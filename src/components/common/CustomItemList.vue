<script setup lang="ts">
import type { CustomItemListColumn, RightClickMenu } from "@/types";

import { ref, watch, onMounted, onUnmounted, nextTick, computed } from "vue";

import { useRightClickMenu } from "@/stores";

const rightClickMenuStore = useRightClickMenu();

const props = withDefaults(defineProps<{
    columns: Array<CustomItemListColumn>,
    list?: Array<unknown>,
    rightClickMenu?: (item: unknown) => Array<RightClickMenu>,
    sort?: (sortBy: string, isDesc: boolean) => (
        (itemA: unknown, itemB: unknown) => number
    ),
    isSelected?: (item: unknown) => boolean
}>(), {
    list: () => [],
    rightClickMenu: (item: unknown) => [],
    sort: (sortBy: string, isDesc: boolean) => (
        (itemA: unknown, itemB: unknown) => 0
    ),
    isSelected: (item: unknown) => false
});

const listHeader = ref<HTMLDivElement | null>(null);
const getListHeaderWidth = (): number => {
    if (!listHeader.value) return 0;
    return parseFloat(getComputedStyle(listHeader.value).width);
};

// 列宽调整
const columns = ref<Array<CustomItemListColumn>>([]);
watch(() => props.columns, columnList => {
    columns.value = columnList;
}, { immediate: true });
const isResizable = (index: number, direction: "left" | "right"): boolean => {
    if (index === -1) return false;

    // 本身不可调整
    if (!columns.value[index]?.widthAdjustable) return false;

    // 左边界
    if (
        direction === "left" 
        && (index === 0 || !columns.value[index - 1]?.widthAdjustable)
    ) return false;

    // 右边界
    if (
        direction === "right" 
        && (index === columns.value.length - 1 || !columns.value[index + 1]?.widthAdjustable)
    ) return false;

    return true;
};
let currentColumn: CustomItemListColumn | undefined = void 0;
let neighborColumn: CustomItemListColumn | undefined = void 0;
let isDragging: boolean = false;
let startX: number = 0;
let startCurrentWidth: number = 0;
let startTotalWidth: number = 0;
let startDirection: "left" | "right" = "left";
const startDrag = (event: MouseEvent, index: number, direction: "left" | "right"): void => {
    if (!isResizable(index, direction)) return;

    // 记录要调整列宽的两个列
    currentColumn = columns.value[index];
    neighborColumn = columns.value[index + (direction === "left" ? -1 : 1)];

    // 记录初始状态
    startX = event.clientX;
    startCurrentWidth = (currentColumn as CustomItemListColumn).width;
    startTotalWidth = startCurrentWidth + (neighborColumn as CustomItemListColumn).width;
    startDirection = direction;

    // 开始拖拽
    isDragging = true;
    window.addEventListener("mousemove", doDrag);
    window.addEventListener("mouseup", stopDrag);
};
const doDrag = (event: MouseEvent) => {
    if (!isDragging) return;

    const offsetX = event.clientX - startX;
    const headerWidth = getListHeaderWidth();

    // 计算滑动占比
    const ratio = offsetX * 100 / headerWidth * (startDirection === "left" ? -1 : 1);
    
    // 计算新列宽
    (currentColumn as CustomItemListColumn).width = Math.min(Math.max(startCurrentWidth + ratio, 0), startTotalWidth);
    const startNeighborWidth = startTotalWidth - startCurrentWidth;
    (neighborColumn as CustomItemListColumn).width = Math.min(Math.max(startNeighborWidth - ratio, 0), startTotalWidth);
};
const stopDrag = () => {
    isDragging = false;
    window.removeEventListener("mousemove", doDrag);
    window.removeEventListener("mouseup", stopDrag);
};

// 列表项排序
const sortBy = ref<string>("none");
const sortDesc = ref<boolean>(false);
const switchSortBy = (key: string): void => {
    if (sortBy.value === "none" || sortBy.value !== key) {
        sortBy.value = key;
        sortDesc.value = false;
        return;
    }
    else if (sortDesc.value) {
        sortBy.value = "none";
        sortDesc.value = false;
    }
    else {
        sortDesc.value = true;
    }
};
const finalList = computed<Array<unknown>>(() => {
    if (sortBy.value === "none") return props.list;
    return [...props.list].sort(props.sort(sortBy.value, sortDesc.value));
});

// 进入列表项
const hoveredIndex = ref<number>(-1);
const hoverIndex = (index: number): void => {
    hoveredIndex.value = index;
};
const quitIndex = (index: number): void => {
    if (hoveredIndex.value === index) hoveredIndex.value = -1;
};

// 右键菜单
const openRightClickMenu = (event: MouseEvent, item: unknown): void => {
    const menus = props.rightClickMenu(item);
    if (menus.length === 0) return;
    rightClickMenuStore.loadMenu(event, menus);
};

// 列表表头滚动条修正
const listItems = ref<HTMLDivElement | null>(null);
const hasScrollbar = ref<boolean>(false);
const checkScrollbar = (): void => {
    hasScrollbar.value = false;
    if (!listItems.value) return;
    hasScrollbar.value = listItems.value.scrollHeight > listItems.value.clientHeight;
};
watch(() => finalList.value, async () => {
    await nextTick();
    checkScrollbar();
}, { immediate: true });

// 初始化
onMounted(() => {
    onUnmounted(() => {
        // 解除监听
        window.removeEventListener("mousemove", doDrag);
        window.removeEventListener("mouseup", stopDrag);
    });
});
</script>

<template>
    <div class="container">
        <div 
            class="list-header" 
            ref="listHeader" 
            :style="{ paddingRight: hasScrollbar ? 'var(--scrollbar-width)' : '0' }"
        >
            <div 
                class="column"
                v-for="(column, index) in columns"
                :key="column.key"
                :class="{ 'column-sortable': column.sortable }"
                :style="{ width: `${column.width}%`, justifyContent: column.itemAlign }"
                @click="column.sortable && switchSortBy(column.key)"
            >
                {{ column.label }}
                <img 
                    class="sort-icon" 
                    v-show="sortBy === column.key" 
                    src="@/assets/images/buttons/arrow.png" 
                    :style="{ rotate: `${sortDesc ? 90 : -90}deg` }"
                />
                <div 
                    class="resize-width-handler"
                    v-show="isResizable(index, 'left')" 
                    style="left: 0;"
                    @mousedown.stop="startDrag($event, index, 'left')"
                    @click.stop=""
                ></div>
                <div 
                    class="resize-width-handler"
                    v-show="isResizable(index, 'right')" 
                    style="right: 0;"
                    @mousedown.stop="startDrag($event, index, 'right')"
                    @click.stop=""
                ></div>
            </div>
        </div>
        <div class="list-items scrollbar-column" ref="listItems">
            <div 
                class="list-item"
                v-for="(item, index) in finalList"
                :key="index"
                :class="{ 'list-item-selected': props.isSelected(item) }"
                @mouseenter="hoverIndex(index)"
                @mouseleave="quitIndex(index)"
                @contextmenu.prevent="openRightClickMenu($event, item)"
            >
                <div 
                    class="column"
                    v-for="column in columns"
                    :key="column.key"
                    :style="{ width: `${column.width}%`, justifyContent: column.itemAlign }"
                >
                    <slot :name="column.key" :item="item" :index="index" :hoveredIndex="hoveredIndex"></slot>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.container {
    padding: 0.5em;
    gap: 0.5em;
}

.list-header {
    width: 100%;
    height: auto;
    display: flex;
    flex-direction: row;
    font-weight: bold;
}

.column {
    height: auto;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0.5em;
    border-radius: 0.5em;
    box-sizing: border-box;
    background-color: transparent;
    transition: background-color var(--transition-duration);
    will-change: background-color;
}

.column-sortable:hover {
    cursor: pointer;
    background-color: var(--hovered-background-color);
    transform: translateZ(0);
}

.sort-icon {
    height: 1em;
    aspect-ratio: 1;
}

.resize-width-handler {
    position: absolute;
    top: 0;
    width: 0.25em;
    height: 100%;
    cursor: e-resize;
}

.list-items {
    width: 100%;
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden auto;
}

.list-item {
    width: 100%;
    height: auto;
    display: flex;
    flex-direction: row;
    background-color: transparent;
    border-radius: 0.5em;
    transition: background-color var(--transition-duration);
    will-change: background-color;
}

.list-item:hover {
    background-color: var(--hovered-background-color);
    transform: translateZ(0);
}

.list-item-selected {
    font-weight: bold;
}
</style>
