import { defineStore } from "pinia";
import { ref } from "vue";
import { useUser } from "/src/stores/User";

export const useTagSelector = defineStore("TagSelector", () => {
    const userStore = useUser();

    // 当前选项
    const currentTag = ref("home");
    const bannedWhenVisitor = ["playlist", "upload"];
    const selectTag = (tag) => {
        if (!userStore.isLogged && bannedWhenVisitor.includes(tag)) {
            return;
        }
        currentTag.value = tag;
    }
    const isSelected = (tag) => {
        return currentTag.value === tag;
    }

    return {
        currentTag,
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
