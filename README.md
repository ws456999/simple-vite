# simple-vite

A project to explain how vite works, explain how esbuild works in vite

实现了vite基础功能
- esbuild预构建
- 模块解析
- 静态资源处理

## 原理（候补）
实现步骤详见分支

- init，初始化vite项目
- step-1 创建koa应用
- step-2 解析 ts/tsx
- step-3 node_modules依赖解析
- step-4 react组件自动加后缀 .ts .tsx
- step-5 esbuild 解析依赖
- step-6 esbuild cjs => es module
- step-7 依赖预构建
- step-8 解析css
- step-9 解析svg
- master 代码结构重构