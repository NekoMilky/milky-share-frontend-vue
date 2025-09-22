// 时间格式化
export const timeFormat = (seconds) => {
    const minute = Math.floor(seconds / 60);
    const second = Math.floor(seconds % 60);
    return `${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;
};
