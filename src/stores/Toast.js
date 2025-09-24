import { defineStore } from "pinia";
import { ref } from "vue";

export const useToast = defineStore("Toast", () => {
    const delay = (ms) => {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    // 消息列表
    const messages = ref([]);
    const generateId = () => {
        return Date.now().toString() + Math.floor(Math.random() * 10000).toString();
    };
    const findIndexById = (id) => {
        return messages.value.findIndex((item) => item.id === id);
    };
    const addMessage = async (response) => {
        const message = {
            id: generateId(),
            message: response.message,
            success: response.success,
            opacity: 1
        };
        messages.value.push(message);
        let index;
        // 5s后修改不透明度
        await delay(5000);
        index = findIndexById(message.id);
        if (index !== -1) {
            messages.value[index].opacity = 0;
        }
        // 0.3s后删除
        await delay(300);
        index = findIndexById(message.id);
        if (index !== -1) {
            messages.value.splice(index, 1);
        }
    };

    return {
        messages,
        addMessage
    };
});
