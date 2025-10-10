import { createRouter, createWebHistory } from "vue-router";
import { capitalizeFirstLetter } from "@/utils";
import { usePage } from "@/stores/page";

// 路由配置
const router = createRouter({
    history: createWebHistory(),
    routes: []
});

// 生成路由
export const setupRoutes = (): void => {
    const pageStore = usePage();
    pageStore.pages.forEach(page => {
        const path = page.path as string;
        if (page.name === "home") {
            router.addRoute({ path: "/", redirect: path });
        }
        router.addRoute({
            name: page.name,
            path: path,
            component: () => import(`@/views/${capitalizeFirstLetter(page.name)}.vue`),
            props: typeof page.parameter === "string" ? true : false
        });
    });
};

// 前置守卫
router.beforeEach(to => {
    const pageStore = usePage();
    const target = pageStore.pages.find(page => page.name === to.name);
    if (!target || !pageStore.hasPermissionOfPage(target)) {
        return { path: "/" };
    }
});

export default router;
