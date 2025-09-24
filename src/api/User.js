import { sendPost } from "/src/api/Index";

export const login = async (nickname, password) => {
    const formData = new FormData();
    formData.append("nickname", nickname);
    formData.append("password", password);
    const response = await sendPost("user/login", formData, {});
    return response;
};

export const register = async (nickname, password) => {
    const formData = new FormData();
    formData.append("nickname", nickname);
    formData.append("password", password);
    const response = await sendPost("user/register", formData, {});
    return response;
};

export const get = async (userId) => {
    const formData = new FormData();
    formData.append("userId", userId);
    const response = await sendPost("user/get", formData, {});
    return response;
};

export const saveProfile = async (avatarFile, userInfo) => {
    const formData = new FormData();
    formData.append("avatar", avatarFile);
    formData.append("userId", userInfo.id);
    formData.append("nickname", userInfo.nickname);
    const response = await sendPost("user/save_profile", formData, {});
    return response;
};

export const checkNickname = async (nickname) => {
    const formData = new FormData();
    formData.append("nickname", nickname);
    const response = await sendPost("user/check_nickname", formData, {});
    return response;
};
