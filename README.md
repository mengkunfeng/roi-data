# ROI 数据分析系统

## 项目简介

ROI 数据分析系统是一个用于分析应用安装 ROI（投资回报率）数据的前端应用，配合后端服务实现数据的导入、存储和可视化分析。

## 技术栈

### 前端

- **框架**: React + TypeScript
- **构建工具**: Umi.js (@umijs/max)
- **UI 组件**: Ant Design
- **图表库**: Recharts
- **状态管理**: Umi Model
- **HTTP 客户端**: Axios
- **样式**: Less + Tailwind CSS

## 项目结构

### 前端项目 (roi-data-analysis)

```
roi-data-analysis/
├── mock/               # 模拟数据
├── src/
│   ├── assets/         # 静态资源
│   ├── components/     # 公共组件
│   │   └── Guide/      # 引导组件
│   ├── constants/      # 常量定义
│   ├── models/         # 数据模型
│   ├── pages/          # 页面组件
│   │   └── Home/       # 首页/数据分析页面
│   ├── services/       # API 服务
│   ├── types/          # TypeScript 类型定义
│   ├── utils/          # 工具函数
│   ├── access.ts       # 权限管理
│   └── app.ts          # 应用配置
├── .umirc.ts           # Umi 配置文件
└── package.json        # 项目依赖
```

## 各文件模块的作用

### 前端文件

- **src/pages/Home/index.tsx**: 主页面，显示 ROI 数据分析图表和数据
- **src/components/Guide/**: 引导组件，用于首次使用时的用户引导
- **src/services/index.ts**: API 服务，处理与后端的通信
- **src/utils/format.ts**: 工具函数，用于数据格式化
- **src/models/global.ts**: 全局数据模型，管理应用状态
- **src/constants/index.ts**: 常量定义，如 API 路径、配置参数等
- **src/types/index.ts**: TypeScript 类型定义
- **.umirc.ts**: Umi 配置文件，包含路由、代理等配置

## 项目启动方式

### 前端启动

1. 进入前端项目目录

   ```bash
   cd roi-data-analysis
   ```

2. 安装依赖

   ```bash
   pnpm install
   # 或使用 npm
   npm install
   ```

3. 启动开发服务器

   ```bash
   pnpm dev
   # 或使用 npm
   npm run dev
   ```

4. 访问应用打开浏览器访问 http://localhost:8000
