import { sendPost } from "/src/api/Index";

export const login = async (nickname, password) => {
    const data = {
        nickname: nickname,
        password: password
    };
    const response = await sendPost("user/login", data, {});
    return response;
};

export const register = async (nickname, password) => {
    const data = {
        nickname: nickname,
        password: password
    };
    const response = await sendPost("user/register", data, {});
    return response;
};

export const get = async (userId) => {
    const data = {
        userId: userId
    };
    const response = await sendPost("user/get", data, {});
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
    const data = {
        nickname: nickname
    };
    const response = await sendPost("user/check_nickname", data, {});
    return response;
};
