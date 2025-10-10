import { customRef, type Ref } from "vue";

// 带防抖的ref
export const debouncedRef = <T>(value: T, delay = 1000): Ref<T> => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    return customRef<T>((track, trigger) => {
        return {
            get: () => {
                track();
                return value;
            },
            set: (newValue: T) => {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
                timeoutId = setTimeout(() => {
                    value = newValue;
                    trigger();
                    timeoutId = null;
                }, delay);
            }
        };
    });
};
