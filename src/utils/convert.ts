import type { IPicture } from "music-metadata";
import { isSuccessWithToast } from "./validation";

// 压缩图片
const compressImageWithSource = async (
    source: Blob | MediaSource, 
    format: string,
    maxSize: number
): Promise<File | null> => {
    try {
        // 转为image
        const imgUrl = URL.createObjectURL(source);
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = reject;
            image.src = imgUrl;
        });
        // 用canvas压缩
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            throw new Error();
        }
        // 计算
        let { width, height } = img;
        const scale = Math.min(maxSize / width, maxSize / height);
        if (scale < 1) {
            width = Math.round(width * scale);
            height = Math.round(height * scale);
        }
        canvas.width = width;
        canvas.height = height;
        // 压缩
        ctx.drawImage(img, 0, 0, width, height);
        // 转为blob
        const blobCompressed = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob(resolve, format, 0.5);
        });
        if (!blobCompressed) {
            throw new Error();
        }
        const filePostfix = format.split("/")[1] || "jpeg";
        return new File([blobCompressed], `file.${filePostfix}`, { type: format });
    }
    catch (error) {
        isSuccessWithToast({ message: "压缩图片时出错", success: false });
        return null;
    }
};
export const compressImage = async (
    source: File | IPicture, 
    maxSize: number = 256
): Promise<File | null> => {
    if (source instanceof File) {
        const file = source as File;
        const format = file.type || "image/jpeg";
        return await compressImageWithSource(file, format, maxSize);
    }
    else {
        const format = source.format;
        const byteArray = new Uint8Array(source.data);
        const blob = new Blob([byteArray], { type: format });
        return await compressImageWithSource(blob, format, maxSize);
    }
};

// 将图片转为URI预览
export const toURI = (source: IPicture): string | null => {
    try {
        const byteArray = new Uint8Array(source.data);
        let binary = "";
        for (let i = 0; i < byteArray.byteLength; i++) {
            binary += String.fromCharCode(byteArray[i] as number);
        }
        const base64 = window.btoa(binary);
        return `data:${source.format};base64,${base64}`;
    }
    catch (error) {
        isSuccessWithToast({ message: "转为URI时出错", success: false });
        return null;
    }
};
