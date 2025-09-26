import { isSuccessWithToast } from "/src/utils/Utility";

// 压缩图片
export const compressImage = async (file, maxSize = 256) => {
    try {
        // 读取格式
        const format = file.type || "image/jpeg";
        // 转为image
        const imgUrl = URL.createObjectURL(file);
        const img = await new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = reject;
            image.src = imgUrl;
        });
        // 用canvas压缩
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        let { width, height } = img;
        const scale = Math.min(maxSize / width, maxSize / height);
        if (scale < 1) {
            width = Math.round(width * scale);
            height = Math.round(height * scale);
        }
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        // 转为blob
        const blobCompressed = await new Promise((resolve) => canvas.toBlob(resolve, format, 0.5));
        const filePostfix = format.split("/")[1] || "jpeg";
        return new File([blobCompressed], `file.${filePostfix}`, { type: format });
    }
    catch (error) {
        isSuccessWithToast({ message: "压缩图片时出错", success: false, error: error });
        return null;
    }
};
