// 时间格式化
export const timeFormat = (seconds: number): string => {
    const minute = Math.floor(seconds / 60).toString().padStart(2, "0");
    const second = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${minute}:${second}`;
};

// 日期格式化
export const dateFormat = (dateString: string): string => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Not a date";
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
};

// 首字母大写化
export const capitalizeFirstLetter = (word: string): string => {
    if (word.length === 0) return word;
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
};
