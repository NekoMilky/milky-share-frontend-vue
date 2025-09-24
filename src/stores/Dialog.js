import { defineStore } from "pinia";
import { ref } from "vue";
import { checkEmptyField } from "/src/utils/Utility";
import { useToast } from "/src/stores/Toast";

export const useDialog = defineStore("Dialog", () => {
    const toastStore = useToast();

    // 加载对话框
    const rows = ref([]);
    const confirmAction = ref(null);
    const values = ref({});
    const loadDialog = (rowsVal, confirmAct = null, valList = []) => {
        values.value = {};
        rows.value = rowsVal;
        confirmAction.value = confirmAct;
        // 初始化值
        rows.value.forEach((row) => {
            if (row.type === "input") {
                values.value[row.key] = row.input.value;
            }
        });
        valList.forEach((val) => {
            values.value[val.key] = val.value;
        });
        // 打开对话
        open();
    };

    // 打开/关闭对话框
    const isOpened = ref(false);
    const open = () => {
        isOpened.value = true;
    };
    const close = () => {
        isOpened.value = false;
    };

    // 提交
    const submitDialog = () => {
        for (const row of rows.value) {
            if (row.type === "input" && row.input.required && !checkEmptyField(values.value[row.key], row.input.label)) {
                return;
            }
        }
        close();
        if (confirmAction.value) {
            confirmAction.value(values.value);
        }
    };

    return {
        rows,
        confirmAction,
        values,
        isOpened,
        loadDialog,
        submitDialog,
        close
    };
});
