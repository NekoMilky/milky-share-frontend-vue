import { defineStore } from "pinia";
import { ref } from "vue";

export const useRightClickMenu = defineStore("RightClickMenu", () => {
    // 加载菜单项
    const menus = ref([]);
    const pos = ref({ x: 0, y: 0 });
    const loadMenu = (mouseEvent, menusVal) => {
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
    const click = (index) => {
        close();
        if (menus.value[index].onClick) {
            menus.value[index].onClick();
        }
    };

    return {
        menus,
        pos,
        isOpened,
        loadMenu,
        close,
        click
    };
});
