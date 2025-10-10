<script setup lang="ts">
import { ref } from "vue";

interface Tab {
    id: string,
    label: string
};

const props = withDefaults(defineProps<{
    tabs: Array<Tab>
}>(), {
    tabs: () => []
});

// 已选择的标签
const selectedTab = ref<Tab | undefined>(props.tabs?.[0]);
const selectTab = (tab: Tab) => {
    selectedTab.value = tab;
};
</script>

<template>
    <div class="container">
        <div class="tab-header">
            <div 
                class="tab-label"
                v-for="tab in props.tabs"
                :key="tab.id"
                :class="{ 'label-selected': selectedTab?.id === tab.id }"
                @click="selectTab(tab)"
            >
                {{ tab.label }}
            </div>
        </div>
        <div class="component-slot">
            <template v-for="tab in props.tabs" :key="tab.id">
                <div class="component-container" v-show="selectedTab?.id === tab.id">
                    <slot :name="tab.id"></slot>
                </div>
            </template>
        </div>
    </div>
</template>

<style scoped>
.container {
    padding: 1em;
    gap: 0.5em;
}

.tab-header {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    gap: 0.5em;
}

.tab-label {
    flex: 1;
    min-width: 0;
    height: auto;
    border-radius: 1em;
    padding: 0.5em;
    box-sizing: border-box;
    background-color: transparent;
    transition: background-color var(--transition-duration);
    will-change: background-color;
    display: flex;
    justify-content: center;
    align-items: center;
}

.tab-label:not(.label-selected):hover {
    cursor: pointer;
    background-color: var(--hovered-background-color);
    transform: translateZ(0);
}

.label-selected {
    background-color: var(--selected-background-color);
    transform: translateZ(0);
}

.component-slot {
    width: 100%;
    flex: 1;
    min-height: 0;
}

.component-container {
    width: 100%;
    height: 100%;
}
</style>
