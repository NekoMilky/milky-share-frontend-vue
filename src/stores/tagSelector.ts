import { defineStore } from "pinia";
import { ref } from "vue";
import { useUser } from "./user";

export const useTagSelector = defineStore("tagSelector", () => {
    const userStore = useUser();

    // 当前选项
    const currentTag = ref<string>("home");
    const bannedWhenVisitor: Array<string> = ["playlist", "upload"];
    const checkBanned = (): void => {
        if (bannedWhenVisitor.includes(currentTag.value)) {
            selectTag("home");
        }
    };
    const selectTag = (tag: string): void => {
        if (!userStore.isLogged && bannedWhenVisitor.includes(tag)) {
            return;
        }
        currentTag.value = tag;
    };
    const isSelected = (tag: string): boolean => {
        return currentTag.value === tag;
    };

    return {
        currentTag,
        checkBanned,
        selectTag,
        isSelected
    };
}, {
    // 只缓存当前选项卡
    persist: {
        key: "TagSelector",
        storage: localStorage,
        serializer: {
            serialize(value) {
                return JSON.stringify({
                    currentTag: value.currentTag
                });
            },
            deserialize(value) {
                return JSON.parse(value);
            }
        }
    }
});
