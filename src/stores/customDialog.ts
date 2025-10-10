import type { JSONObject, DialogRow } from "@/types";

import { defineStore } from "pinia";
import { ref } from "vue";

import { checkEmptyField } from "@/utils";

interface KeyValuePair {
    key: string,
    value: unknown
};

export const useCustomDialog = defineStore("customDialog", () => {
    // 加载对话框
    const rows = ref<Array<DialogRow>>([]);
    const confirmAction = ref<Function | null>(null);
    const values = ref<JSONObject>({});
    const loadDialog = (
        rowsVal: Array<DialogRow>, 
        confirmAct: Function | null = null, 
        valList: Array<KeyValuePair> = []
    ):void => {
        values.value = {};
        rows.value = rowsVal;
        confirmAction.value = confirmAct;
        
        // 初始化值
        rows.value.forEach(row => {
            if (row.type === "input") values.value[row.key] = row.input?.value;
        });
        valList.forEach(val => values.value[val.key] = val.value);
        
        // 打开对话
        open();
    }; 

    // 打开/关闭对话框
    const isOpened = ref<boolean>(false);
    const open = (): void => {
        isOpened.value = true;
    };
    const close = (): void => {
        isOpened.value = false;
    };

    // 提交
    const submitDialog = (): void => {
        // 如果有必填项未填，取消本次提交
        for (const row of rows.value) {
            if (
                row.type === "input" 
                && row.input?.required 
                && !checkEmptyField(values.value[row.key], row.input.label)
            ) return;
        }

        // 关闭对话
        close();

        // 执行提交指令
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
