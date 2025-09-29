import { defineStore } from "pinia";
import { ref } from "vue";
import type { RightClickMenu } from "@/types";

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
        open();
    };
    
    // 菜单打开/关闭
    const isOpened = ref(false);
    const open = () => {
        isOpened.value = true;
    };
    const close = () => {
        isOpened.value = false;
    };

    return {
        menus,
        pos,
        isOpened,
        loadMenu,
        close
    };
});
