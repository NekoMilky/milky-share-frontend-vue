export interface User {
    id: string,
    nickname: string,
    avatar: string | null
}

export interface Song {
    id: string,
    title: string,
    artist: string,
    album: string,
    duration: number,
    uploader?: string,
    cover: File | string | null,
    coverDisplay?: string | null,
    url?: string
};

export interface Playlist {
    id: string,
    name: string,
    cover: string | null,
    hasStared?: boolean,
    createTime?: string,
    createUser?: User
};
