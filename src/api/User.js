import { sendPost } from "/src/api/Index";

export const userLogin = async (nickname, password) => {
    const formData = new FormData();
    formData.append("nickname", nickname);
    formData.append("password", password);
    const response = await sendPost("user/login", formData, {});
    return response;
};

export const userRegister = async (nickname, password) => {
    const formData = new FormData();
    formData.append("nickname", nickname);
    formData.append("password", password);
    const response = await sendPost("user/register", formData, {});
    return response;
};

export const getUser = async (id) => {
    const formData = new FormData();
    formData.append("id", id);
    const response = await sendPost("user/get", formData, {});
    return response;
};

export const saveUserProfile = async (avatarFile, userInfo) => {
    const formData = new FormData();
    formData.append("avatar", avatarFile);
    formData.append("id", userInfo.id);
    formData.append("nickname", userInfo.nickname);
    const response = await sendPost("user/save_profile", formData, {});
    return response;
};
