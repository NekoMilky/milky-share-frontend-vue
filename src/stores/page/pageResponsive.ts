import { defineStore } from "pinia";
import { computed } from "vue";

import { useWindowSize } from "@vueuse/core";

export const usePageResponsive = defineStore("pageResponsive", () => {
    const windowSize = useWindowSize();

    // 响应式页面系数
    const mediaCoefficient = computed<number>(() => {
        const viewportWidth = windowSize.width.value;
        return 1 - Math.min(Math.max((viewportWidth - 768) / 512, 0), 1);
    });

    // 根节点字体大小
    const rootFontSize = computed<string>(() => `${20 - 8 * mediaCoefficient.value}px`);
    
    return {
        mediaCoefficient,
        rootFontSize
    };
});
