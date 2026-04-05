import { defineConfig } from '@umijs/max';

export default defineConfig({
  hash: true,
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: {
    title: '数据分析',
    menuRender: false, // 全局隐藏左侧侧边栏
    menuHeaderRender: false, // 可选：隐藏侧边栏顶部logo
    // headerRender: false, // 可选：同时隐藏顶部导航
  },
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    },
  },
  routes: [
    {
      path: '/',
      redirect: '/home',
    },
    {
      name: '数据分析',
      path: '/home',
      component: './Home',
      hideMenu: false,
      layout: false,
    },
  ],
  npmClient: 'pnpm',
  esbuildMinifyIIFE: true,
});

