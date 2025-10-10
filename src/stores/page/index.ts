export * from "@/stores/page/pageConfig";
export * from "@/stores/page/pageResponsive";

import type { Page, PageConfig } from "@/types";

import { defineStore } from "pinia";
import { computed } from "vue";

import { useUser } from "@/stores/user";
import { usePageConfig } from "@/stores/page/pageConfig";

import DefaultAvatarImage from "@/assets/images/default/avatar.png";

// 类型转换：页面配置=>页面
const transformPageConfig = (pageConfig: PageConfig): Page => {
    const userStore = useUser();

    // 页面侧边栏图标及标签
    let iconSrc = pageConfig.iconSrc;
    let label = pageConfig.label;
    let parameter: string | undefined = void 0;

    if (pageConfig.name === "profile") {
        iconSrc = userStore.user.avatar ?? DefaultAvatarImage;
        label = userStore.user.nickname ?? "未知";
        parameter = userStore.user.nickname;
    }

    // 路径处理
    let path = `/${pageConfig.name}`;
    let pathWithParameter = path;
    if (typeof parameter === "string") {
        path += "/:parameter";
        pathWithParameter += `/${parameter}`;
    }

    return { 
        ...pageConfig, 
        iconSrc: iconSrc,
        label: label,
        path: path,
        parameter: parameter,
        pathWithParameter: pathWithParameter
    } as Page;
};

export const usePage = defineStore("page", () => {
    const userStore = useUser();
    const pageConfigStore = usePageConfig();

    // 页面列表
    const pages = computed<Array<Page>>(
        () => pageConfigStore.basePages.map(pageConfig => transformPageConfig(pageConfig))
    );

    // 页面访问权限检查
    const hasPermissionOfPage = (page: Page): boolean => {
        if (page.requireRole === "onlyUser" && !userStore.isLogged) return false;
        if (page.requireRole === "onlyGuest" && userStore.isLogged) return false;
        return true;
    };

    return {
        pages,
        hasPermissionOfPage
    };
});
