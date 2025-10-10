import type { RightClickMenu } from "@/types";

import { defineStore } from "pinia";
import { ref } from "vue";

interface Point2D {
    x: number,
    y: number
};

export const useRightClickMenu = defineStore("rightClickMenu", () => {
    // 加载菜单项
    const menus = ref<Array<RightClickMenu>>([]);
    const pos = ref<Point2D>({ x: 0, y: 0 });
    const loadMenu = (mouseEvent: MouseEvent, menusVal: Array<RightClickMenu>) => {
        pos.value = { x: mouseEvent.clientX, y: mouseEvent.clientY };
        menus.value = menusVal;

        // 打开菜单
        open();
    };
    
    // 菜单打开/关闭
    const isOpened = ref<boolean>(false);
    const open = (): void => {
        isOpened.value = true;
    };
    const close = (): void => {
        isOpened.value = false;
    };
    const onClick = (index: number): void => {
        close();
        menus.value[index]?.onClick();
    };

    return {
        menus,
        pos,
        isOpened,

        loadMenu,
        close,
        onClick
    };
});
